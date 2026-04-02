import {
  Analyzer,
  BoolQuery,
  DocumentIndex,
  EdgeNgramsTokenFilter,
  KeywordTokenizer,
  MatchPhrase,
  MatchQuery,
  OP,
  NgramTokenFilter,
  RankingAlgorithm,
  TextFieldIndex,
  VectorFieldIndex,
  createSeededRandom,
  reciprocalRankFusion,
} from "@tryformation/querylight-ts";

type SearchRecord = {
  id: string;
  kind: "page" | "section" | "chunk";
  title: string;
  description: string;
  content: string;
  permalink: string;
  page_permalink: string;
  page_title: string;
  section: string;
  type: string;
  image: string;
  topics: string[];
  headings: string[];
  date: string;
  source_label: string;
  anchor: string;
};

type SearchPayload = {
  version: string;
  locale: string;
  generated_at: string;
  payload_hash: string;
  records: SearchRecord[];
  indexes: {
    lexical: unknown;
    fuzzy: unknown;
  };
  semantic: {
    model: {
      modelId: string;
      dimensions: number;
      chunkingVersion: string;
      pooling: string;
      normalized: boolean;
    };
    randomSeed: number;
    numHashTables: number;
    vectorIndex: unknown;
  };
};

type SearchRuntime = {
  payload: SearchPayload;
  recordsById: Map<string, SearchRecord>;
  vectorRecordIds: Set<string>;
  lexical: DocumentIndex;
  fuzzy: DocumentIndex;
  vector: VectorFieldIndex;
  embedQuery: (query: string) => Promise<number[]>;
};

type SearchResult = {
  query: string;
  lexicalHits: Array<[string, number]>;
  fuzzyHits: Array<[string, number]>;
  vectorHits: Array<[string, number]>;
  finalHits: Array<[string, number]>;
  records: Array<SearchRecord & { score: number }>;
};

const tagAnalyzer = new Analyzer([], new KeywordTokenizer());
const fuzzyAnalyzer = new Analyzer(undefined, undefined, [new NgramTokenFilter(3)]);
const edgeAnalyzer = new Analyzer(undefined, undefined, [new EdgeNgramsTokenFilter(2, 10)]);
const PAYLOAD_CACHE_NAME = "open-rtls-site-search-v1";
const VECTOR_WINDOW_SIZE = 24;
const MIN_VECTOR_SCORE = 0.45;

let embeddingExtractorPromise: Promise<(input: string) => Promise<number[]>> | null = null;
const runtimePromiseCache = new Map<string, Promise<SearchRuntime>>();
const preloadedPayloadUrls = new Set<string>();

function normalizeWhitespace(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function excerpt(value: unknown, maxLength = 180): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(value: string, query: string): string {
  const tokens = normalizeWhitespace(query)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .sort((left, right) => right.length - left.length);

  if (!tokens.length || !value) return escapeHtml(value);

  let highlighted = escapeHtml(value);
  tokens.forEach((token) => {
    const regex = new RegExp(`(${escapeRegex(token)})`, "gi");
    highlighted = highlighted.replace(regex, '<mark class="search-highlight">$1</mark>');
  });
  return highlighted;
}

function createLexicalIndex(): DocumentIndex {
  return new DocumentIndex({
    title: new TextFieldIndex(undefined, undefined, RankingAlgorithm.BM25),
    description: new TextFieldIndex(undefined, undefined, RankingAlgorithm.BM25),
    body: new TextFieldIndex(undefined, undefined, RankingAlgorithm.BM25),
    topics: new TextFieldIndex(tagAnalyzer, tagAnalyzer),
    permalink: new TextFieldIndex(undefined, undefined, RankingAlgorithm.BM25),
    section: new TextFieldIndex(tagAnalyzer, tagAnalyzer),
    kind: new TextFieldIndex(tagAnalyzer, tagAnalyzer),
    suggest: new TextFieldIndex(edgeAnalyzer, edgeAnalyzer, RankingAlgorithm.BM25),
  });
}

function createFuzzyIndex(): DocumentIndex {
  return new DocumentIndex({
    combined: new TextFieldIndex(fuzzyAnalyzer, fuzzyAnalyzer, RankingAlgorithm.BM25),
  });
}

function buildLexicalQuery(query: string): BoolQuery | null {
  const trimmed = normalizeWhitespace(query);
  if (!trimmed) return null;

  return new BoolQuery({
    should: [
      new MatchPhrase({ field: "title", text: trimmed, slop: 1, boost: 8 }),
      new MatchPhrase({ field: "body", text: trimmed, slop: 2, boost: 3 }),
      new MatchQuery({ field: "title", text: trimmed, operation: OP.OR, boost: 6 }),
      new MatchQuery({ field: "description", text: trimmed, operation: OP.OR, boost: 3 }),
      new MatchQuery({ field: "body", text: trimmed, operation: OP.OR, boost: 2.2 }),
      new MatchQuery({ field: "topics", text: trimmed, operation: OP.OR, boost: 2 }),
      new MatchQuery({ field: "permalink", text: trimmed, operation: OP.OR, boost: 1.5 }),
      ...(trimmed.length >= 2
        ? [new MatchQuery({ field: "suggest", text: trimmed, operation: OP.OR, prefixMatch: true, boost: 3 })]
        : []),
    ],
  });
}

function buildFuzzyQuery(query: string): MatchQuery | null {
  const trimmed = normalizeWhitespace(query);
  if (!trimmed) return null;
  return new MatchQuery({ field: "combined", text: trimmed, operation: OP.OR, boost: 1.5 });
}

async function readGzippedJson(response: Response): Promise<SearchPayload> {
  if (!response.ok) {
    throw new Error(`Failed to load search payload: ${response.status} ${response.statusText}`);
  }
  if (!response.body) {
    throw new Error("Search payload response body is missing.");
  }
  if (typeof DecompressionStream !== "function") {
    throw new Error("This browser does not support gzip-compressed search payloads.");
  }

  const decompressed = response.body.pipeThrough(new DecompressionStream("gzip"));
  return (await new Response(decompressed).json()) as SearchPayload;
}

async function fetchPayloadWithPersistentCache(url: string): Promise<Response> {
  if (!("caches" in window)) {
    return await fetch(url, { credentials: "same-origin" });
  }

  const cache = await window.caches.open(PAYLOAD_CACHE_NAME);
  const cached = await cache.match(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, { credentials: "same-origin" });
  if (response.ok) {
    await cache.put(url, response.clone());
  }
  return response;
}

async function loadPayload(url: string): Promise<SearchPayload> {
  const response = await fetchPayloadWithPersistentCache(url);
  return await readGzippedJson(response);
}

async function createEmbeddingExtractor(modelId: string): Promise<(input: string) => Promise<number[]>> {
  embeddingExtractorPromise ??= (async () => {
    const { pipeline } = await import("@huggingface/transformers");
    const extractor = await pipeline("feature-extraction", modelId);
    return async (input: string) => {
      const output = await extractor(input, { pooling: "mean", normalize: true });
      return output.tolist()[0] as number[];
    };
  })();

  return await embeddingExtractorPromise;
}

export function createRuntimeFromPayload(payload: SearchPayload): SearchRuntime {
  const records = Array.isArray(payload.records) ? payload.records : [];
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const vectorRecordIds = new Set(
    records.filter((record) => record.kind === "section" || record.kind === "chunk").map((record) => record.id),
  );

  return {
    payload,
    recordsById,
    vectorRecordIds,
    lexical: createLexicalIndex().loadState(payload.indexes.lexical as never),
    fuzzy: createFuzzyIndex().loadState(payload.indexes.fuzzy as never),
    vector: new VectorFieldIndex({
      dimensions: payload.semantic.model.dimensions,
      numHashTables: payload.semantic.numHashTables,
      random: createSeededRandom(payload.semantic.randomSeed),
    }).loadState(payload.semantic.vectorIndex as never),
    embedQuery: async (query: string) => {
      const extractor = await createEmbeddingExtractor(payload.semantic.model.modelId);
      return await extractor(query);
    },
  };
}

function resolvePayloadUrl(widget?: HTMLElement | null): string {
  const dataUrl = widget?.dataset.searchIndex;
  if (dataUrl) return dataUrl;
  const lang = document.documentElement.lang || "en";
  return `/data/site-search-${lang}.json.gz`;
}

async function getRuntime(widget?: HTMLElement | null): Promise<SearchRuntime> {
  const payloadUrl = resolvePayloadUrl(widget);
  if (!runtimePromiseCache.has(payloadUrl)) {
    runtimePromiseCache.set(
      payloadUrl,
      (async () => {
        const payload = await loadPayload(payloadUrl);
        return createRuntimeFromPayload(payload);
      })(),
    );
  }
  return await runtimePromiseCache.get(payloadUrl)!;
}

async function searchRuntime(runtime: SearchRuntime, query: string): Promise<SearchResult> {
  const trimmed = normalizeWhitespace(query);
  if (!trimmed) {
    return { query: "", lexicalHits: [], fuzzyHits: [], vectorHits: [], finalHits: [], records: [] };
  }

  const lexicalHits = await runtime.lexical.searchRequest({
    query: buildLexicalQuery(trimmed),
    limit: Number.MAX_SAFE_INTEGER,
  });
  const fuzzyHits = await runtime.fuzzy.searchRequest({
    query: buildFuzzyQuery(trimmed),
    limit: 120,
  });

  const lexicalFuzzyHits = reciprocalRankFusion([lexicalHits, fuzzyHits], {
    rankConstant: 20,
    weights: [3, 1],
  });

  let vectorHits: Array<[string, number]> = [];
  const shouldUseVector = trimmed.length >= 3 && (trimmed.includes(" ") || trimmed.length >= 16);
  if (shouldUseVector) {
    const candidateIds = lexicalFuzzyHits
      .map(([id]) => id)
      .filter((id) => runtime.vectorRecordIds.has(id))
      .slice(0, VECTOR_WINDOW_SIZE);

    if (candidateIds.length > 0) {
      const queryVector = await runtime.embedQuery(trimmed);
      vectorHits = await runtime.vector.rerankAsync(queryVector, candidateIds, candidateIds.length);
      vectorHits = vectorHits.filter(([, score]) => score >= MIN_VECTOR_SCORE);
    }
  }

  const finalHits = vectorHits.length
    ? reciprocalRankFusion([lexicalFuzzyHits, vectorHits], {
        rankConstant: 20,
        weights: [3, 1],
      })
    : lexicalFuzzyHits;

  const collapsedRecords = new Map<string, SearchRecord & { score: number }>();
  finalHits
    .map(([id, score]) => {
      const record = runtime.recordsById.get(id);
      return record ? { ...record, score } : null;
    })
    .filter((record): record is SearchRecord & { score: number } => record !== null)
    .forEach((record) => {
      const collapseKey = record.permalink || record.page_permalink || record.id;
      const existing = collapsedRecords.get(collapseKey);
      if (!existing || record.score > existing.score) {
        collapsedRecords.set(collapseKey, record);
      }
    });

  return {
    query: trimmed,
    lexicalHits,
    fuzzyHits,
    vectorHits,
    finalHits,
    records: Array.from(collapsedRecords.values()),
  };
}

function buildMeta(record: SearchRecord): string {
  const parts = [
    record.section,
    record.kind === "chunk" ? "Paragraph match" : record.kind === "section" ? "Section match" : "Page match",
    record.date,
  ]
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);

  return parts.join(" / ");
}

function buildCard(record: SearchRecord & { score: number }, query: string, highlight = false): string {
  const title = highlight ? highlightText(record.title || record.page_title, query) : escapeHtml(record.title || record.page_title);
  const detailsSource = record.kind === "chunk" ? record.content : record.description || record.content;
  const details = excerpt(detailsSource, record.kind === "chunk" ? 220 : 180);
  const detailsHtml = highlight ? highlightText(details, query) : escapeHtml(details);
  const meta = buildMeta(record);
  const sourceLabel = record.kind === "page" ? "" : escapeHtml(record.source_label || record.page_title);

  return `
    <a class="search-result-card group block rounded-2xl border border-line bg-white p-5 no-underline transition hover:-translate-y-0.5 hover:border-ink" href="${escapeHtml(
      record.permalink || record.page_permalink,
    )}">
      ${meta ? `<div class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">${escapeHtml(meta)}</div>` : ""}
      <h3 class="mt-3 text-lg font-semibold text-ink">${title}</h3>
      ${sourceLabel ? `<div class="mt-2 text-sm font-medium text-muted">${sourceLabel}</div>` : ""}
      ${details ? `<div class="mt-3 text-sm leading-relaxed text-muted">${detailsHtml}</div>` : ""}
    </a>
  `;
}

function setStatus(element: HTMLElement | null, message: string): void {
  if (element) {
    element.textContent = message;
  }
}

function renderLoadingState(
  container: HTMLElement | null,
  status: HTMLElement | null,
  message: string,
  count: number,
): void {
  setStatus(status, message);
  if (!container) return;

  const cards = Array.from({ length: Math.max(1, Math.min(count, 4)) }, () => `
    <div class="rounded-2xl border border-line bg-white p-5">
      <div class="flex flex-col gap-3 animate-pulse">
        <div class="h-3 w-28 rounded-full bg-neutral-100"></div>
        <div class="h-6 w-2/3 rounded-full bg-neutral-200"></div>
        <div class="h-4 w-full rounded-full bg-neutral-100"></div>
        <div class="h-4 w-5/6 rounded-full bg-neutral-100"></div>
      </div>
    </div>
  `);

  container.innerHTML = cards.join("");
}

function scheduleBackgroundPreload(widget: HTMLElement): void {
  const payloadUrl = resolvePayloadUrl(widget);
  if (preloadedPayloadUrls.has(payloadUrl)) return;
  preloadedPayloadUrls.add(payloadUrl);

  const preload = () => {
    void getRuntime(widget).catch((error) => {
      console.error(error);
      preloadedPayloadUrls.delete(payloadUrl);
    });
  };

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, options?: { timeout: number }) => number }).requestIdleCallback(
      preload,
      { timeout: 1500 },
    );
    return;
  }

  window.setTimeout(preload, 150);
}

function renderResults(options: {
  records: Array<SearchRecord & { score: number }>;
  container: HTMLElement | null;
  status: HTMLElement | null;
  label: string;
  emptyText: string;
  noResultsText: string;
  query: string;
  limit: number;
  highlight: boolean;
}): void {
  const { records, container, status, label, emptyText, noResultsText, query, limit, highlight } = options;
  if (!container) return;

  container.innerHTML = "";
  if (!query) {
    setStatus(status, emptyText);
    return;
  }
  if (!records.length) {
    setStatus(status, `${noResultsText} "${query}"`);
    return;
  }

  setStatus(status, `${label} "${query}"`);
  container.innerHTML = records.slice(0, limit).map((record) => buildCard(record, query, highlight)).join("");
}

function debounce(fn: (query: string) => void, delay: number): (query: string) => void {
  let timer: number | undefined;
  return (query: string) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(query), delay);
  };
}

export function initSearchWidgets(): void {
  const widgets = Array.from(document.querySelectorAll<HTMLElement>("[data-search-widget]"));
  if (!widgets.length) return;

  widgets.forEach((widget) => {
    const input = widget.querySelector<HTMLInputElement>("[data-search-input]");
    const popup = widget.querySelector<HTMLElement>("[data-search-popup]");
    const results = widget.querySelector<HTMLElement>("[data-search-results]");
    const status = widget.querySelector<HTMLElement>("[data-search-status]");
    const moreWrap = widget.querySelector<HTMLElement>("[data-search-more-wrap]");
    const moreLink = widget.querySelector<HTMLAnchorElement>("[data-search-more-link]");
    const controls = widget.querySelector<HTMLElement>("[data-search-controls]");
    const clearButton = widget.querySelector<HTMLElement>("[data-search-clear]");
    if (!input || !results) return;

    const label = widget.dataset.searchResultsLabel || "Results for";
    const emptyText = widget.dataset.searchEmpty || "Type something to search.";
    const noResultsText = widget.dataset.searchNoResults || "No results for";
    const errorText = widget.dataset.searchError || "Search payload not found.";
    const loadingText = widget.dataset.searchLoading || "Searching...";
    const limit = Number(widget.dataset.searchLimit || 6);
    const highlight = widget.dataset.searchHighlight === "true";

    const showPopup = () => popup?.classList.remove("hidden");
    const hidePopup = () => popup?.classList.add("hidden");
    const updateControls = () => controls?.classList.toggle("hidden", input.value.trim().length === 0);

    const searchAndRender = async (query: string) => {
      try {
        renderLoadingState(results, status, loadingText, limit);
        const runtime = await getRuntime(widget);
        const searchResult = await searchRuntime(runtime, query);

        renderResults({
          records: searchResult.records,
          container: results,
          status,
          label,
          emptyText,
          noResultsText,
          query,
          limit,
          highlight,
        });

        if (moreWrap && moreLink) {
          if (query && searchResult.records.length > 0) {
            moreLink.href = `${moreLink.href.split("?")[0]}?q=${encodeURIComponent(query)}`;
            moreWrap.classList.remove("hidden");
          } else {
            moreWrap.classList.add("hidden");
          }
        }
      } catch (error) {
        console.error(error);
        setStatus(status, error instanceof Error ? error.message || errorText : errorText);
      }
    };

    const debouncedSearch = debounce((query) => {
      if (popup) showPopup();
      void searchAndRender(query);
    }, 180);

    input.addEventListener("focus", () => {
      scheduleBackgroundPreload(widget);
      if (input.value.trim().length >= 2 && popup) {
        showPopup();
      }
    });

    input.addEventListener("input", (event) => {
      updateControls();
      const query = normalizeWhitespace((event.target as HTMLInputElement).value);

      if (query.length < 2) {
        renderResults({
          records: [],
          container: results,
          status,
          label,
          emptyText,
          noResultsText,
          query: "",
          limit,
          highlight,
        });
        hidePopup();
        moreWrap?.classList.add("hidden");
        return;
      }

      debouncedSearch(query);
    });

    clearButton?.addEventListener("click", (event) => {
      event.preventDefault();
      input.value = "";
      updateControls();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    });

    document.addEventListener("click", (event) => {
      if (popup && !widget.contains(event.target as Node)) {
        hidePopup();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hidePopup();
      }
    });

    const initialQuery = new URLSearchParams(window.location.search).get("q");
    if (initialQuery) {
      input.value = initialQuery;
      updateControls();
      if (popup) showPopup();
      void searchAndRender(initialQuery);
    } else {
      renderResults({
        records: [],
        container: results,
        status,
        label,
        emptyText,
        noResultsText,
        query: "",
        limit,
        highlight,
      });
      updateControls();
    }
  });
}
