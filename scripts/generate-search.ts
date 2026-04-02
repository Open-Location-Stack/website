#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { env, pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";
import {
  Analyzer,
  DocumentIndex,
  EdgeNgramsTokenFilter,
  KeywordTokenizer,
  NgramTokenFilter,
  RankingAlgorithm,
  TextFieldIndex,
  VectorFieldIndex,
  createSeededRandom,
} from "@tryformation/querylight-ts";

type SearchSourcePage = {
  lang: string;
  url: string;
  title: string;
  summary?: string;
  headings?: string;
  content?: string;
  keywords?: string[];
  tags?: string[];
  date?: string;
  section?: string;
  type?: string;
  image?: string;
};

type SearchRecord = {
  id: string;
  locale: string;
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
  vector_text: string;
};

type EmbeddingManifestEntry = {
  hash: string;
  cache_file: string;
};

type EmbeddingManifest = Record<string, EmbeddingManifestEntry>;

const SEARCH_GENERATOR_VERSION = "2026-04-02.1";
const CHUNKING_VERSION = "2026-04-02.1";
const MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const RANDOM_SEED = 42;
const NUM_HASH_TABLES = 18;
const LANGS = ["en"] as const;

const tagAnalyzer = new Analyzer([], new KeywordTokenizer());
const fuzzyAnalyzer = new Analyzer(undefined, undefined, [new NgramTokenFilter(3)]);
const edgeAnalyzer = new Analyzer(undefined, undefined, [new EdgeNgramsTokenFilter(2, 10)]);

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function slugify(value: string): string {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeWhitespace(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function splitParagraphs(value: string): string[] {
  return String(value ?? "")
    .split(/\n+/g)
    .map((entry) => normalizeWhitespace(entry))
    .filter((entry) => entry.length >= 80);
}

function excerpt(value: string, maxLength = 220): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function resolveLocaleSearchSourcePath(publicDir: string, locale: string): string {
  if (locale === "en") {
    return path.join(publicDir, "searchsource.json");
  }
  return path.join(publicDir, locale, "searchsource.json");
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

function splitLines(value: string): string[] {
  return String(value ?? "")
    .split(/\n+/g)
    .map((entry) => normalizeWhitespace(entry))
    .filter(Boolean);
}

function toTopics(page: SearchSourcePage): string[] {
  return [...(Array.isArray(page.keywords) ? page.keywords : []), ...(Array.isArray(page.tags) ? page.tags : [])]
    .map((entry) => normalizeWhitespace(entry))
    .filter(Boolean);
}

function sectionPermalink(pageUrl: string, anchor: string): string {
  if (!anchor) return pageUrl;
  return `${pageUrl}#${anchor}`;
}

function buildPageRecord(locale: string, page: SearchSourcePage): SearchRecord {
  const topics = toTopics(page);
  const content = normalizeWhitespace(page.content ?? "");
  return {
    id: `page:${page.url}`,
    locale,
    kind: "page",
    title: normalizeWhitespace(page.title),
    description: normalizeWhitespace(page.summary ?? ""),
    content,
    permalink: page.url,
    page_permalink: page.url,
    page_title: normalizeWhitespace(page.title),
    section: normalizeWhitespace(page.section ?? page.type ?? "pages"),
    type: normalizeWhitespace(page.type ?? ""),
    image: normalizeWhitespace(page.image ?? ""),
    topics,
    headings: splitLines(page.headings ?? ""),
    date: normalizeWhitespace(page.date ?? ""),
    source_label: normalizeWhitespace(page.title),
    anchor: "",
    vector_text: [page.title, page.summary, content, topics.join(" ")].filter(Boolean).join("\n"),
  };
}

function buildSectionRecords(locale: string, page: SearchSourcePage): SearchRecord[] {
  const pageTopics = toTopics(page);
  const headings = Array.from(
    new Set(splitLines(page.headings ?? "").filter((heading) => heading && heading !== normalizeWhitespace(page.title))),
  );

  if (headings.length === 0) {
    return [];
  }

  const sourceContent = String(page.content ?? "");
  const fallbackSections: SearchRecord[] = [];
  let searchStart = 0;

  headings.forEach((heading, index) => {
    const start = sourceContent.indexOf(heading, searchStart);
    if (start === -1) {
      return;
    }

    const nextHeading = headings
      .slice(index + 1)
      .find((candidate) => sourceContent.indexOf(candidate, start + heading.length) !== -1);
    const end = nextHeading ? sourceContent.indexOf(nextHeading, start + heading.length) : sourceContent.length;
    searchStart = start + heading.length;
    const content = normalizeWhitespace(sourceContent.slice(start, end));

    if (content.length < 50) {
      return;
    }

    const anchor = slugify(heading);
    fallbackSections.push({
      id: `section:${page.url}#${anchor || `section-${index + 1}`}`,
      locale,
      kind: "section",
      title: heading,
      description: excerpt(content, 180),
      content,
      permalink: sectionPermalink(page.url, anchor),
      page_permalink: page.url,
      page_title: normalizeWhitespace(page.title),
      section: normalizeWhitespace(page.section ?? page.type ?? "pages"),
      type: normalizeWhitespace(page.type ?? ""),
      image: normalizeWhitespace(page.image ?? ""),
      topics: pageTopics,
      headings: [heading],
      date: normalizeWhitespace(page.date ?? ""),
      source_label: heading,
      anchor,
      vector_text: [page.title, heading, content, page.summary, pageTopics.join(" ")].filter(Boolean).join("\n"),
    });
  });

  return fallbackSections;
}

function resolveSectionAnchorForChunk(sectionRecords: SearchRecord[], index: number): SearchRecord | null {
  if (!sectionRecords.length) return null;
  return sectionRecords[Math.min(index, sectionRecords.length - 1)] ?? sectionRecords[sectionRecords.length - 1] ?? null;
}

function buildChunkRecords(locale: string, page: SearchSourcePage, sectionRecords: SearchRecord[]): SearchRecord[] {
  const chunks: SearchRecord[] = [];
  const sectionSources = sectionRecords.length
    ? sectionRecords.map((sectionRecord) => ({
        anchor: sectionRecord.anchor,
        title: sectionRecord.title,
        content: sectionRecord.content,
      }))
    : [{ anchor: "", title: page.title, content: page.content ?? "" }];

  sectionSources.forEach((sectionSource, sectionIndex) => {
    const paragraphs = splitParagraphs(sectionSource.content ?? "");
    const fallbackSection = resolveSectionAnchorForChunk(sectionRecords, sectionIndex);

    paragraphs.forEach((paragraph, paragraphIndex) => {
      const chunkAnchor = normalizeWhitespace(sectionSource.anchor ?? fallbackSection?.anchor ?? "");
      const permalink = sectionPermalink(page.url, chunkAnchor);
      const sourceLabel = normalizeWhitespace(sectionSource.title ?? fallbackSection?.title ?? page.title);

      chunks.push({
        id: `chunk:${page.url}:${sectionIndex + 1}:${paragraphIndex + 1}`,
        locale,
        kind: "chunk",
        title: sourceLabel || normalizeWhitespace(page.title),
        description: excerpt(paragraph, 180),
        content: paragraph,
        permalink,
        page_permalink: page.url,
        page_title: normalizeWhitespace(page.title),
        section: normalizeWhitespace(page.section ?? page.type ?? "pages"),
        type: normalizeWhitespace(page.type ?? ""),
        image: normalizeWhitespace(page.image ?? ""),
        topics: toTopics(page),
        headings: [sourceLabel, normalizeWhitespace(page.title)].filter(Boolean),
        date: normalizeWhitespace(page.date ?? ""),
        source_label: sourceLabel || normalizeWhitespace(page.title),
        anchor: chunkAnchor,
        vector_text: [page.title, sourceLabel, page.summary, paragraph, toTopics(page).join(" ")].filter(Boolean).join("\n"),
      });
    });
  });

  return chunks;
}

async function getEmbeddingExtractor(): Promise<FeatureExtractionPipeline> {
  extractorPromise ??= pipeline("feature-extraction", MODEL_ID);
  return extractorPromise;
}

async function embedText(value: string): Promise<number[]> {
  const extractor = await getEmbeddingExtractor();
  const output = await extractor(value, { pooling: "mean", normalize: true });
  return output.tolist()[0] as number[];
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function loadSearchSource(publicDir: string, locale: string): Promise<SearchSourcePage[]> {
  const filePath = resolveLocaleSearchSourcePath(publicDir, locale);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as SearchSourcePage[];
}

async function writePayloadCopies(rootDir: string, locale: string, serialized: string): Promise<void> {
  const fileName = `site-search-${locale}.json.gz`;
  const gzip = gzipSync(serialized);
  const targetDirs = [path.join(rootDir, "static", "data"), path.join(rootDir, "public", "data")];

  await Promise.all(
    targetDirs.map(async (dirPath) => {
      await ensureDir(dirPath);
      await fs.writeFile(path.join(dirPath, fileName), gzip);
    }),
  );
}

async function generateLocalePayload(
  rootDir: string,
  locale: string,
  previousManifest: EmbeddingManifest,
  nextManifest: EmbeddingManifest,
): Promise<{ payload: Record<string, unknown>; recordCount: number; reusedEmbeddings: number; regeneratedEmbeddings: number }> {
  const sourcePages = await loadSearchSource(path.join(rootDir, "public"), locale);
  const lexical = createLexicalIndex();
  const fuzzy = createFuzzyIndex();
  const records: SearchRecord[] = [];

  sourcePages.forEach((page) => {
    const pageRecord = buildPageRecord(locale, page);
    const sectionRecords = buildSectionRecords(locale, page);
    const chunkRecords = buildChunkRecords(locale, page, sectionRecords);
    records.push(pageRecord, ...sectionRecords, ...chunkRecords);
  });

  records.forEach((record) => {
    lexical.index({
      id: record.id,
      fields: {
        title: [record.title],
        description: [record.description],
        body: [record.content, ...record.headings].filter(Boolean),
        topics: record.topics,
        permalink: [record.permalink],
        section: [record.section],
        kind: [record.kind],
        suggest: [record.title, record.page_title, record.topics.join(" ")].filter(Boolean).join(" "),
      },
    });

    fuzzy.index({
      id: record.id,
      fields: {
        combined: [
          record.title,
          record.description,
          record.content,
          record.page_title,
          record.topics.join(" "),
          record.permalink,
        ]
          .filter(Boolean)
          .join(" "),
      },
    });
  });

  const cacheDir = path.join(rootDir, ".cache", "search");
  await ensureDir(path.join(cacheDir, "embeddings"));
  env.allowLocalModels = true;
  env.cacheDir = path.join(rootDir, ".cache", "transformers");

  let dimensions = 0;
  let reusedEmbeddings = 0;
  let regeneratedEmbeddings = 0;
  const vectorIndex = new VectorFieldIndex({
    dimensions: 384,
    numHashTables: NUM_HASH_TABLES,
    random: createSeededRandom(RANDOM_SEED),
  });

  for (const record of records.filter((entry) => entry.kind === "section" || entry.kind === "chunk")) {
    const hashInput = JSON.stringify({
      generator: SEARCH_GENERATOR_VERSION,
      chunkingVersion: CHUNKING_VERSION,
      model: MODEL_ID,
      locale,
      id: record.id,
      vectorText: record.vector_text,
    });
    const nextHash = sha256(hashInput);
    const previous = previousManifest[record.id];
    const cacheFile =
      previous?.cache_file ||
      path.join(".cache", "search", "embeddings", `${slugify(record.id)}-${sha256(record.id).slice(0, 10)}.json`);
    let vectorValue: number[] | null = null;

    if (previous?.hash === nextHash) {
      const cached = await readJson<{ vector?: number[] }>(path.join(rootDir, cacheFile), {});
      if (Array.isArray(cached.vector) && cached.vector.length > 0) {
        vectorValue = cached.vector;
        reusedEmbeddings += 1;
      }
    }

    if (!vectorValue) {
      vectorValue = await embedText(record.vector_text);
      regeneratedEmbeddings += 1;
      await ensureDir(path.dirname(path.join(rootDir, cacheFile)));
      await fs.writeFile(path.join(rootDir, cacheFile), JSON.stringify({ hash: nextHash, vector: vectorValue }));
    }

    dimensions ||= vectorValue.length;
    vectorIndex.insert(record.id, [vectorValue]);
    nextManifest[record.id] = { hash: nextHash, cache_file: cacheFile };
  }

  const payload = {
    version: SEARCH_GENERATOR_VERSION,
    locale,
    generated_at: new Date().toISOString(),
    records,
    indexes: {
      lexical: lexical.indexState,
      fuzzy: fuzzy.indexState,
    },
    semantic: {
      model: {
        modelId: MODEL_ID,
        dimensions: dimensions || 384,
        chunkingVersion: CHUNKING_VERSION,
        pooling: "mean",
        normalized: true,
      },
      randomSeed: RANDOM_SEED,
      numHashTables: NUM_HASH_TABLES,
      vectorIndex: vectorIndex.indexState,
    },
  };

  return {
    payload,
    recordCount: records.length,
    reusedEmbeddings,
    regeneratedEmbeddings,
  };
}

export async function generateSearchPayloads(rootDir = process.cwd()): Promise<void> {
  const manifestPath = path.join(rootDir, ".cache", "search", "embedding-manifest.json");
  await ensureDir(path.dirname(manifestPath));
  const previousManifest = await readJson<EmbeddingManifest>(manifestPath, {});
  const nextManifest: EmbeddingManifest = {};

  let reusedEmbeddings = 0;
  let regeneratedEmbeddings = 0;

  for (const locale of LANGS) {
    const { payload, recordCount, reusedEmbeddings: reused, regeneratedEmbeddings: regenerated } =
      await generateLocalePayload(rootDir, locale, previousManifest, nextManifest);
    reusedEmbeddings += reused;
    regeneratedEmbeddings += regenerated;

    const serialized = JSON.stringify({
      ...payload,
      payload_hash: sha256(JSON.stringify(payload)),
    });
    await writePayloadCopies(rootDir, locale, serialized);
    console.log(`[search] ${locale}: wrote ${recordCount} records`);
  }

  await fs.writeFile(manifestPath, JSON.stringify(nextManifest, null, 2));
  console.log(`[search] reused ${reusedEmbeddings} embedding(s), regenerated ${regeneratedEmbeddings} embedding(s).`);
}

async function main(): Promise<void> {
  await generateSearchPayloads(process.cwd());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
