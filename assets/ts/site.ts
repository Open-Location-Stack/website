const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const LIVE_HOSTNAME = "open-rtls.com";
const ANALYTICS_ENDPOINT = "https://analytics.tryformation.com/collect";
const ANALYTICS_SITE_ID = "open-rtls";
const CONSENT_STORAGE_KEY = "open_rtls_analytics_consent";
const ANALYTICS_ANON_KEY = "formation_analytics_anonymous_id";
const ANALYTICS_SESSION_KEY = "formation_analytics_session_id";
const CONSENT_ACCEPTED = "accepted";
const CONSENT_DECLINED = "declined";

type ConsentState = typeof CONSENT_ACCEPTED | typeof CONSENT_DECLINED | null;

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

setupAnalyticsConsent();

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
