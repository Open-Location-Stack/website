import "../css/main.css";
import { initSearchWidgets } from "./site-search";

const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const lightbox = document.getElementById("image-lightbox");
const lightboxImage = document.getElementById("image-lightbox-image") as HTMLImageElement | null;
const lightboxCaption = document.getElementById("image-lightbox-caption");
const lightboxCloseButton = document.getElementById("image-lightbox-close");
const expandableImages = Array.from(document.querySelectorAll<HTMLImageElement>(".prose img"));

const LIVE_HOSTNAME = "openlocationstack.com";
const ANALYTICS_ENDPOINT = "https://analytics.tryformation.com/collect";
const ANALYTICS_SITE_ID = "openlocationstack";
const CONSENT_STORAGE_KEY = "open_location_stack_analytics_consent";
const ANALYTICS_ANON_KEY = "formation_analytics_anonymous_id";
const ANALYTICS_SESSION_KEY = "formation_analytics_session_id";
const SUBSCRIBE_STORAGE_KEY = "open_location_stack_subscribe_state";
const CONSENT_ACCEPTED = "accepted";
const CONSENT_DECLINED = "declined";
const SUBSCRIBE_STATE_PENDING = "pending";
const SUBSCRIBE_STATE_SUBSCRIBED = "subscribed";

type ConsentState = typeof CONSENT_ACCEPTED | typeof CONSENT_DECLINED | null;
type SubscribeState = typeof SUBSCRIBE_STATE_PENDING | typeof SUBSCRIBE_STATE_SUBSCRIBED | null;

const analyticsBanner = document.getElementById("analytics-consent-banner");
const analyticsAcceptButton = document.getElementById("analytics-consent-accept");
const analyticsDeclineButton = document.getElementById("analytics-consent-decline");
const analyticsRevokeButton = document.getElementById("analytics-consent-revoke");
const analyticsSettingsTriggers = Array.from(
  document.querySelectorAll<HTMLElement>("[data-analytics-settings-trigger]")
);

let analyticsInitialized = false;
let analyticsInitialization: Promise<void> | null = null;
let settingsOpen = false;
let activeExpandedImage: HTMLImageElement | null = null;

setupImageLightbox();
setupAnalyticsConsent();
initScheduledPublishing();
initSearchWidgets();
setupListmonkSubscribeForms();

function setupImageLightbox() {
  if (!lightbox || !lightboxImage || !lightboxCaption || !lightboxCloseButton || expandableImages.length === 0) {
    return;
  }

  for (const image of expandableImages) {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "Expand image");

    image.addEventListener("click", () => {
      openImageLightbox(image);
    });

    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openImageLightbox(image);
    });
  }

  lightbox.addEventListener("click", () => {
    closeImageLightbox();
  });

  lightboxImage.addEventListener("click", () => {
    closeImageLightbox();
  });

  lightboxCloseButton.addEventListener("click", () => {
    closeImageLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeImageLightbox();
    }
  });
}

function openImageLightbox(image: HTMLImageElement) {
  if (!lightbox || !lightboxImage || !lightboxCaption) {
    return;
  }

  activeExpandedImage = image;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.alt;
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeImageLightbox() {
  if (!lightbox || !lightboxImage || !lightboxCaption) {
    return;
  }

  if (lightbox.hidden) {
    return;
  }

  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.removeAttribute("src");
  lightboxImage.alt = "";
  lightboxCaption.textContent = "";
  document.body.classList.remove("lightbox-open");
  activeExpandedImage?.focus();
  activeExpandedImage = null;
}

function setupAnalyticsConsent() {
  if (!analyticsBanner || !analyticsAcceptButton || !analyticsDeclineButton || !analyticsRevokeButton) {
    return;
  }

  if (!isLiveDeployment()) {
    hideBanner();
    return;
  }

  for (const trigger of analyticsSettingsTriggers) {
    trigger.hidden = false;
    trigger.addEventListener("click", () => {
      settingsOpen = true;
      updateBannerVisibility();
    });
  }

  analyticsAcceptButton.addEventListener("click", () => {
    storeConsent(CONSENT_ACCEPTED);
    settingsOpen = false;
    hideBanner();
    void initializeAnalytics();
  });

  analyticsDeclineButton.addEventListener("click", () => {
    storeConsent(CONSENT_DECLINED);
    clearAnalyticsStorage();
    settingsOpen = false;
    hideBanner();
  });

  analyticsRevokeButton.addEventListener("click", () => {
    storeConsent(CONSENT_DECLINED);
    clearAnalyticsStorage();
    settingsOpen = false;
    hideBanner();
  });

  if (readConsent() === CONSENT_ACCEPTED) {
    void initializeAnalytics();
  }

  updateBannerVisibility();
}

function parsePublishTimestamp(value: string | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function initScheduledPublishing() {
  const collections = Array.from(document.querySelectorAll<HTMLElement>("[data-publish-collection]"));
  if (!collections.length) {
    document.documentElement.dataset.publishClock = "ready";
    return;
  }

  const now = Date.now();

  collections.forEach((collection) => {
    const items = Array.from(collection.querySelectorAll<HTMLElement>("[data-publish-item]"));
    if (!items.length) return;

    const liveItems = items.filter((item) => {
      const publishAt = parsePublishTimestamp(item.dataset.publishAt);
      const isLive = publishAt === null || publishAt <= now;
      item.hidden = !isLive;
      item.dataset.publishState = isLive ? "live" : "pending";
      return isLive;
    });

    liveItems
      .sort((left, right) => {
        const leftTimestamp = parsePublishTimestamp(left.dataset.publishAt) ?? 0;
        const rightTimestamp = parsePublishTimestamp(right.dataset.publishAt) ?? 0;
        return rightTimestamp - leftTimestamp;
      })
      .forEach((item) => {
        collection.appendChild(item);
      });

    const limit = Number(collection.dataset.publishLimit || "0");
    if (Number.isFinite(limit) && limit > 0) {
      liveItems.forEach((item, index) => {
        item.hidden = index >= limit;
      });
    }

    const visibleItems = liveItems.filter((item) => !item.hidden);
    const section = collection.closest<HTMLElement>("[data-publish-section]");
    if (section) {
      section.hidden = visibleItems.length === 0;
    }
  });

  document.documentElement.dataset.publishClock = "ready";
}

function setupListmonkSubscribeForms() {
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>("[data-listmonk-subscribe]"));
  if (!forms.length) {
    return;
  }

  forms.forEach((form) => {
    const status = form.querySelector<HTMLElement>("[data-listmonk-status]");
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
    const successPanel = form.parentElement?.querySelector<HTMLElement>("[data-listmonk-success]") ?? null;
    const successTitle = successPanel?.querySelector<HTMLElement>("[data-listmonk-success-title]") ?? null;
    const successBody = successPanel?.querySelector<HTMLElement>("[data-listmonk-success-body]") ?? null;
    const resetButton = successPanel?.querySelector<HTMLButtonElement>("[data-listmonk-reset]") ?? null;
    const initialStatus = status?.textContent ?? "";
    const submittingMessage = status?.dataset.submitting || "Submitting subscription...";
    const missingEmailMessage = status?.dataset.missingEmail || "Enter an email address before subscribing.";
    const defaultErrorMessage = status?.dataset.error || "Subscription failed. Please try again.";
    const pendingTitle = successTitle?.dataset.pendingTitle || "Confirm your subscription";
    const pendingBody = successBody?.dataset.pendingBody || "Check your inbox to confirm your subscription.";
    const subscribedTitle = successTitle?.dataset.subscribedTitle || "You are already subscribed, thank you.";
    const subscribedBody = successBody?.dataset.subscribedBody || "";

    const applySubscribeState = (subscribeState: SubscribeState) => {
      if (!successPanel || !successTitle || !successBody) {
        return;
      }

      if (subscribeState === SUBSCRIBE_STATE_PENDING) {
        form.classList.add("hidden");
        successPanel.classList.remove("hidden");
        successTitle.textContent = pendingTitle;
        successBody.textContent = pendingBody;
        successBody.hidden = false;
        if (status) {
          status.textContent = pendingBody;
        }
        return;
      }

      if (subscribeState === SUBSCRIBE_STATE_SUBSCRIBED) {
        form.classList.add("hidden");
        successPanel.classList.remove("hidden");
        successTitle.textContent = subscribedTitle;
        successBody.textContent = subscribedBody;
        successBody.hidden = subscribedBody.length === 0;
        if (status) {
          status.textContent = subscribedTitle;
        }
        return;
      }

      form.classList.remove("hidden");
      successPanel.classList.add("hidden");
      successBody.hidden = subscribedBody.length === 0;
      if (status) {
        status.textContent = initialStatus;
      }
    };

    applySubscribeState(readSubscribeState());

    resetButton?.addEventListener("click", () => {
      clearSubscribeState();
      form.reset();
      applySubscribeState(null);
      emailInput?.focus();
    });

    form.addEventListener("submit", async (event) => {
      const email = emailInput?.value.trim() ?? "";

      if (!email) {
        event.preventDefault();
        if (status) {
          status.textContent = missingEmailMessage;
        }
        return;
      }

      event.preventDefault();

      if (submitButton) {
        submitButton.disabled = true;
      }
      if (status) {
        status.textContent = submittingMessage;
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
        });

        const payload = (await response.json().catch(() => null)) as { message?: string; data?: { has_optin?: boolean } } | null;

        if (!response.ok) {
          throw new Error(payload?.message || defaultErrorMessage);
        }

        form.reset();
        const nextState = payload?.data?.has_optin ? SUBSCRIBE_STATE_PENDING : SUBSCRIBE_STATE_SUBSCRIBED;
        storeSubscribeState(nextState);
        applySubscribeState(nextState);
      } catch (error) {
        if (status) {
          status.textContent = error instanceof Error ? error.message : defaultErrorMessage;
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  });
}

function readSubscribeState(): SubscribeState {
  try {
    const value = window.localStorage.getItem(SUBSCRIBE_STORAGE_KEY);
    if (value === SUBSCRIBE_STATE_PENDING || value === SUBSCRIBE_STATE_SUBSCRIBED) {
      return value;
    }
  } catch {
    return null;
  }
  return null;
}

function storeSubscribeState(value: Exclude<SubscribeState, null>) {
  try {
    window.localStorage.setItem(SUBSCRIBE_STORAGE_KEY, value);
  } catch {
    // Ignore storage failures and fall back to a non-persisted UI state.
  }
}

function clearSubscribeState() {
  try {
    window.localStorage.removeItem(SUBSCRIBE_STORAGE_KEY);
  } catch {
    // Ignore storage failures and leave the UI usable.
  }
}

function updateBannerVisibility() {
  if (!analyticsBanner || !analyticsRevokeButton) {
    return;
  }

  const consent = readConsent();
  const shouldShow = consent === null || settingsOpen;

  analyticsRevokeButton.hidden = consent !== CONSENT_ACCEPTED;

  if (shouldShow) {
    analyticsBanner.hidden = false;
  } else {
    hideBanner();
  }
}

function hideBanner() {
  if (analyticsBanner) {
    analyticsBanner.hidden = true;
  }
}

function readConsent(): ConsentState {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (value === CONSENT_ACCEPTED || value === CONSENT_DECLINED) {
      return value;
    }
  } catch {
    return null;
  }
  return null;
}

function storeConsent(value: Exclude<ConsentState, null>) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    if (import.meta.env.DEV) {
      console.warn("[analytics] failed to persist consent preference");
    }
  }
}

function clearAnalyticsStorage() {
  try {
    window.localStorage.removeItem(ANALYTICS_ANON_KEY);
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.localStorage.setItem(CONSENT_STORAGE_KEY, CONSENT_DECLINED);
  } catch {
    if (import.meta.env.DEV) {
      console.warn("[analytics] failed to clear local storage");
    }
  }

  try {
    window.sessionStorage.removeItem(ANALYTICS_SESSION_KEY);
  } catch {
    if (import.meta.env.DEV) {
      console.warn("[analytics] failed to clear session storage");
    }
  }
}

function isLiveDeployment(): boolean {
  return window.location.hostname === LIVE_HOSTNAME;
}

async function initializeAnalytics(): Promise<void> {
  if (!isLiveDeployment() || readConsent() !== CONSENT_ACCEPTED || analyticsInitialized) {
    return;
  }

  if (analyticsInitialization) {
    return analyticsInitialization;
  }

  analyticsInitialization = (async () => {
    try {
      const { createAnalytics } = await import("@tryformation/formation-web-analytics-client");

      createAnalytics({
        endpoint: ANALYTICS_ENDPOINT,
        siteId: ANALYTICS_SITE_ID,
        autoPageviews: true,
        sendBeacon: false,
        onError(error) {
          if (import.meta.env.DEV) {
            console.warn("[analytics] delivery failed", error.kind, error.status);
          }
        }
      });

      analyticsInitialized = true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[analytics] initialization failed", error);
      }
    } finally {
      analyticsInitialization = null;
    }
  })();

  return analyticsInitialization;
}
