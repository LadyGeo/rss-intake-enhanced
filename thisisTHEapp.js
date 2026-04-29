/**
 * Static hosts (e.g. `python3 -m http.server`) only serve files; `/api/*` lives on the Express app
 * (RSS Intake.app or `npm run serve`). Point the UI at that origin:
 *   http://127.0.0.1:4173/?api=http://127.0.0.1:YOUR_PORT
 * or set localStorage key `rss-intake-api-base` to the same origin (no trailing slash).
 */
(function resolveApiBaseForStaticHost() {
  let base = "";
  try {
    const q = new URLSearchParams(window.location.search).get("api");
    const ls = localStorage.getItem("rss-intake-api-base");
    base = String(q || ls || "").trim().replace(/\/$/, "");
  } catch {
    /* ignore */
  }
  if (!base) return;
  const orig = window.fetch.bind(window);
  window.fetch = function (input, init) {
    if (typeof input === "string" && input.startsWith("/api")) {
      return orig(base + input, init);
    }
    return orig(input, init);
  };
})();

const hoursEl = document.getElementById("hours");
const customRangeWrapEl = document.getElementById("custom-range-wrap");
const dateFromEl = document.getElementById("date-from");
const dateToEl = document.getElementById("date-to");
const searchEl = document.getElementById("search");
const countryTriggerEl = document.getElementById("country-trigger");
const countryPanelEl = document.getElementById("country-panel");
const countryAllEl = document.getElementById("country-all");
const countryOptionsEl = document.getElementById("country-options");
const sourceTriggerEl = document.getElementById("source-trigger");
const sourcePanelEl = document.getElementById("source-panel");
const sourceAllEl = document.getElementById("source-all");
const sourceOptionsEl = document.getElementById("source-options");
const pressSignalFilterEl = document.getElementById("press-signal-filter");
const pressSignalSortEl = document.getElementById("press-signal-sort");
const signalKeywordFilterEl = document.getElementById("signal-keyword-filter");
const regionTriggerEl = document.getElementById("region-trigger");
const regionPanelEl = document.getElementById("region-panel");
const regionOptionsEl = document.getElementById("region-options");
const tagTriggerEl = document.getElementById("tag-trigger");
const tagPanelEl = document.getElementById("tag-panel");
const tagAllEl = document.getElementById("tag-all");
const tagOptionsEl = document.getElementById("tag-options");
const curatedTriggerEl = document.getElementById("curated-trigger");
const curatedPanelEl = document.getElementById("curated-panel");
const curatedSummaryEl = document.getElementById("curated-summary");
const curatedGroupsEl = document.getElementById("curated-groups");
const curatedResetBtnEl = document.getElementById("curated-reset-btn");
const curatedEnabledEl = document.getElementById("curated-enabled");
const loadingEl = document.getElementById("loading");
const emptyEl = document.getElementById("empty");
const contentEl = document.getElementById("content");
const countEl = document.getElementById("count");
const ingestLastRunEl = document.getElementById("ingest-last-run");
const generatedEl = document.getElementById("generated");
const feedsListEl = document.getElementById("feeds-list");
const feedFormEl = document.getElementById("feed-form");
const feedNameEl = document.getElementById("feed-name");
const feedUrlEl = document.getElementById("feed-url");
const feedSourceTypeEl = document.getElementById("feed-source-type");
const feedCountryEl = document.getElementById("feed-country");
const headerControlsEl = document.getElementById("header-controls");
const tagsSurfacesListEl = document.getElementById("tags-surfaces-list");
const tagsLeversListEl = document.getElementById("tags-levers-list");
const tagsIgnoreListEl = document.getElementById("tags-ignore-list");
const tagFormEl = document.getElementById("tag-form");
const leverFormEl = document.getElementById("lever-form");
const insightsSearchEl = document.getElementById("insights-search");
const insightsCountryFilterEl = document.getElementById("insights-country-filter");
const insightsSourceFilterEl = document.getElementById("insights-source-filter");
const insightsSortEl = document.getElementById("insights-sort");
const insightsRegionStripEl = document.getElementById("insights-region-strip");
const insightsTableBodyEl = document.getElementById("insights-table-body");
const insightsEmptyEl = document.getElementById("insights-empty");
const insightsGapTableBodyEl = document.getElementById("insights-gap-table-body");
const insightsGapEmptyEl = document.getElementById("insights-gap-empty");
const insightTotalFeedsEl = document.getElementById("insight-total-feeds");
const insightCountriesEl = document.getElementById("insight-countries");
const insightRegulatorsEl = document.getElementById("insight-regulators");
const trendsHoursEl = document.getElementById("trends-hours");
const trendsCompareModeEl = document.getElementById("trends-compare-mode");
const trendsPrevRangeWrapEl = document.getElementById("trends-prev-range-wrap");
const trendsPrevFromEl = document.getElementById("trends-prev-from");
const trendsPrevToEl = document.getElementById("trends-prev-to");
const trendsTopicModeEl = document.getElementById("trends-topic-mode");
const trendsKeywordLimitEl = document.getElementById("trends-keyword-limit");
const trendsRiskLensEl = document.getElementById("trends-risk-lens");
const trendsMinClusterEl = document.getElementById("trends-min-cluster");
const trendsClusterTokensEl = document.getElementById("trends-cluster-tokens");
const trendsIncludeAllEl = document.getElementById("trends-include-all");
const trendsIncludeArchivedEl = document.getElementById("trends-include-archived");
const trendsRefreshBtnEl = document.getElementById("trends-refresh-btn");
const trendsLoadingEl = document.getElementById("trends-loading");
const trendsContentEl = document.getElementById("trends-content");
const trendsWindowLabelEl = document.getElementById("trends-window-label");
const trendsCompareActiveEl = document.getElementById("trends-compare-active");
const feedsFilterSearchEl = document.getElementById("feeds-filter-search");
const feedsFilterRegionEl = document.getElementById("feeds-filter-region");
const feedsFilterSourceEl = document.getElementById("feeds-filter-source");
const feedsSortEl = document.getElementById("feeds-sort");

let data = {
  items: [],
  sourceTypeLabels: {},
  countryLabels: {},
  countriesOfInterest: [],
  hours: 24,
};
let insightsData = [];

/** Latest feed-sources payload for Manage Feeds list (sort / filter / region groups). */
let manageFeedsCache = null;
let feedsManageToolbarBound = false;

/** Keyword-first digest: show matched phrase types in a stable, scannable order (see KEYWORD_FIRST_STRATEGY.md). */
const KEYWORD_SIGNAL_TYPE_ORDER = [
  "enforcement",
  "severity",
  "deadline",
  "timing",
  "litigation",
  "proposal",
  "context",
  "pdp",
  "pricing",
  "checkout",
  "shipping",
  "privacy",
  "accessibility",
  "region",
];

const KEYWORD_SIGNAL_GROUP_LABEL = {
  enforcement: "Enforcement",
  severity: "Fines & sanctions",
  deadline: "Deadlines",
  timing: "Effective / dates",
  litigation: "Litigation",
  proposal: "Proposed / consultation",
  context: "Regulator / context",
  pdp: "Product disclosure",
  pricing: "Pricing",
  checkout: "Checkout & subscriptions",
  shipping: "Shipping & cross-border",
  privacy: "Privacy & data",
  accessibility: "Accessibility",
  region: "Region",
};

const CURATED_TOGGLE_GROUPS = [
  {
    id: "product-info",
    label: "Product Info",
    toggles: [
      { id: "specs", label: "Specs", keywords: ["spec", "technical specification", "product spec", "feature disclosure", "performance claim", "product information"] },
      {
        id: "labeling",
        label: "Labeling",
        keywords: ["labeling", "product labeling", "country of origin", "origin labeling", "mandatory disclosure"],
      },
      { id: "environmental-claims", label: "Environmental claims", keywords: ["environmental claim", "green claim", "sustainability claim", "eco claim", "carbon neutral", "greenwashing"] },
      {
        id: "inventory",
        label: "Inventory",
        keywords: ["in stock", "out of stock", "stock level", "inventory status", "backorder", "low stock"],
      },
      { id: "comparisons", label: "Comparisons", keywords: ["compare", "comparison", "comparative claim", "versus", "best value", "ranked"] },
      { id: "warranty", label: "Warranty", keywords: ["warranty", "guarantee", "repair right", "statutory warranty", "limited warranty", "service coverage"] },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    toggles: [
      { id: "price-accuracy", label: "Price accuracy", keywords: ["price accuracy", "incorrect price", "price error", "price display", "price mismatch", "total price"] },
      { id: "drip-pricing", label: "Drip pricing", keywords: ["drip pricing", "hidden fee", "add-on fee", "junk fee", "fees at checkout"] },
      { id: "discounts", label: "Discounts", keywords: ["discount", "sale price", "reference price", "strike-through", "promotional price", "markdown"] },
      { id: "financing", label: "Financing", keywords: ["financing", "installment", "bnpl", "buy now pay later", "credit terms", "monthly payment"] },
      { id: "taxes", label: "Taxes", keywords: ["tax", "vat", "gst", "tax inclusive", "tax exclusive", "surcharge"] },
      { id: "currency", label: "Currency", keywords: ["currency", "exchange rate", "local currency", "fx rate", "multi-currency"] },
      { id: "promo-codes", label: "Promo codes", keywords: ["promo code", "coupon", "voucher code", "discount code", "promotion code"] },
    ],
  },
  {
    id: "purchase-decisions",
    label: "Purchase Decisions",
    toggles: [
      { id: "pre-checks", label: "Pre-checks", keywords: ["pre-purchase", "before checkout", "pre-check", "pre-contract", "pre-order disclosure"] },
      { id: "consent", label: "Consent", keywords: ["consent", "opt in", "affirmative action", "checkbox", "explicit consent", "informed consent"] },
      { id: "information-ordering", label: "Information ordering", keywords: ["order summary", "information ordering", "prominent disclosure", "material information", "priority disclosure"] },
      { id: "modifications", label: "Modifications", keywords: ["modify order", "edit order", "change selection", "amend order", "update order"] },
      { id: "confirmation", label: "Confirmation", keywords: ["order confirmation", "purchase confirmation", "confirmation page", "receipt", "transaction confirmation"] },
    ],
  },
  {
    id: "fulfillment",
    label: "Fulfillment",
    toggles: [
      { id: "shipping-methods", label: "Shipping methods", keywords: ["shipping method", "delivery option", "carrier option", "standard shipping", "express shipping"] },
      { id: "delivery-times", label: "Delivery times", keywords: ["delivery time", "estimated delivery", "arrival date", "dispatch time", "delivery window"] },
      {
        id: "cross-border",
        label: "Cross-border",
        keywords: ["cross-border", "international shipping", "import duty", "import tax", "cross border ecommerce", "international order"],
      },
      { id: "duties", label: "Duties", keywords: ["duties", "customs", "tariff", "import tax", "customs fee"] },
      { id: "address", label: "Address", keywords: ["shipping address", "address validation", "address requirement", "postcode", "zip code"] },
      {
        id: "tracking",
        label: "Tracking",
        keywords: ["track order", "shipment tracking", "tracking number", "delivery status", "parcel tracking"],
      },
    ],
  },
  {
    id: "post-purchase",
    label: "Post-Purchase",
    toggles: [
      {
        id: "returns",
        label: "Returns",
        keywords: ["return policy", "right of return", "returns window", "return eligibility", "cooling-off", "cooling off"],
      },
      {
        id: "refunds",
        label: "Refunds",
        keywords: ["refund policy", "refund timeline", "refund method", "refund processing", "money back"],
      },
      { id: "subscriptions", label: "Subscriptions", keywords: ["subscription", "auto-renew", "renewal", "recurring billing", "recurring payment"] },
      {
        id: "cancellations",
        label: "Cancellations",
        keywords: ["cancellation", "withdrawal", "termination", "cancel anytime", "subscription cancellation"],
      },
    ],
  },
  {
    id: "data-privacy",
    label: "Data & Privacy",
    toggles: [
      { id: "cookies", label: "Cookies", keywords: ["cookie", "cookie consent", "tracking cookie", "consent management platform", "cmp"] },
      { id: "privacy-policy", label: "Privacy policy", keywords: ["privacy policy", "privacy notice", "data notice", "processing notice"] },
      { id: "marketing", label: "Marketing", keywords: ["marketing consent", "personalized ads", "direct marketing", "targeted advertising", "remarketing"] },
      { id: "data-rights", label: "Data rights", keywords: ["data access", "data deletion", "data portability", "data rights", "subject access request"] },
      { id: "security", label: "Security", keywords: ["security", "data breach", "encryption", "authentication", "incident response", "account security"] },
    ],
  },
  {
    id: "accessibility",
    label: "Accessibility",
    toggles: [
      { id: "wcag-compliance", label: "WCAG compliance", keywords: ["wcag", "accessibility compliance", "digital accessibility", "aa compliance", "conformance"] },
      { id: "specific-features", label: "Specific features", keywords: ["screen reader", "keyboard navigation", "alt text", "assistive", "focus order", "aria"] },
    ],
  },
  {
    id: "regional",
    label: "Regional",
    toggles: [
      { id: "legal-variation", label: "Legal variation", keywords: ["jurisdiction", "country-specific", "regional law", "local law", "national requirement"] },
      { id: "language", label: "Language", keywords: ["language requirement", "localized language", "translation", "official language", "local language"] },
      { id: "payment-methods", label: "Payment methods", keywords: ["local payment method", "payment option", "regional payment", "country payment", "alternative payment"] },
    ],
  },
  {
    id: "third-party",
    label: "Third-Party",
    toggles: [
      { id: "payment-processors", label: "Payment processors", keywords: ["payment processor", "third-party payment", "gateway", "payment provider", "psp"] },
      { id: "data-sharing", label: "Data sharing", keywords: ["data sharing", "third party sharing", "share data with", "data transfer", "processor disclosure"] },
    ],
  },
  {
    id: "temporal",
    label: "Temporal",
    toggles: [
      { id: "inventory-changes", label: "Inventory changes", keywords: ["inventory change", "stock change", "availability update", "restock", "stockout"] },
      { id: "price-changes", label: "Price changes", keywords: ["price change", "pricing update", "reprice", "price increase", "price decrease"] },
      { id: "expiration", label: "Expiration", keywords: ["expires", "expiration date", "expiry", "valid until", "time-limited"] },
    ],
  },
  {
    id: "rights-claims",
    label: "Rights & Claims",
    toggles: [
      { id: "substantiation", label: "Substantiation", keywords: ["substantiation", "evidence requirement", "claim support", "proof required", "claim verification"] },
      { id: "disclaimers", label: "Disclaimers", keywords: ["disclaimer", "legal notice", "fine print", "terms apply", "limitation"] },
    ],
  },
];

const CURATED_TOGGLES = CURATED_TOGGLE_GROUPS.flatMap((g) =>
  g.toggles.map((t) => ({ ...t, groupId: g.id, groupLabel: g.label })),
);
const CURATED_TOTAL = CURATED_TOGGLES.length;
const CURATED_KEYWORDS_BY_ID = new Map(CURATED_TOGGLES.map((t) => [t.id, t.keywords]));
const selectedCuratedToggleIds = new Set(CURATED_TOGGLES.map((t) => t.id));

const HIDDEN_ITEMS_KEY = "rss-intake-hidden-items";

/** Digest region groupings → ISO country codes (Apple geography). */
const REGION_GROUPS = {
  emeia: [
    "AT",
    "BE",
    "CZ",
    "DK",
    "FI",
    "FR",
    "DE",
    "HU",
    "IN",
    "IE",
    "IT",
    "LU",
    "NL",
    "NO",
    "PL",
    "PT",
    "RU",
    "ES",
    "SE",
    "CH",
    "TR",
    "AE",
    "GB",
  ],
  gc: ["CN", "HK", "MO", "TW"],
  rpac: ["AU", "JP", "KR", "MY", "NZ", "PH", "SG", "TH", "VN"],
  amr: ["BR", "CA", "CL", "MX", "US"],
};

const REGION_GROUP_LABELS = {
  emeia: "EMEIA",
  gc: "GC",
  rpac: "RPAC",
  amr: "AMR",
};

/** Region buckets for Manage Feeds grouping (includes non-mapping countries). */
const MANAGE_FEED_REGION_ORDER = ["emeia", "gc", "rpac", "amr", "other", "none"];

function manageRegionGroupLabel(gid) {
  if (gid === "other") return "Other geographies";
  if (gid === "none") return "No country set";
  return REGION_GROUP_LABELS[gid] || gid;
}

function countryToManageRegionBucket(country) {
  const cc = (country || "").trim().toUpperCase();
  if (!cc) return "none";
  for (const [gid, codes] of Object.entries(REGION_GROUPS)) {
    if (codes.includes(cc)) return gid;
  }
  return "other";
}

const COUNTRY_TLD_TO_CODE = {
  us: "US",
  uk: "GB",
  gb: "GB",
  ca: "CA",
  au: "AU",
  in: "IN",
  jp: "JP",
  br: "BR",
  mx: "MX",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  nl: "NL",
  ie: "IE",
  sg: "SG",
  kr: "KR",
  cn: "CN",
  tw: "TW",
  hk: "HK",
};

const COUNTRY_SIGNAL_RULES = [
  { code: "US", weight: 7, re: /\b(federal district court|state attorneys?\s+general|u\.?\s*s\.?\s+(?:district|supreme)\s+court)\b/i },
  { code: "US", weight: 5, re: /\b(united states|u\.?\s*s\.?\s*a?\.?|american|ftc|sec|fcc|cfpb|doj)\b/i },
  { code: "GB", weight: 5, re: /\b(united kingdom|u\.?\s*k\.?|england|wales|scotland|northern ireland|hm treasury|fca|ico)\b/i },
  { code: "CA", weight: 5, re: /\b(canada|canadian|competition bureau canada)\b/i },
  { code: "AU", weight: 5, re: /\b(australia|australian|accc|oaic)\b/i },
  { code: "IN", weight: 5, re: /\b(india|indian|rbi|sebi)\b/i },
  { code: "JP", weight: 5, re: /\b(japan|japanese|jftc)\b/i },
];

let countryAliasCacheKey = "";
let countryAliasCandidates = [];
const countryResolutionCache = new Map();

function buildCountryAliasCandidates() {
  const labels = data?.countryLabels || {};
  const fromInterest = Array.isArray(data?.countriesOfInterest) ? data.countriesOfInterest : [];
  const codes = [...new Set([...Object.keys(labels), ...fromInterest])]
    .map((c) => String(c || "").trim().toUpperCase())
    .filter(Boolean);
  const key = `${codes.join(",")}|${Object.keys(labels).length}`;
  if (key === countryAliasCacheKey && countryAliasCandidates.length > 0) return countryAliasCandidates;

  const out = [];
  for (const code of codes) {
    const rawLabel = String(labels[code] || "").trim();
    const aliases = [rawLabel, code];
    for (const aliasRaw of aliases) {
      const alias = aliasRaw.toLowerCase().trim();
      if (!alias || alias.length < 2) continue;
      if (!/[a-z]/i.test(alias)) continue;
      // Skip highly ambiguous short tokens ("in", "am", etc.).
      if (alias.length <= 3 && !/^(us|uk|uae|eu)$/i.test(alias)) continue;
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      out.push({
        code,
        weight: alias.includes(" ") ? 3 : 2,
        re: new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i"),
      });
    }
  }
  out.sort((a, b) => b.weight - a.weight);
  countryAliasCacheKey = key;
  countryAliasCandidates = out;
  return out;
}

function inferCountryCodeFromLink(link) {
  const raw = String(link || "").trim();
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host.endsWith(".gov.uk") || host.endsWith(".nhs.uk") || host.endsWith(".police.uk")) return "GB";
    if (host.endsWith(".gov.au")) return "AU";
    if (host.endsWith(".gc.ca") || host.endsWith(".canada.ca")) return "CA";
    if (host.endsWith(".gov.in")) return "IN";
    if (host.endsWith(".go.jp")) return "JP";
    const parts = host.split(".");
    const tld = parts[parts.length - 1];
    return tld ? COUNTRY_TLD_TO_CODE[tld] || null : null;
  } catch {
    return null;
  }
}

function inferCountryCodeFromText(item) {
  const text = [item?.title, item?.content_snippet, item?.feed_name, String(item?.content || "").replace(/<[^>]+>/g, " ").slice(0, 15000)]
    .filter(Boolean)
    .join(" ");
  if (!text) return null;

  const scores = new Map();
  const bump = (code, pts) => scores.set(code, (scores.get(code) || 0) + pts);

  for (const rule of COUNTRY_SIGNAL_RULES) {
    if (rule.re.test(text)) bump(rule.code, rule.weight);
  }
  for (const c of buildCountryAliasCandidates()) {
    if (c.re.test(text)) bump(c.code, c.weight);
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return null;
  const [bestCode, bestScore] = ranked[0];
  const secondScore = ranked[1]?.[1] || 0;
  // Require enough evidence and avoid ambiguous ties.
  if (bestScore < 3) return null;
  if (bestScore - secondScore < 2) return null;
  return bestCode;
}

function resolveItemCountryCode(item) {
  const explicit = String(item?.country || "").trim().toUpperCase();
  if (explicit) return explicit;
  const cacheKey = `${item?.id || ""}|${item?.link || ""}|${item?.title || ""}|${item?.content_snippet || ""}`;
  if (countryResolutionCache.has(cacheKey)) return countryResolutionCache.get(cacheKey);
  const byLink = inferCountryCodeFromLink(item?.link);
  const byText = inferCountryCodeFromText(item);
  const resolved = byLink || byText || null;
  if (countryResolutionCache.size > 5000) countryResolutionCache.clear();
  countryResolutionCache.set(cacheKey, resolved);
  return resolved;
}

function getHiddenItemIds() {
  try {
    const raw = localStorage.getItem(HIDDEN_ITEMS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addHiddenItemId(id) {
  const ids = getHiddenItemIds();
  ids.add(id);
  localStorage.setItem(HIDDEN_ITEMS_KEY, JSON.stringify([...ids]));
}

function removeHiddenItemId(id) {
  const ids = getHiddenItemIds();
  ids.delete(id);
  localStorage.setItem(HIDDEN_ITEMS_KEY, JSON.stringify([...ids]));
}

function clearHiddenItemIds() {
  localStorage.removeItem(HIDDEN_ITEMS_KEY);
}

async function fetchConfig() {
  const res = await fetch("/api/config");
  return res.json();
}

function itemsApiExtraQuery() {
  let q = "";
  if (document.getElementById("include-archived")?.checked) {
    q += "&include_archived=true";
  }
  if (!curatedEnabledEl?.checked) {
    q += "&include_all=true";
  }
  return q;
}

async function fetchItems() {
  const hours = hoursEl.value;
  const pq = itemsApiExtraQuery();
  const url =
    hours === "custom" && dateFromEl?.value && dateToEl?.value
      ? `/api/items?from=${encodeURIComponent(dateFromEl.value)}&to=${encodeURIComponent(dateToEl.value)}${pq}`
      : `/api/items?hours=${hours}${pq}`;
  const res = await fetch(url);
  return res.json();
}

async function fetchIngestHistory(limit) {
  const res = await fetch(`/api/ingest/history?limit=${encodeURIComponent(String(limit))}`);
  if (!res.ok) return { runs: [] };
  return res.json();
}

/** Same taxonomy as the Tags tab — used so the digest header multiselect is populated even when /api/items omits tag lists. */
async function fetchTagTaxonomyLists() {
  try {
    const res = await fetch("/api/tags");
    if (!res.ok) return { surfaces: [], levers: [] };
    const json = await res.json();
    return { surfaces: json.surfaces || [], levers: json.levers || [] };
  } catch {
    return { surfaces: [], levers: [] };
  }
}

/** @param {any} run */
function formatIngestFooterLine(run) {
  if (!run) return "";
  const d = new Date(run.finished_at);
  const timeStr = Number.isNaN(d.getTime())
    ? run.finished_at
    : d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  const results = Array.isArray(run.results) ? run.results : [];
  const feedsWithErrors = results.filter(
    (r) => Array.isArray(r.errors) && r.errors.length > 0,
  ).length;
  const parts = [`Source ingest: ${timeStr}`, `${run.total_new} new article${run.total_new === 1 ? "" : "s"} imported`];
  if (run.total_dedup_skipped > 0) {
    parts.push(`${run.total_dedup_skipped} duplicate${run.total_dedup_skipped === 1 ? "" : "s"} skipped`);
  }
  if (run.total_errors > 0) {
    parts.push(`${feedsWithErrors} source${feedsWithErrors === 1 ? "" : "s"} had pull errors`);
  }
  return parts.join(" · ");
}

/** @param {any} run */
function updateIngestFooter(run) {
  if (!ingestLastRunEl) return;
  ingestLastRunEl.textContent = formatIngestFooterLine(run);
}

function groupItems(items) {
  const bySource = {};
  for (const item of items) {
    const st = item.source_type || "other";
    if (!bySource[st]) bySource[st] = {};
    const feed = item.feed_name || "Unknown";
    if (!bySource[st][feed]) bySource[st][feed] = [];
    bySource[st][feed].push(item);
  }
  return bySource;
}

/** Word-boundary match: avoids "coo" in "cool", "import" in "importance", "tos" in "tostada" */
function matchesKeyword(text, keyword) {
  if (!text || !keyword) return false;
  const k = keyword.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!k) return false;
  if (k.includes(" ")) {
    return t.includes(k);
  }
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    return new RegExp("\\b" + escaped + "\\b", "i").test(t);
  } catch {
    return t.includes(k);
  }
}

/** Client keyword lists: multi-word substring match; single-token word-boundary (same as matchesKeyword). */
function phraseMatchesInItemText(text, phrase) {
  const p = String(phrase).trim();
  if (!p || !text) return false;
  if (p.includes(" ")) return text.toLowerCase().includes(p.toLowerCase());
  return matchesKeyword(text, p);
}

/** Fold text for locale phrase matching (diacritics; German ß). */
function foldForLocaleMatch(s) {
  let t = String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/ß/g, "ss");
  return t;
}

function getKeywordListsFromRuntime() {
  return typeof window !== "undefined" && window.RSS_INTAKE_KEYWORD_LISTS
    ? window.RSS_INTAKE_KEYWORD_LISTS
    : null;
}

function findClientMatchedKeywords(text) {
  const lists = getKeywordListsFromRuntime();
  if (!lists || !text) return [];
  const out = [];
  const seen = new Set();
  for (const [type, phrases] of Object.entries(lists)) {
    if (!Array.isArray(phrases)) continue;
    for (const phrase of phrases) {
      if (!phraseMatchesInItemText(text, phrase)) continue;
      const key = `${type}::${String(phrase).toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ keyword: phrase, keyword_type: type });
    }
  }
  return out;
}

function getKeywordI18nRules() {
  return typeof window !== "undefined" && window.RSS_INTAKE_I18N_RULES ? window.RSS_INTAKE_I18N_RULES : null;
}

/** Map non-English snippets to English canonical `keyword` + same `keyword_type` as English lists. */
function findI18nMatchedKeywords(text) {
  const rules = getKeywordI18nRules();
  if (!rules || !text) return [];
  const h = foldForLocaleMatch(text);
  const out = [];
  const seen = new Set();
  for (const [type, entries] of Object.entries(rules)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      const en = String(entry?.en || "").trim();
      const patterns = entry?.patterns;
      if (!en || !Array.isArray(patterns)) continue;
      let hit = false;
      for (const p of patterns) {
        const fp = foldForLocaleMatch(p);
        if (fp && h.includes(fp)) {
          hit = true;
          break;
        }
      }
      if (!hit) continue;
      const key = `${type}::${en.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ keyword: en, keyword_type: type, match_source: "locale_map" });
    }
  }
  return out;
}

function mergeMatchedKeywordRows(serverList, clientList) {
  const seen = new Set();
  const out = [];
  const pushRow = (k) => {
    const kw = String(k?.keyword || "").trim();
    const typ = String(k?.keyword_type || "context").toLowerCase();
    if (!kw) return;
    const key = `${typ}::${kw.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    const row = { keyword: kw, keyword_type: typ };
    if (k?.signal_strength) row.signal_strength = k.signal_strength;
    if (k?.match_source) row.match_source = k.match_source;
    out.push(row);
  };
  for (const k of serverList || []) pushRow(k);
  for (const k of clientList || []) pushRow(k);
  return out;
}

/** Merge API hits with English + locale-mapped client lists (keyword-first). */
function enrichItemsWithClientKeywords(items) {
  if (!Array.isArray(items)) return [];
  const hasEn = !!getKeywordListsFromRuntime();
  const hasI18n = !!getKeywordI18nRules();
  if (!hasEn && !hasI18n) return items;
  return items.map((item) => {
    const blob = `${item.title || ""} ${item.content_snippet || ""}`;
    let merged = item.matched_keywords || [];
    if (hasEn) merged = mergeMatchedKeywordRows(merged, findClientMatchedKeywords(blob));
    if (hasI18n) merged = mergeMatchedKeywordRows(merged, findI18nMatchedKeywords(blob));
    return { ...item, matched_keywords: merged };
  });
}

/** Returns matched keywords (longest first for specificity) */
function matchText(text, keywords) {
  if (!keywords || !text) return [];
  const matched = keywords.filter((k) => matchesKeyword(text, k));
  return matched.sort((a, b) => b.length - a.length);
}

function curatedTextForItem(item) {
  // Curated gate is snippet-driven with title fallback if snippet is absent.
  return item.content_snippet || item.title || "";
}

function curatedToggleMatchesItem(item, toggleId) {
  const keywords = CURATED_KEYWORDS_BY_ID.get(toggleId) || [];
  if (keywords.length === 0) return false;
  const text = curatedTextForItem(item);
  if (!text) return false;
  return keywords.some((k) => matchesKeyword(text, k));
}

/** Physical / industrial recalls often share words with ecommerce toggles; drop them in curated mode unless the story is clearly digital-regulatory. */
const CURATED_OFF_TOPIC_PHYSICAL_RES = [
  /\blivestock\b/i,
  /\bstunning\s+cartridge/i,
  /\bagricultural\b/i,
  /\bpesticide\b/i,
  /\bherbicide\b/i,
  /\bveterinary\b/i,
  /\bfertilizer\b/i,
  /\bpet\s+food\b/i,
  /\bvehicle\s+recall\b/i,
  /\bfood\s+safety\s+recall/i,
];

function curatedLooksLikeOffTopicPhysicalRecall(item) {
  const blob = `${item.title || ""} ${item.content_snippet || ""}`;
  return CURATED_OFF_TOPIC_PHYSICAL_RES.some((re) => re.test(blob));
}

/** Keep an item if it clearly ties to digital markets, online commerce, or platform/data regulation (not generic consumer-product recalls). */
function curatedHasDigitalRegulatoryAnchor(item) {
  const text = ((item.title || "") + " " + (item.content_snippet || "")).toLowerCase();
  const phrases = [
    "e-commerce",
    "ecommerce",
    "digital platform",
    "online platform",
    "marketplace",
    "digital services act",
    "digital markets act",
    "data portability",
    "interoperability",
    "privacy policy",
    "personal data",
    "data protection",
    "in-app purchase",
    "app store",
    "unfair commercial practices",
    "dark pattern",
    "electronic commerce",
    "online sales",
    "distance selling",
    "algorithmic",
    "antitrust",
    "self-preferencing",
    "gatekeeper",
    "digital health",
    "health data",
    "online advertising",
    "targeted advertising",
    "cookie consent",
    " gdpr",
    "federal trade commission",
    "competition bureau",
    "competition law",
    "ftc",
    "antitrust division",
  ];
  return phrases.some((p) => text.includes(p));
}

function getSelectedCuratedToggleIds() {
  return selectedCuratedToggleIds;
}

function isCuratedModeEnabled() {
  return curatedEnabledEl?.checked !== false;
}

function updateCuratedSummary() {
  if (!curatedSummaryEl) return;
  if (!isCuratedModeEnabled()) {
    curatedSummaryEl.textContent = "Floodgate: all items (compliance topic toggles off)";
    curatedSummaryEl.title =
      "Curated mode is off. The digest is not narrowed by the compliance topic checkboxes—only your other filters apply.";
    return;
  }
  curatedSummaryEl.textContent = `Compliance topics: ${selectedCuratedToggleIds.size} of ${CURATED_TOTAL} selected`;
  curatedSummaryEl.title =
    "How many compliance topic toggles are on (OR gate). This is not a count of articles in the list.";
}

function renderCuratedGroups() {
  if (!curatedGroupsEl) return;
  curatedGroupsEl.innerHTML = "";
  for (const group of CURATED_TOGGLE_GROUPS) {
    const section = document.createElement("section");
    section.className = "curated-group";
    const title = document.createElement("div");
    title.className = "curated-group-title";
    title.textContent = `${group.label} (${group.toggles.length})`;
    section.appendChild(title);

    for (const toggle of group.toggles) {
      const row = document.createElement("label");
      row.className = "curated-option";
      row.innerHTML = `<input type="checkbox" value="${escapeAttr(toggle.id)}" checked /> <span>${escapeHtml(toggle.label)}</span>`;
      const cb = row.querySelector("input");
      cb.addEventListener("change", () => {
        if (cb.checked) selectedCuratedToggleIds.add(toggle.id);
        else selectedCuratedToggleIds.delete(toggle.id);
        updateCuratedSummary();
        onFilter();
      });
      section.appendChild(row);
    }

    curatedGroupsEl.appendChild(section);
  }
}

function resetCuratedGroups() {
  selectedCuratedToggleIds.clear();
  for (const t of CURATED_TOGGLES) selectedCuratedToggleIds.add(t.id);
  curatedGroupsEl?.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = true;
  });
  updateCuratedSummary();
  onFilter();
}

function setAllCuratedGroupChecks(checked) {
  curatedGroupsEl?.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = checked;
  });
}

function setupCuratedGate() {
  if (!curatedGroupsEl) return;
  if (!curatedGroupsEl.dataset.ready) {
    curatedGroupsEl.dataset.ready = "1";
    renderCuratedGroups();
    curatedResetBtnEl?.addEventListener("click", () => resetCuratedGroups());
  }
  updateCuratedSummary();
}

/** Consumer-facing surface IDs that should be suppressed when article is B2B/worker-focused */
const CONSUMER_ONLY_SURFACES = ["checkout", "post-purchase", "shipping", "pricing"];

/** Infer all tag surfaces and operational levers that match text; suppress consumer surfaces when B2B dominates.
 * Prioritizes longer (more specific) keyword matches first in each list. Returns matchedKeyword for transparency. */
function inferTagsFromText(item, surfaces, levers, b2bKeywords, consumerKeywords) {
  // Curated mode is snippet-led: use snippet as primary signal; fallback to title if needed.
  const snippetText = item.content_snippet || "";
  const text = snippetText || item.title || "";
  const hasB2b = (b2bKeywords || []).some((k) => matchesKeyword(text, k));
  const hasConsumer = (consumerKeywords || []).some((k) => matchesKeyword(text, k));

  const surfaceMatches = (surfaces || [])
    .filter((s) => s.keywords?.length)
    .map((s) => {
      const matched = matchText(text, s.keywords);
      return matched.length ? { id: s.id, label: s.label, matchedKeyword: matched[0] } : null;
    })
    .filter(Boolean);

  let filteredSurfaces =
    hasB2b && !hasConsumer
      ? surfaceMatches.filter((m) => !CONSUMER_ONLY_SURFACES.includes(m.id))
      : surfaceMatches;

  filteredSurfaces = filteredSurfaces.sort((a, b) => b.matchedKeyword.length - a.matchedKeyword.length);

  const leverMatches = (levers || [])
    .filter((l) => l.keywords?.length)
    .map((l) => {
      const matched = matchText(text, l.keywords);
      return matched.length ? { id: l.id, label: l.label, matchedKeyword: matched[0] } : null;
    })
    .filter(Boolean);

  let filteredLevers =
    hasB2b && !hasConsumer
      ? leverMatches.filter((m) => !["copy", "payment"].includes(m.id))
      : leverMatches;

  filteredLevers = filteredLevers.sort((a, b) => b.matchedKeyword.length - a.matchedKeyword.length);

  return {
    surfaces: filteredSurfaces,
    levers: filteredLevers,
  };
}

/** Parse items.surfaces / items.levers from API (JSON string or array). */
function parseStoredTagIds(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.filter((x) => typeof x === "string");
  const s = String(raw).trim();
  if (!s) return [];
  try {
    const a = JSON.parse(s);
    return Array.isArray(a) ? a.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Use client-side infer only when the row was never classified at ingest (surfaces column missing). */
function shouldInferTagsFromText(item) {
  const s = item.surfaces;
  return s == null || (typeof s === "string" && s.trim() === "");
}

function storedIdsToTagObjects(ids, type, tagSurfaces, operationalLevers) {
  const byId =
    type === "surface"
      ? Object.fromEntries((tagSurfaces || []).map((x) => [x.id, x.label]))
      : Object.fromEntries((operationalLevers || []).map((x) => [x.id, x.label]));
  return ids.map((id) => ({
    id,
    label: byId[id] || id,
    matchedKeyword: null,
    fromIngest: true,
  }));
}

/**
 * Auto tags for an item: all text matches, merged with stored ingest classification when present
 * (union by id so snippet matches still appear even if ingest stored a subset).
 */
function getAutoTagsForItem(item) {
  const inferred = inferTagsFromText(
    item,
    data.tagSurfaces,
    data.operationalLevers,
    data.b2bWorkerContextKeywords,
    data.consumerContextKeywords,
  );
  if (shouldInferTagsFromText(item)) {
    return inferred;
  }
  const storedSurfaces = storedIdsToTagObjects(
    parseStoredTagIds(item.surfaces),
    "surface",
    data.tagSurfaces,
    data.operationalLevers,
  );
  const storedLevers = storedIdsToTagObjects(
    parseStoredTagIds(item.levers),
    "lever",
    data.tagSurfaces,
    data.operationalLevers,
  );
  const surfById = new Map(storedSurfaces.map((s) => [s.id, { ...s }]));
  for (const s of inferred.surfaces) {
    const ex = surfById.get(s.id);
    if (!ex) {
      surfById.set(s.id, {
        id: s.id,
        label: s.label,
        matchedKeyword: s.matchedKeyword,
        fromIngest: false,
      });
    } else if (s.matchedKeyword && !ex.matchedKeyword) {
      ex.matchedKeyword = s.matchedKeyword;
    }
  }
  const levById = new Map(storedLevers.map((l) => [l.id, { ...l }]));
  for (const l of inferred.levers) {
    const ex = levById.get(l.id);
    if (!ex) {
      levById.set(l.id, {
        id: l.id,
        label: l.label,
        matchedKeyword: l.matchedKeyword,
        fromIngest: false,
      });
    } else if (l.matchedKeyword && !ex.matchedKeyword) {
      ex.matchedKeyword = l.matchedKeyword;
    }
  }
  return { surfaces: [...surfById.values()], levers: [...levById.values()] };
}

/** Merge auto tags (ingest or inferred) + user tags, dedupe by (type, id). */
function mergeTags(inferred, userTags, surfaces, levers) {
  const byKey = {};
  const add = (type, id, label, isUser, matchedKeyword, fromIngest) => {
    const k = `${type}:${id}`;
    if (!byKey[k] || isUser) {
      byKey[k] = {
        type,
        id,
        label,
        isUser,
        matchedKeyword: matchedKeyword ?? null,
        fromIngest: !!fromIngest,
      };
    }
  };
  const surfaceById = Object.fromEntries((surfaces || []).map((s) => [s.id, s.label]));
  const leverById = Object.fromEntries((levers || []).map((l) => [l.id, l.label]));
  for (const s of inferred.surfaces)
    add("surface", s.id, s.label, false, s.matchedKeyword, s.fromIngest);
  for (const l of inferred.levers)
    add("lever", l.id, l.label, false, l.matchedKeyword, l.fromIngest);
  for (const t of userTags || []) {
    const label =
      (t.tag_type === "surface" ? surfaceById[t.tag_id] : leverById[t.tag_id]) || t.tag_id;
    add(t.tag_type, t.tag_id, label, true, null, false);
  }
  const list = Object.values(byKey);
  const byMatchLen = (a, b) =>
    (b.matchedKeyword ? String(b.matchedKeyword).length : 0) -
    (a.matchedKeyword ? String(a.matchedKeyword).length : 0);
  return {
    surfaces: list.filter((x) => x.type === "surface").sort(byMatchLen),
    levers: list.filter((x) => x.type === "lever").sort(byMatchLen),
  };
}

function getSelectedCountries() {
  if (countryAllEl?.checked) return [];
  const selected = [];
  countryOptionsEl?.querySelectorAll("input:checked").forEach((cb) => {
    const v = cb.value;
    if (v) selected.push(v);
  });
  return selected;
}

function getSelectedSources() {
  if (sourceAllEl?.checked) return [];
  const selected = [];
  sourceOptionsEl?.querySelectorAll("input:checked").forEach((cb) => {
    const v = cb.value;
    if (v) selected.push(v);
  });
  return selected;
}

function getSelectedRegionGroups() {
  const selected = [];
  regionOptionsEl?.querySelectorAll("input:checked").forEach((cb) => {
    const v = cb.value;
    if (v) selected.push(v);
  });
  return selected;
}

/** Union of explicit country checkboxes and countries implied by region groups; `null` = no country constraint. */
function resolveCountryFilterCodes() {
  const explicit = getSelectedCountries();
  const groups = getSelectedRegionGroups();
  const fromRegions = [];
  for (const g of groups) {
    const codes = REGION_GROUPS[g];
    if (codes) fromRegions.push(...codes);
  }
  const regionCodes = [...new Set(fromRegions)];
  if (explicit.length === 0 && regionCodes.length === 0) return null;
  if (explicit.length === 0) return regionCodes;
  if (regionCodes.length === 0) return [...new Set(explicit)];
  return [...new Set([...explicit, ...regionCodes])];
}

function getSelectedTags() {
  if (tagAllEl?.checked) return [];
  const selected = [];
  tagOptionsEl?.querySelectorAll("input:checked").forEach((cb) => {
    const v = cb.value;
    if (v) selected.push(v);
  });
  return selected;
}

function storySignalCount(item) {
  const n = Number(item.story_surface_count ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function getPressSignalMin() {
  const raw = Number(pressSignalFilterEl?.value ?? 1);
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

function getPressSignalSortMode() {
  return String(pressSignalSortEl?.value || "default");
}

function itemSortDateValue(item) {
  const raw = item.iso_date || item.pub_date || item.created_at || "";
  return Date.parse(String(raw).replace(" ", "T")) || 0;
}

/** Strong relevance signal: don’t exclude these even if they match an ignore keyword (e.g. country-of-origin) */
function hasStrongRelevanceSignal(item) {
  const text = ((item.title || "") + " " + (item.content_snippet || "")).toLowerCase();
  const relevance = (data.relevanceKeywords || []).map((k) => k.toLowerCase());
  const ecommerce = (data.ecommerceKeywords || []).map((k) => k.toLowerCase());
  return relevance.some((k) => text.includes(k)) || ecommerce.some((k) => text.includes(k));
}

const FUZZY_SEARCH_SNIPPET_MAX = 4000;

function buildSearchHaystack(item) {
  const title = item.title || "";
  const snip = (item.content_snippet || "").slice(0, FUZZY_SEARCH_SNIPPET_MAX);
  return `${title} ${snip}`;
}

/** True if every character of q appears in order in h (case-insensitive). */
function isSubsequenceMatch(q, h) {
  if (!q) return true;
  let j = 0;
  const ql = q.toLowerCase();
  const hl = h.toLowerCase();
  for (let i = 0; i < hl.length && j < ql.length; i++) {
    if (hl[i] === ql[j]) j++;
  }
  return j === ql.length;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

function extractWords(text) {
  const s = String(text).toLowerCase();
  try {
    const m = s.match(/[\p{L}\p{N}']+/gu);
    return m || [];
  } catch {
    return s.match(/[\w']+/g) || [];
  }
}

function maxTypoDistance(tokenLen) {
  if (tokenLen <= 3) return 1;
  if (tokenLen <= 8) return 2;
  return Math.min(3, Math.floor(tokenLen / 3));
}

/** One search token matches haystack: substring, ordered subsequence, or near word match (typos). */
function fuzzyTokenMatches(token, haystack) {
  const t = token.trim().toLowerCase();
  if (!t) return true;
  const h = haystack;
  if (h.toLowerCase().includes(t)) return true;
  if (isSubsequenceMatch(t, h)) return true;
  const maxDist = maxTypoDistance(t.length);
  const words = extractWords(h);
  for (const w of words) {
    if (w.length < Math.max(1, t.length - maxDist)) continue;
    if (w.length > t.length + maxDist) continue;
    if (levenshtein(t, w) <= maxDist) return true;
  }
  return false;
}

/** Multi-word: every token must match somewhere in title + snippet (AND). */
function matchesFuzzySearch(query, item) {
  const q = query.trim();
  if (!q) return true;
  const hay = buildSearchHaystack(item);
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((tok) => fuzzyTokenMatches(tok, hay));
}

function hasUsableContent(item) {
  const title = String(item?.title ?? "").trim();
  const snippet = String(item?.content_snippet ?? "").trim();
  const link = String(item?.link ?? "").trim();
  const titleLooksNull = /^null$/i.test(title);
  const snippetLooksNull = /^null$/i.test(snippet);
  if (!link) return false;
  if ((!title || titleLooksNull) && (!snippet || snippetLooksNull)) return false;
  return true;
}

function getItemMatchedKeywords(item) {
  const list = item?.matched_keywords;
  return Array.isArray(list) ? list : [];
}

/** API `signal_strength` rank for sort only (not displayed as a score). */
const SIGNAL_STRENGTH_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

function maxSignalStrengthRank(item) {
  let m = 0;
  for (const k of getItemMatchedKeywords(item)) {
    const s = String(k.signal_strength || "").toLowerCase();
    m = Math.max(m, SIGNAL_STRENGTH_RANK[s] || 0);
  }
  return m;
}

function feedPriorityBadgeHtml(item) {
  const p = String(item.feed_priority || "").toLowerCase().trim();
  if (p !== "critical" && p !== "high") return "";
  const label = p === "critical" ? "P1" : "P2";
  const cls = p === "critical" ? "critical" : "high";
  return `<span class="feed-tier-badge feed-tier-badge--${cls}" title="Feed priority (metadata only; does not set item urgency)">${label}</span>`;
}

function resetTagFiltersToAll() {
  if (!tagAllEl) return;
  tagAllEl.checked = true;
  tagOptionsEl?.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.checked = false;
  });
  updateMultiselectLabels();
}

function getSignalKeywordViewFilter() {
  return String(signalKeywordFilterEl?.value || "all");
}

function itemPassesSignalKeywordViewFilter(item, mode) {
  const keys = getItemMatchedKeywords(item);
  if (mode === "all") return true;
  if (mode === "has_any") return keys.length > 0;
  const typeOf = (k) => String(k?.keyword_type || "").toLowerCase();
  if (mode === "enforcement") return keys.some((k) => typeOf(k) === "enforcement");
  if (mode === "deadline_timing")
    return keys.some((k) => {
      const t = typeOf(k);
      return t === "deadline" || t === "timing";
    });
  if (mode === "litigation") return keys.some((k) => typeOf(k) === "litigation");
  if (mode === "proposal") return keys.some((k) => typeOf(k) === "proposal");
  if (mode === "domain_journey") {
    const domainTypes = new Set(["pdp", "pricing", "checkout", "shipping", "privacy", "accessibility"]);
    return keys.some((k) => domainTypes.has(typeOf(k)));
  }
  return true;
}

function buildKeywordSignalsHtml(item) {
  const signals = getItemMatchedKeywords(item);
  if (!signals.length) return "";
  const byType = new Map();
  for (const k of signals) {
    const typ = String(k.keyword_type || "context").toLowerCase();
    if (!byType.has(typ)) byType.set(typ, []);
    byType.get(typ).push(k);
  }
  let html = `<div class="item-signals" aria-label="Matched regulatory phrases">`;
  const seen = new Set();
  const emitGroup = (typ, list) => {
    const groupLabel = KEYWORD_SIGNAL_GROUP_LABEL[typ] || typ;
    html += `<div class="item-signals-group">`;
    html += `<span class="item-signals-group-label">${escapeHtml(groupLabel)}</span>`;
    html += `<span class="item-signals-group-chips">`;
    for (const k of list) {
      const isDateRef = typ === "enforcement" || typ === "deadline" || typ === "timing";
      const signalText = isDateRef ? `Date ref: ${k.keyword}` : k.keyword;
      let signalTitle = isDateRef ? `Date or enforcement reference (${typ})` : typ;
      if (k.match_source === "locale_map") {
        signalTitle = `Non-English text mapped to: ${k.keyword} (${typ})`;
      }
      html += `<span class="keyword-signal keyword-signal-${escapeAttr(typ)}" title="${escapeAttr(signalTitle)}">${escapeHtml(String(signalText))}</span>`;
    }
    html += `</span></div>`;
  };
  for (const typ of KEYWORD_SIGNAL_TYPE_ORDER) {
    const list = byType.get(typ);
    if (!list?.length) continue;
    seen.add(typ);
    emitGroup(typ, list);
  }
  for (const [typ, list] of byType.entries()) {
    if (seen.has(typ)) continue;
    emitGroup(typ, list);
  }
  html += `</div>`;
  return html;
}

const _DATE_SCAN_MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December";
/** Words that suggest a calendar date is regulatory / enforcement-related (not every date in text). */
const _DATE_SCAN_TRIGGERS =
  "effective|effective\\s+from|takes?\\s+effect|comes?\\s+into\\s+force|enters?\\s+into\\s+force|in\\s+force|applicable\\s+from|commencing\\s+on|starting\\s+on|enforceable|must\\s+comply|compliance\\s+date|compliance\\s+deadline|no\\s+later\\s+than|not\\s+later\\s+than|deadline|enforcement\\s+date|penalt|sanction|enforce(?:ment)?|violation|order|cease|desist|fine|penalty";

function _stripHtmlForDateScan(html) {
  return String(html || "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function _articleHaystackForEnforcementDates(item) {
  const title = String(item?.title || "");
  const snip = String(item?.content_snippet || "");
  const body = _stripHtmlForDateScan(item?.content || "");
  return `${title}\n${snip}\n${body}`.slice(0, 150000);
}

function _tryParseDateDisplay(display) {
  const cleaned = String(display || "")
    .replace(/\s+/g, " ")
    .replace(/(\d+)(st|nd|rd|th)\b/gi, "$1")
    .trim();
  const t = Date.parse(cleaned);
  return Number.isFinite(t) ? t : null;
}

/**
 * Pull human-readable enforcement / compliance dates from article text (title, snippet, HTML body).
 * Conservative: only dates near regulatory trigger words to reduce noise.
 */
function extractEnforcementDatesFromArticleText(text) {
  if (!text || text.length < 8) return [];
  const hay = text.replace(/\u00a0/g, " ");
  const trig = `(?:${_DATE_SCAN_TRIGGERS})`;
  const mo = `(?:${_DATE_SCAN_MONTHS})`;
  const patterns = [
    new RegExp(`\\b${trig}\\b[^.\\n]{0,180}?(\\d{1,2}\\s+${mo}\\s*,?\\s*\\d{4})`, "gi"),
    new RegExp(`\\b${trig}\\b[^.\\n]{0,180}?(${mo}\\s+\\d{1,2},?\\s*\\d{4})`, "gi"),
    new RegExp(`\\b${trig}\\b[^.\\n]{0,180}?(\\d{4}-\\d{2}-\\d{2})`, "gi"),
    new RegExp(`(\\d{1,2}\\s+${mo}\\s*,?\\s*\\d{4})[^.\\n]{0,100}?\\b${trig}\\b`, "gi"),
    new RegExp(`(${mo}\\s+\\d{1,2},?\\s*\\d{4})[^.\\n]{0,100}?\\b${trig}\\b`, "gi"),
    new RegExp(`(\\d{4}-\\d{2}-\\d{2})[^.\\n]{0,100}?\\b${trig}\\b`, "gi"),
  ];
  const out = [];
  const seen = new Set();
  for (const re of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(hay)) != null) {
      const display = String(m[1] || "").replace(/\s+/g, " ").trim();
      if (display.length < 6) continue;
      const key = display.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const start = Math.max(0, m.index - 20);
      const context = hay.slice(start, Math.min(hay.length, m.index + (m[0]?.length || 0) + 40)).replace(/\s+/g, " ");
      const ts = _tryParseDateDisplay(display);
      out.push({ display, context, ts: ts ?? 9e12 });
    }
  }
  out.sort((a, b) => (a.ts ?? 9e12) - (b.ts ?? 9e12));
  return out.slice(0, 5).map(({ display, context }) => ({ display, context }));
}

function buildEnforcementDatesCalloutHtml(item) {
  const dates = extractEnforcementDatesFromArticleText(_articleHaystackForEnforcementDates(item));
  if (!dates.length) return "";
  let html = `<div class="item-enforcement-dates" aria-label="Enforcement or compliance-related dates found in the article">`;
  html += `<span class="item-enforcement-dates-label">Enforcement dates</span>`;
  html += `<div class="item-enforcement-dates-chips">`;
  for (const d of dates) {
    html += `<span class="item-enforcement-date-chip" title="${escapeAttr(d.context)}">${escapeHtml(d.display)}</span>`;
  }
  html += `</div></div>`;
  return html;
}

function filterItems(
  items,
  search,
  countryAllowlist,
  sources,
  tagKeys,
  pressSignalMin,
  curatedToggleIds,
  filterOpts,
) {
  let out = items.filter((i) => hasUsableContent(i));
  const curatedOn = isCuratedModeEnabled();
  // Hard exclusion: items matching any ignore keyword are excluded, unless they have strong relevance (e.g. country of origin, e-commerce)
  const ignoreKw = data.ignoreKeywords || [];
  if (curatedOn && ignoreKw.length > 0) {
    const lowerIgnore = ignoreKw.map((k) => k.toLowerCase());
    out = out.filter((i) => {
      const text = ((i.title || "") + " " + (i.content_snippet || "")).toLowerCase();
      const hasIgnore = lowerIgnore.some((k) => text.includes(k));
      if (hasIgnore && hasStrongRelevanceSignal(i)) return true;
      return !hasIgnore;
    });
  }
  if (search) {
    out = out.filter((i) => matchesFuzzySearch(search, i));
  }
  if (countryAllowlist != null && countryAllowlist.length > 0) {
    out = out.filter((i) => {
      const cc = resolveItemCountryCode(i);
      return !!cc && countryAllowlist.includes(cc);
    });
  }
  if (sources.length > 0) {
    out = out.filter((i) => sources.includes(i.source_type));
  }
  if (tagKeys && tagKeys.length > 0) {
    const want = new Set(tagKeys);
    out = out.filter((i) => {
      const tags = inferAndMergeTagsForItem(i);
      const keys = [
        ...tags.surfaces.map((t) => `surface:${t.id}`),
        ...tags.levers.map((t) => `lever:${t.id}`),
      ];
      return keys.some((k) => want.has(k));
    });
  }
  if (pressSignalMin > 1) {
    out = out.filter((i) => storySignalCount(i) >= pressSignalMin);
  }
  if (curatedOn && curatedToggleIds && curatedToggleIds.size > 0) {
    out = out.filter((i) => {
      if (curatedLooksLikeOffTopicPhysicalRecall(i) && !curatedHasDigitalRegulatoryAnchor(i)) return false;
      for (const toggleId of curatedToggleIds) {
        if (curatedToggleMatchesItem(i, toggleId)) return true;
      }
      return false;
    });
  }
  const sk = filterOpts?.signalKeywordFilter ?? getSignalKeywordViewFilter();
  if (sk !== "all") {
    out = out.filter((i) => itemPassesSignalKeywordViewFilter(i, sk));
  }
  return out;
}

function sortItemsByPressSignal(items, mode) {
  if (mode === "default" || mode === "enforcement_first" || mode === "signal_strength_desc") return items;
  const dir = mode === "signal_asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const sa = storySignalCount(a);
    const sb = storySignalCount(b);
    if (sa !== sb) return dir * (sa - sb);
    return itemSortDateValue(b) - itemSortDateValue(a);
  });
}

function itemHasMatchedKeywordType(item, typeLower) {
  return getItemMatchedKeywords(item).some(
    (k) => String(k?.keyword_type || "").toLowerCase() === typeLower,
  );
}

function countMatchedKeywordTypes(item, types) {
  const want = new Set(types);
  let n = 0;
  for (const k of getItemMatchedKeywords(item)) {
    if (want.has(String(k?.keyword_type || "").toLowerCase())) n += 1;
  }
  return n;
}

/** Sort digest list: supports press-signal sorts and keyword-first enforcement ordering. */
function sortDigestItems(items, mode) {
  if (mode === "signal_strength_desc") {
    return [...items].sort((a, b) => {
      const ra = maxSignalStrengthRank(a);
      const rb = maxSignalStrengthRank(b);
      if (ra !== rb) return rb - ra;
      const ae = itemHasMatchedKeywordType(a, "enforcement");
      const be = itemHasMatchedKeywordType(b, "enforcement");
      if (ae !== be) return ae ? -1 : 1;
      const sa = storySignalCount(a);
      const sb = storySignalCount(b);
      if (sa !== sb) return sb - sa;
      return itemSortDateValue(b) - itemSortDateValue(a);
    });
  }
  if (mode === "enforcement_first") {
    return [...items].sort((a, b) => {
      const ae = itemHasMatchedKeywordType(a, "enforcement");
      const be = itemHasMatchedKeywordType(b, "enforcement");
      if (ae !== be) return ae ? -1 : 1;
      const ad = countMatchedKeywordTypes(a, ["deadline", "timing"]);
      const bd = countMatchedKeywordTypes(b, ["deadline", "timing"]);
      if (ad !== bd) return bd - ad;
      const sa = storySignalCount(a);
      const sb = storySignalCount(b);
      if (sa !== sb) return sb - sa;
      return itemSortDateValue(b) - itemSortDateValue(a);
    });
  }
  return sortItemsByPressSignal(items, mode);
}

function renderFeedNameHtml(feedName, tierItem) {
  let html = `<div class="feed-name">`;
  html += `<span class="feed-name-label">${escapeHtml(feedName || "Unknown")}</span>`;
  if (tierItem) html += feedPriorityBadgeHtml(tierItem);
  html += `</div>`;
  return html;
}

function renderDigestItemCardHtml(item) {
  const title = (item.title || "(no title)").replace(/[[\]]/g, "");
  const tags = inferAndMergeTagsForItem(item);
  let html = `<div class="item" data-item-id="${item.id}">`;
  html += `<div class="item-header">`;
  html += `<div class="item-title-row">`;
  html += `<a class="item-link" href="${escapeAttr(item.link)}" target="_blank" rel="noopener">${escapeHtml(title)}</a>`;
  const surf = item.story_surface_count != null ? Number(item.story_surface_count) : 1;
  if (surf > 1) {
    html += `<button type="button" class="btn-story-surfaces" data-item-id="${item.id}" title="Press coverage signal — click to see all sources" aria-label="Press coverage signal: this story appeared in ${surf} sources"><span class="story-signal-label">Press signal</span><span class="story-signal-count">${surf} sources</span></button>`;
  } else {
    html += `<span class="story-signal-static" title="Press coverage signal (single source in current window)" aria-label="Press signal: 1 source in current window"><span class="story-signal-label">Press signal</span><span class="story-signal-count">1 source</span></span>`;
  }
  html += `</div>`;
  html += `<button type="button" class="btn-hide-item" aria-label="Hide article" title="Hide">×</button>`;
  html += `</div>`;
  html += buildKeywordSignalsHtml(item);
  html += buildEnforcementDatesCalloutHtml(item);
  html += `<div class="item-tags-row">`;
  html += `<div class="item-tags">`;
  for (const t of [...tags.surfaces, ...tags.levers]) {
    const cls = t.type === "surface" ? "badge-surface" : "badge-lever";
    const titleAttr = t.matchedKeyword
      ? `Matched: "${t.matchedKeyword}"`
      : t.isUser
        ? t.type === "surface"
          ? "Surface tag (added)"
          : "Operational lever (added)"
        : t.fromIngest
          ? t.type === "surface"
            ? "Surface tag (ingest)"
            : "Operational lever (ingest)"
          : t.type === "surface"
            ? "Surface tag"
            : "Operational lever";
    html += `<span class="badge ${cls}" data-tag-type="${escapeAttr(t.type)}" data-tag-id="${escapeAttr(t.id)}" title="${escapeAttr(titleAttr)}">`;
    html += escapeHtml(t.label);
    if (t.isUser) {
      html += `<button type="button" class="tag-remove" aria-label="Remove tag">×</button>`;
    }
    html += `</span>`;
  }
  html += `</div>`;
  html += `<div class="item-tag-add">`;
  html += `<button type="button" class="btn-add-tag" aria-haspopup="listbox" aria-expanded="false">+ Add tag</button>`;
  html += `<div class="tag-dropdown" role="listbox" hidden>`;
  if (data.tagSurfaces?.length) {
    html += `<div class="tag-dropdown-group"><span class="tag-dropdown-label">Surfaces</span>`;
    for (const s of data.tagSurfaces) {
      const already = tags.surfaces.some((x) => x.id === s.id);
      html += `<button type="button" class="tag-dropdown-item" data-tag-type="surface" data-tag-id="${escapeAttr(s.id)}" ${already ? "disabled" : ""}>${escapeHtml(s.label)}</button>`;
    }
    html += `</div>`;
  }
  if (data.operationalLevers?.length) {
    html += `<div class="tag-dropdown-group"><span class="tag-dropdown-label">Levers</span>`;
    for (const l of data.operationalLevers) {
      const already = tags.levers.some((x) => x.id === l.id);
      html += `<button type="button" class="tag-dropdown-item" data-tag-type="lever" data-tag-id="${escapeAttr(l.id)}" ${already ? "disabled" : ""}>${escapeHtml(l.label)}</button>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
  html += `</div>`;
  html += `</div>`;
  html += buildItemPublicationMetaHtml(item);
  if (item.content_snippet) {
    const full = item.content_snippet;
    const snip = escapeHtml(full.length > 200 ? full.slice(0, 200) : full);
    const ell = full.length > 200 ? "…" : "";
    html += `<div class="item-snippet">${snip}${ell}</div>`;
  }
  html += `</div>`;
  return html;
}

function render(items) {
  const hidden = getHiddenItemIds();
  const notHidden = items.filter((i) => !hidden.has(i.id));
  const filterArgs = [
    notHidden,
    searchEl.value.trim(),
    resolveCountryFilterCodes(),
    getSelectedSources(),
    getSelectedTags(),
    getPressSignalMin(),
    getSelectedCuratedToggleIds(),
  ];
  const relaxedPhrase = filterItems(...filterArgs, { signalKeywordFilter: "all" });
  const filtered = filterItems(...filterArgs);
  const sortedFiltered = sortDigestItems(filtered, getPressSignalSortMode());
  countEl.textContent = `${sortedFiltered.length} items`;

  if (sortedFiltered.length === 0) {
    contentEl.classList.add("hidden");
    emptyEl.classList.remove("hidden");
    const sk = getSignalKeywordViewFilter();
    const phraseBlocked = sk !== "all" && relaxedPhrase.length > 0;
    emptyEl.querySelector("p:first-child").textContent = phraseBlocked
      ? "No items match the current “Matched phrases” filter."
      : "No journey-relevant items in this window.";
    emptyEl.querySelector(".empty-hint").innerHTML = phraseBlocked
      ? 'Reset the <strong>Matched phrases</strong> dropdown to “All items”, widen the time window, or relax other filters.'
      : "Try widening the time window or use Manage Feeds to ingest.";
    return;
  }

  emptyEl.classList.add("hidden");
  contentEl.classList.remove("hidden");

  const sortMode = getPressSignalSortMode();
  const grouped = groupItems(sortedFiltered);
  const order = ["regulator", "law_firm", "standards", "watchdog", "other"];

  let html = "";
  for (const st of order) {
    const feeds = grouped[st];
    if (!feeds || Object.keys(feeds).length === 0) continue;

    const label = data.sourceTypeLabels[st] || st.replace("_", " ");
    const badgeClass = `badge-${st}`;
    html += `<div class="section">`;
    html += `<div class="section-header"><span class="badge ${badgeClass}">${label}</span></div>`;

    if (sortMode === "default") {
      for (const [feedName, feedItems] of Object.entries(feeds)) {
        html += `<div class="feed-group">`;
        html += renderFeedNameHtml(feedName, feedItems[0]);
        for (const item of feedItems) {
          html += renderDigestItemCardHtml(item);
        }
        html += `</div>`;
      }
    } else {
      const sourceItems = sortedFiltered.filter((i) => (i.source_type || "other") === st);
      html += `<div class="feed-group">`;
      let lastFeed = "";
      for (const item of sourceItems) {
        const feedName = item.feed_name || "Unknown";
        if (feedName !== lastFeed) {
          html += renderFeedNameHtml(feedName, item);
          lastFeed = feedName;
        }
        html += renderDigestItemCardHtml(item);
      }
      html += `</div>`;
    }
    html += `</div>`;
  }

  contentEl.innerHTML = html;
  setupTagListeners();
  updateHiddenPanel();
}

function updateHiddenPanel() {
  const hidden = getHiddenItemIds();
  const hiddenCount = hidden.size;
  const toggleBtn = document.getElementById("toggle-hidden-btn");
  const countSpan = document.getElementById("hidden-count");
  const panel = document.getElementById("hidden-panel");
  const listEl = document.getElementById("hidden-list");

  if (!toggleBtn || !panel || !listEl) return;

  if (hiddenCount === 0) {
    toggleBtn.classList.add("hidden");
    panel.classList.add("hidden");
    listEl.innerHTML = "";
    return;
  }

  countSpan.textContent = hiddenCount;
  toggleBtn.classList.remove("hidden");

  const hiddenItems = (data.items || []).filter((i) => hidden.has(i.id));
  if (hiddenItems.length === 0) {
    listEl.innerHTML = '<p class="hidden-empty">Hidden articles outside current time window.</p>';
  } else {
    listEl.innerHTML = hiddenItems
      .map(
        (item) => `
      <div class="hidden-item" data-item-id="${item.id}">
        <a class="hidden-item-link" href="${escapeAttr(item.link)}" target="_blank" rel="noopener">${escapeHtml((item.title || "(no title)").slice(0, 80))}${(item.title || "").length > 80 ? "…" : ""}</a>
        <button type="button" class="btn-unhide" data-item-id="${item.id}" aria-label="Unhide">Unhide</button>
      </div>`,
      )
      .join("");
  }
}

async function addTag(itemId, tagType, tagId) {
  try {
    const res = await fetch(`/api/items/${itemId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_type: tagType, tag_id: tagId }),
    });
    if (res.ok) render(data.items);
  } catch (e) {
    console.error("Failed to add tag", e);
  }
}

async function removeTag(itemId, tagType, tagId) {
  try {
    const res = await fetch(`/api/items/${itemId}/tags/${tagType}/${encodeURIComponent(tagId)}`, {
      method: "DELETE",
    });
    if (res.ok || res.status === 404) render(data.items);
  } catch (e) {
    console.error("Failed to remove tag", e);
  }
}

function onDigestContentClick(e) {
  const storyBtn = e.target.closest(".btn-story-surfaces");
  if (storyBtn) {
    e.preventDefault();
    e.stopPropagation();
    const itemId = parseInt(storyBtn.dataset.itemId ?? "0", 10);
    if (itemId) void openStorySurfacesModal(itemId);
    return;
  }
  const addBtn = e.target.closest(".btn-add-tag");
  const dropdownItem = e.target.closest(".tag-dropdown-item:not([disabled])");
  const removeBtn = e.target.closest(".tag-remove");
  if (addBtn) {
    e.stopPropagation();
    const itemRow = addBtn.closest(".item");
    const itemId = parseInt(itemRow?.dataset?.itemId ?? "0", 10);
    const dropdown = addBtn.nextElementSibling;
    const isOpen = !dropdown?.hasAttribute("hidden");
    contentEl.querySelectorAll(".tag-dropdown").forEach((d) => d.setAttribute("hidden", ""));
    contentEl
      .querySelectorAll(".btn-add-tag")
      .forEach((b) => b.setAttribute("aria-expanded", "false"));
    if (!isOpen) {
      dropdown?.removeAttribute("hidden");
      addBtn.setAttribute("aria-expanded", "true");
    }
    return;
  }
  if (dropdownItem) {
    e.stopPropagation();
    const itemRow = dropdownItem.closest(".item");
    const itemId = parseInt(itemRow?.dataset?.itemId ?? "0", 10);
    const tagType = dropdownItem.dataset.tagType;
    const tagId = dropdownItem.dataset.tagId;
    if (tagType && tagId) addTag(itemId, tagType, tagId);
    contentEl.querySelectorAll(".tag-dropdown").forEach((d) => d.setAttribute("hidden", ""));
    contentEl
      .querySelectorAll(".btn-add-tag")
      .forEach((b) => b.setAttribute("aria-expanded", "false"));
    return;
  }
  if (removeBtn) {
    e.preventDefault();
    e.stopPropagation();
    const badge = removeBtn.closest(".badge");
    const itemRow = badge?.closest(".item");
    const itemId = parseInt(itemRow?.dataset?.itemId ?? "0", 10);
    const tagType = badge?.dataset?.tagType;
    const tagId = badge?.dataset?.tagId;
    if (tagType && tagId) removeTag(itemId, tagType, tagId);
    return;
  }
  const hideBtn = e.target.closest(".btn-hide-item");
  if (hideBtn) {
    e.preventDefault();
    e.stopPropagation();
    const itemRow = hideBtn.closest(".item");
    const itemId = parseInt(itemRow?.dataset?.itemId ?? "0", 10);
    if (itemId) {
      addHiddenItemId(itemId);
      itemRow.remove();
      const remaining = contentEl.querySelectorAll(".item").length;
      countEl.textContent = `${remaining} items`;
    }
  }
}

function setupTagListeners() {
  if (!contentEl) return;
  if (!contentEl.dataset.itemClickBound) {
    contentEl.dataset.itemClickBound = "1";
    contentEl.addEventListener("click", onDigestContentClick);
  }
  if (!contentEl.dataset.tagListenersSetup) {
    contentEl.dataset.tagListenersSetup = "1";
    document.addEventListener("click", () => {
      contentEl.querySelectorAll(".tag-dropdown").forEach((d) => d.setAttribute("hidden", ""));
      contentEl
        .querySelectorAll(".btn-add-tag")
        .forEach((b) => b.setAttribute("aria-expanded", "false"));
    });
  }
}

function closeStorySurfacesModal() {
  const modal = document.getElementById("story-surfaces-modal");
  modal?.classList.add("hidden");
}

function syncStorySignalCountForItem(itemId, count) {
  const n = Number(count ?? 1);
  const safe = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  const row = (data.items || []).find((i) => i.id === itemId);
  if (row) row.story_surface_count = safe;
  const btn = document.querySelector(`.btn-story-surfaces[data-item-id="${String(itemId)}"]`);
  if (!btn) return;
  const countEl = btn.querySelector(".story-signal-count");
  if (countEl) countEl.textContent = safe === 1 ? "1 source" : `${safe} sources`;
  btn.setAttribute(
    "aria-label",
    `Press coverage signal: this story appeared in ${safe} ${safe === 1 ? "source" : "sources"}`,
  );
}

function formatStorySurfaceDate(iso) {
  if (!iso) return "—";
  const s = String(iso).trim();
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

async function openStorySurfacesModal(itemId) {
  const modal = document.getElementById("story-surfaces-modal");
  const titleEl = document.getElementById("story-surfaces-modal-title");
  const bodyEl = document.getElementById("story-surfaces-modal-body");
  if (!modal || !titleEl || !bodyEl) return;
  modal.classList.remove("hidden");
  titleEl.textContent = "Press coverage signal";
  bodyEl.innerHTML = '<p class="story-surfaces-loading">Loading…</p>';
  try {
    const res = await fetch(`/api/items/${itemId}/story-surfaces`);
    if (!res.ok) throw new Error("request failed");
    const j = await res.json();
    const n = j.story_surface_count ?? 1;
    syncStorySignalCountForItem(itemId, n);
    const labels = data.countryLabels || {};
    titleEl.textContent = `Press coverage signal (${n} sources)`;
    const c = j.canonical || {};
    const countryCanon = c.country ? labels[c.country] || c.country : "";
    const canonMeta = [c.feed_name, c.source_type, countryCanon].filter(Boolean).join(" · ");
    let html = `<p class="story-surfaces-intro">Use this as a press-impact signal: how broadly the same story propagated across distinct sources. Count includes this digest entry plus each distinct feed+URL seen for the same dedup fingerprint.</p>`;
    html += `<p class="story-surfaces-subhead">This entry (canonical)</p>`;
    html += `<div class="story-surfaces-canonical">`;
    html += `<div class="story-surfaces-canonical-title">${escapeHtml(c.title || "(no title)")}</div>`;
    html += `<div class="story-surfaces-canonical-meta">${escapeHtml(canonMeta)}${c.iso_date ? ` · ${escapeHtml(formatStorySurfaceDate(c.iso_date))}` : ""}</div>`;
    html += c.link
      ? `<div class="story-surfaces-open"><a href="${escapeAttr(c.link)}" target="_blank" rel="noopener">Open link</a></div>`
      : "";
    html += `</div>`;
    const mentions = Array.isArray(j.mentions) ? j.mentions : [];
    if (mentions.length === 0) {
      html += `<p class="story-surfaces-loading">No other sources recorded yet (count may update on the next ingest).</p>`;
    } else {
      html += `<p class="story-surfaces-subhead">Also surfaced in</p><ul class="story-surfaces-list">`;
      for (const m of mentions) {
        const co = m.country ? labels[m.country] || m.country : "";
        const meta = [m.feed_name || m.feed_id, m.source_type || "", co].filter(Boolean).join(" · ");
        const tit = escapeHtml(m.title || "(no title)");
        html += `<li>`;
        html += `<div class="story-surfaces-mention-title">${tit}</div>`;
        html += `<div class="story-surfaces-mention-meta">${escapeHtml(meta)}<span class="sep">·</span>${escapeHtml(formatStorySurfaceDate(m.seen_at))}</div>`;
        if (m.link) {
          html += `<div class="story-surfaces-open"><a href="${escapeAttr(m.link)}" target="_blank" rel="noopener">Open link</a></div>`;
        }
        html += `</li>`;
      }
      html += `</ul>`;
    }
    bodyEl.innerHTML = html;
  } catch (err) {
    console.error(err);
    bodyEl.innerHTML = '<p class="story-surfaces-error">Could not load other sources.</p>';
  }
}

function initStorySurfacesModal() {
  const modal = document.getElementById("story-surfaces-modal");
  if (!modal || modal.dataset.bound === "1") return;
  modal.dataset.bound = "1";
  modal.querySelector(".story-surfaces-modal-backdrop")?.addEventListener("click", closeStorySurfacesModal);
  modal.querySelector(".story-surfaces-modal-close")?.addEventListener("click", closeStorySurfacesModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) closeStorySurfacesModal();
  });
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function escapeAttr(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML.replace(/"/g, "&quot;");
}

/** Human-readable host / label from the RSS feed URL (not the taxonomy Domain column). */
function sourceSiteFromFeedUrl(raw) {
  const s = (raw || "").trim();
  if (!s) return "—";
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./i, "");
    if (!host) return "—";
    if (host === "news.google.com") return "Google News";
    return host;
  } catch {
    return "—";
  }
}

function getInsightsSelectedRegionBuckets() {
  if (!insightsRegionStripEl) return [];
  const selected = [];
  insightsRegionStripEl.querySelectorAll("input.insights-region-cb:checked").forEach((cb) => {
    if (cb.value) selected.push(cb.value);
  });
  return selected;
}

function insightsRegionBucketIndex(f) {
  const b = countryToManageRegionBucket(f.country);
  const i = MANAGE_FEED_REGION_ORDER.indexOf(b);
  return i === -1 ? 999 : i;
}

function compareInsightsFeedRows(a, b, sortKey, _countryLabels) {
  const nameCmp = (x, y) =>
    (x.name || "").localeCompare(y.name || "", undefined, { sensitivity: "base" });
  switch (sortKey) {
    case "region_group": {
      const ia = insightsRegionBucketIndex(a);
      const ib = insightsRegionBucketIndex(b);
      if (ia !== ib) return ia - ib;
      const ca = (a.country || "").localeCompare(b.country || "");
      if (ca !== 0) return ca;
      return nameCmp(a, b);
    }
    case "name_asc":
      return nameCmp(a, b) || (a.country || "").localeCompare(b.country || "");
    case "site_asc": {
      const sa = sourceSiteFromFeedUrl(a.url);
      const sb = sourceSiteFromFeedUrl(b.url);
      const c = sa.localeCompare(sb);
      if (c !== 0) return c;
      return nameCmp(a, b);
    }
    case "health_desc": {
      const d = feedHealthRank(a.health_status) - feedHealthRank(b.health_status);
      if (d !== 0) return d;
      return nameCmp(a, b);
    }
    case "source_asc": {
      const c = (a.source_type || "").localeCompare(b.source_type || "");
      if (c !== 0) return c;
      return nameCmp(a, b);
    }
    case "country_asc":
    default: {
      const c = (a.country || "").localeCompare(b.country || "");
      if (c !== 0) return c;
      return nameCmp(a, b);
    }
  }
}

function loadInsights() {
  if (!insightsTableBodyEl) return;
  fetch("/api/feed-sources")
    .then((r) => r.json())
    .then((json) => {
      const feeds = Array.isArray(json.feeds) ? json.feeds : [];
      insightsData = feeds;
      populateInsightsFilters(feeds, json.countryLabels || {}, json.sourceTypeLabels || {});
      renderInsights(feeds, json.countryLabels || {}, json.sourceTypeLabels || {});
    })
    .catch(() => {
      insightsTableBodyEl.innerHTML =
        '<tr><td colspan="7" class="feeds-loading">Failed to load insights.</td></tr>';
    });
}

function populateInsightsFilters(feeds, countryLabels, sourceTypeLabels) {
  if (insightsCountryFilterEl) {
    const countries = [...new Set(feeds.map((f) => (f.country || "").trim()).filter(Boolean))].sort();
    insightsCountryFilterEl.innerHTML = '<option value="">All countries</option>';
    for (const c of countries) {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = countryLabels[c] || c;
      insightsCountryFilterEl.appendChild(opt);
    }
  }
  if (insightsSourceFilterEl) {
    const srcs = [...new Set(feeds.map((f) => (f.source_type || "").trim()).filter(Boolean))].sort();
    insightsSourceFilterEl.innerHTML = '<option value="">All source types</option>';
    for (const s of srcs) {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = sourceTypeLabels[s] || s;
      insightsSourceFilterEl.appendChild(opt);
    }
  }
}

function renderInsights(feeds, countryLabels, sourceTypeLabels) {
  if (!insightsTableBodyEl) return;
  const q = (insightsSearchEl?.value || "").trim().toLowerCase();
  const countryF = (insightsCountryFilterEl?.value || "").trim();
  const srcF = (insightsSourceFilterEl?.value || "").trim();

  let rows = feeds.filter((f) => {
    if (countryF && (f.country || "") !== countryF) return false;
    if (srcF && (f.source_type || "") !== srcF) return false;
    const regionBuckets = getInsightsSelectedRegionBuckets();
    if (regionBuckets.length > 0) {
      const b = countryToManageRegionBucket(f.country);
      if (!regionBuckets.includes(b)) return false;
    }
    if (!q) return true;
    const site = sourceSiteFromFeedUrl(f.url);
    const regionLabel = manageRegionGroupLabel(countryToManageRegionBucket(f.country));
    const hay = `${f.name || ""} ${f.country || ""} ${f.domain || ""} ${f.source_type || ""} ${f.url || ""} ${site} ${regionLabel}`
      .toLowerCase();
    return hay.includes(q);
  });

  const totalFeeds = rows.length;
  const countriesCovered = new Set(rows.map((f) => f.country).filter(Boolean)).size;
  const regulators = new Set(rows.map((f) => (f.name || "").trim()).filter(Boolean)).size;
  if (insightTotalFeedsEl) insightTotalFeedsEl.textContent = String(totalFeeds);
  if (insightCountriesEl) insightCountriesEl.textContent = String(countriesCovered);
  if (insightRegulatorsEl) insightRegulatorsEl.textContent = String(regulators);

  if (rows.length === 0) {
    insightsTableBodyEl.innerHTML = "";
    insightsEmptyEl?.classList.remove("hidden");
    return;
  }
  insightsEmptyEl?.classList.add("hidden");
  const sortKey = (insightsSortEl?.value || "country_asc").trim();
  rows.sort((a, b) => compareInsightsFeedRows(a, b, sortKey, countryLabels));

  insightsTableBodyEl.innerHTML = rows
    .map((f) => {
      const country = f.country ? countryLabels[f.country] || f.country : "—";
      const source = sourceTypeLabels[f.source_type] || f.source_type || "—";
      const health = f.health_status || "ok";
      const domain = f.domain || "—";
      const url = f.url || "";
      const siteLabel = sourceSiteFromFeedUrl(url);
      return `<tr>
        <td>${escapeHtml(country)}</td>
        <td>${escapeHtml(f.name || "—")}</td>
        <td>${escapeHtml(source)}</td>
        <td>${escapeHtml(domain)}</td>
        <td>${escapeHtml(health)}</td>
        <td class="insights-source-site">${escapeHtml(siteLabel)}</td>
        <td>${url ? `<a class="insights-link" href="${escapeAttr(url)}" target="_blank" rel="noopener">Open</a>` : "—"}</td>
      </tr>`;
    })
    .join("");

  renderCountryDomainGaps(rows, countryLabels);
}

function renderCountryDomainGaps(feeds, countryLabels) {
  if (!insightsGapTableBodyEl) return;
  const allDomains = [...new Set(feeds.map((f) => (f.domain || "").trim()).filter(Boolean))].sort();
  const countryMap = new Map();
  for (const f of feeds) {
    const cc = (f.country || "").trim();
    if (!cc) continue;
    if (!countryMap.has(cc)) countryMap.set(cc, new Set());
    const d = (f.domain || "").trim();
    if (d) countryMap.get(cc).add(d);
  }
  const countries = [...countryMap.keys()].sort();
  if (countries.length === 0 || allDomains.length === 0) {
    insightsGapTableBodyEl.innerHTML = "";
    insightsGapEmptyEl?.classList.remove("hidden");
    return;
  }
  insightsGapEmptyEl?.classList.add("hidden");
  insightsGapTableBodyEl.innerHTML = countries
    .map((cc) => {
      const coveredSet = countryMap.get(cc) || new Set();
      const covered = allDomains.filter((d) => coveredSet.has(d));
      const missing = allDomains.filter((d) => !coveredSet.has(d));
      const pct = Math.round((covered.length / allDomains.length) * 100);
      const coveredHtml = covered.length
        ? covered
            .map((d) => `<span class="insights-domain-chip insights-domain-covered">${escapeHtml(d)}</span>`)
            .join("")
        : "—";
      const missingHtml = missing.length
        ? missing
            .map((d) => `<span class="insights-domain-chip insights-domain-missing">${escapeHtml(d)}</span>`)
            .join("")
        : "—";
      return `<tr>
        <td>${escapeHtml(countryLabels[cc] || cc)}</td>
        <td>${coveredHtml}</td>
        <td>${missingHtml}</td>
        <td>${covered.length}/${allDomains.length} (${pct}%)</td>
      </tr>`;
    })
    .join("");
}

function parseDisplayDateMs(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const norm = s.includes("T") ? s : s.replace(" ", "T");
  const t = Date.parse(norm);
  return Number.isFinite(t) ? t : null;
}

function formatDate(raw) {
  const t = parseDisplayDateMs(raw);
  if (t == null) return raw == null ? "" : String(raw);
  try {
    return new Date(t).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(raw);
  }
}

/** Same calendar day in local timezone (for comparing published vs updated). */
function calendarDayKey(raw) {
  const t = parseDisplayDateMs(raw);
  if (t == null) return null;
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function buildItemPublicationMetaHtml(item) {
  const labels = data.countryLabels || {};
  const cc = resolveItemCountryCode(item) || "";
  const countryText = cc ? labels[cc] || labels[cc.toUpperCase()] || cc : "—";
  const regionText = cc
    ? manageRegionGroupLabel(countryToManageRegionBucket(cc))
    : "—";
  let html = `<div class="item-meta">`;
  html += `<span class="item-geo-pill" title="Article / feed country"><span class="item-geo-label">Country</span><span class="item-geo-value">${escapeHtml(countryText)}</span></span>`;
  html += `<span class="item-geo-pill" title="Apple geography region for this country"><span class="item-geo-label">Region</span><span class="item-geo-value">${escapeHtml(regionText)}</span></span>`;
  const publishedRaw = item.iso_date || item.pub_date;
  if (publishedRaw) {
    html += `<span class="item-date item-date--published"><span class="item-date-label">Published:</span> ${escapeHtml(formatDate(publishedRaw))}</span>`;
  }
  const upd = item.updated_iso;
  if (upd) {
    const pubKey = calendarDayKey(item.iso_date || item.pub_date);
    const updKey = calendarDayKey(upd);
    if (updKey != null && pubKey != null && updKey !== pubKey) {
      html += `<span class="item-date item-date--updated"><span class="item-date-label">Last updated:</span> ${escapeHtml(formatDate(upd))}</span>`;
    } else if (updKey != null && pubKey == null) {
      html += `<span class="item-date item-date--updated"><span class="item-date-label">Last updated:</span> ${escapeHtml(formatDate(upd))}</span>`;
    }
  }
  html += `</div>`;
  return html;
}

function updateMultiselectLabels() {
  const countries = getSelectedCountries();
  const sources = getSelectedSources();
  const countryLabels = data.countryLabels || {};
  const sourceLabels = data.sourceTypeLabels || {};
  if (countryTriggerEl) {
    countryTriggerEl.textContent =
      countries.length === 0
        ? "All countries"
        : countries.length === 1
          ? countryLabels[countries[0]] || countries[0]
          : `${countries.length} countries`;
  }
  if (sourceTriggerEl) {
    sourceTriggerEl.textContent =
      sources.length === 0
        ? "All sources"
        : sources.length === 1
          ? sourceLabels[sources[0]] || sources[0]
          : `${sources.length} sources`;
  }
  const regions = getSelectedRegionGroups();
  if (regionTriggerEl) {
    regionTriggerEl.textContent =
      regions.length === 0
        ? "All regions"
        : regions.length === 1
          ? REGION_GROUP_LABELS[regions[0]] || regions[0]
          : `${regions.length} regions`;
  }
  const tagVals = getSelectedTags();
  if (tagTriggerEl) {
    if (tagVals.length === 0) tagTriggerEl.textContent = "All tags";
    else if (tagVals.length === 1) {
      const v = String(tagVals[0]).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const inp = tagOptionsEl?.querySelector(`input[value="${v}"]`);
      const span = inp?.closest("label")?.querySelector("span");
      tagTriggerEl.textContent = span?.textContent?.trim() || tagVals[0];
    } else tagTriggerEl.textContent = `${tagVals.length} tags`;
  }
}

function populateFilters() {
  const stLabels = data.sourceTypeLabels || {};
  const countryLabels = data.countryLabels || {};
  const fromInterest = Array.isArray(data.countriesOfInterest) ? data.countriesOfInterest : [];
  const fromItems = [...new Set((data.items || []).map((i) => resolveItemCountryCode(i)).filter(Boolean))];
  const countries = [...new Set([...fromInterest, ...fromItems])].sort((a, b) =>
    String(countryLabels[a] || a).localeCompare(String(countryLabels[b] || b)),
  );

  countryOptionsEl.innerHTML = "";
  for (const code of countries) {
    const label = document.createElement("label");
    label.className = "multiselect-option";
    label.innerHTML = `<input type="checkbox" value="${escapeAttr(code)}" /> <span>${escapeHtml(countryLabels[code] || code)}</span>`;
    label.querySelector("input").addEventListener("change", () => {
      countryAllEl.checked = false;
      const any = countryOptionsEl.querySelector("input:checked");
      if (!any) countryAllEl.checked = true;
      updateMultiselectLabels();
      onFilter();
    });
    countryOptionsEl.appendChild(label);
  }

  sourceOptionsEl.innerHTML = "";
  for (const [key, lblText] of Object.entries(stLabels)) {
    const lbl = document.createElement("label");
    lbl.className = "multiselect-option";
    lbl.innerHTML = `<input type="checkbox" value="${escapeAttr(key)}" /> <span>${escapeHtml(lblText)}</span>`;
    lbl.querySelector("input").addEventListener("change", () => {
      sourceAllEl.checked = false;
      const any = sourceOptionsEl.querySelector("input:checked");
      if (!any) sourceAllEl.checked = true;
      updateMultiselectLabels();
      onFilter();
    });
    sourceOptionsEl.appendChild(lbl);
  }

  if (!countryAllEl.dataset.ready) {
    countryAllEl.dataset.ready = "1";
    countryAllEl.addEventListener("change", () => {
      if (countryAllEl.checked) {
        countryOptionsEl.querySelectorAll("input").forEach((cb) => (cb.checked = false));
      }
      updateMultiselectLabels();
      onFilter();
    });
  }
  if (!sourceAllEl.dataset.ready) {
    sourceAllEl.dataset.ready = "1";
    sourceAllEl.addEventListener("change", () => {
      if (sourceAllEl.checked) {
        sourceOptionsEl.querySelectorAll("input").forEach((cb) => (cb.checked = false));
      }
      updateMultiselectLabels();
      onFilter();
    });
  }

  if (regionOptionsEl) {
    regionOptionsEl.innerHTML = "";
    for (const id of ["emeia", "gc", "rpac", "amr"]) {
      const lbl = document.createElement("label");
      lbl.className = "multiselect-option";
      lbl.innerHTML = `<input type="checkbox" value="${escapeAttr(id)}" /> <span>${escapeHtml(REGION_GROUP_LABELS[id] || id)}</span>`;
      lbl.querySelector("input").addEventListener("change", () => {
        updateMultiselectLabels();
        onFilter();
      });
      regionOptionsEl.appendChild(lbl);
    }
  }

  populateTagFilterOptions();
  setupCuratedGate();

  updateMultiselectLabels();
}

function populateTagFilterOptions() {
  if (!tagOptionsEl || !tagAllEl) return;
  tagOptionsEl.innerHTML = "";
  const surfaces = data.tagSurfaces || [];
  const levers = data.operationalLevers || [];
  const addGroupLabel = (text) => {
    const div = document.createElement("div");
    div.className = "multiselect-group-label";
    div.textContent = text;
    tagOptionsEl.appendChild(div);
  };
  const addRow = (type, id, lbl) => {
    const val = `${type}:${id}`;
    const row = document.createElement("label");
    row.className = "multiselect-option";
    row.innerHTML = `<input type="checkbox" value="${escapeAttr(val)}" /> <span>${escapeHtml(lbl || id)}</span>`;
    row.querySelector("input").addEventListener("change", () => {
      tagAllEl.checked = false;
      const any = tagOptionsEl.querySelector("input:checked");
      if (!any) tagAllEl.checked = true;
      updateMultiselectLabels();
      onFilter();
    });
    tagOptionsEl.appendChild(row);
  };
  if (surfaces.length) {
    addGroupLabel("Surface tags");
    for (const s of surfaces) addRow("surface", s.id, s.label);
  }
  if (levers.length) {
    addGroupLabel("Operational levers");
    for (const l of levers) addRow("lever", l.id, l.label);
  }
  if (!tagAllEl.dataset.ready) {
    tagAllEl.dataset.ready = "1";
    tagAllEl.addEventListener("change", () => {
      if (tagAllEl.checked) {
        tagOptionsEl.querySelectorAll("input").forEach((cb) => (cb.checked = false));
      }
      updateMultiselectLabels();
      onFilter();
    });
  }
}

async function load() {
  loadingEl.classList.remove("hidden");
  emptyEl.classList.add("hidden");
  contentEl.classList.add("hidden");

  try {
    const hours = hoursEl.value;
    const pq = itemsApiExtraQuery();
    const fetchUrl =
      hours === "custom" && dateFromEl?.value && dateToEl?.value
        ? `/api/items?from=${encodeURIComponent(dateFromEl.value)}&to=${encodeURIComponent(dateToEl.value)}${pq}`
        : `/api/items?hours=${hours}${pq}`;
    const [itemsRes, configRes, ingestHistRes, tagLists] = await Promise.all([
      fetch(fetchUrl),
      fetchConfig(),
      fetchIngestHistory(1),
      fetchTagTaxonomyLists(),
    ]);
    const itemsData = await itemsRes.json();
    const config = await configRes;
    const ingestHist = ingestHistRes;
    const surfacesFromApi = tagLists.surfaces?.length ? tagLists.surfaces : itemsData.tagSurfaces ?? [];
    const leversFromApi = tagLists.levers?.length ? tagLists.levers : itemsData.operationalLevers ?? [];
    data = {
      items: enrichItemsWithClientKeywords(itemsData.items ?? []),
      sourceTypeLabels: itemsData.sourceTypeLabels ?? config.sourceTypeLabels ?? {},
      countryLabels: itemsData.countryLabels ?? config.countryLabels ?? {},
      countriesOfInterest: itemsData.countriesOfInterest ?? config.countriesOfInterest ?? [],
      ecommerceKeywords: itemsData.ecommerceKeywords ?? [],
      relevanceKeywords: itemsData.relevanceKeywords,
      noiseKeywords: itemsData.noiseKeywords,
      ignoreKeywords: itemsData.ignoreKeywords ?? [],
      b2bWorkerContextKeywords: itemsData.b2bWorkerContextKeywords,
      consumerContextKeywords: itemsData.consumerContextKeywords,
      tagSurfaces: surfacesFromApi,
      operationalLevers: leversFromApi,
      hours: itemsData.hours ?? 24,
      timeLabel: itemsData.timeLabel,
    };
    populateFilters();
    generatedEl.textContent = data.timeLabel
      ? `Data: ${data.timeLabel}`
      : `Data: last ${data.hours}h`;
    updateIngestFooter(ingestHist.runs?.[0]);
    render(data.items ?? []);
  } catch (e) {
    emptyEl.textContent =
      "Failed to load. Start RSS Intake.app (or your API server), note its URL (e.g. http://127.0.0.1:50163), then open this page with ?api= that origin, or set localStorage rss-intake-api-base.";
    emptyEl.classList.remove("hidden");
  } finally {
    loadingEl.classList.add("hidden");
  }
}

function onFilter() {
  render(data.items);
}

function getCurrentFilteredItems() {
  const hidden = getHiddenItemIds();
  const notHidden = (data.items || []).filter((i) => !hidden.has(i.id));
  const filtered = filterItems(
    notHidden,
    searchEl.value.trim(),
    resolveCountryFilterCodes(),
    getSelectedSources(),
    getSelectedTags(),
    getPressSignalMin(),
    getSelectedCuratedToggleIds(),
    undefined,
  );
  return sortDigestItems(filtered, getPressSignalSortMode());
}

function inferAndMergeTagsForItem(item) {
  const autoTags = getAutoTagsForItem(item);
  return mergeTags(autoTags, item.user_tags, data.tagSurfaces, data.operationalLevers);
}

function csvEscape(value) {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportCurrentViewJson() {
  const filtered = getCurrentFilteredItems();
  const rows = filtered.map((item) => {
    const tags = inferAndMergeTagsForItem(item);
    return {
      id: item.id,
      title: item.title || "",
      link: item.link || "",
      feed_name: item.feed_name || "",
      source_type: item.source_type || "",
      country: resolveItemCountryCode(item) || "",
      iso_date: item.iso_date || "",
      pub_date: item.pub_date || "",
      updated_iso: item.updated_iso || "",
      created_at: item.created_at || "",
      matched_keywords: item.matched_keywords || [],
      story_surface_count: item.story_surface_count != null ? item.story_surface_count : 1,
      content_snippet: item.content_snippet || "",
      surfaces: tags.surfaces.map((t) => ({ id: t.id, label: t.label, isUser: !!t.isUser })),
      levers: tags.levers.map((t) => ({ id: t.id, label: t.label, isUser: !!t.isUser })),
      user_tags: item.user_tags || [],
    };
  });
  const payload = {
    exported_at: new Date().toISOString(),
    time_window: data.timeLabel || `last ${data.hours || 24}h`,
    item_count: rows.length,
    items: rows,
  };
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadFile(
    JSON.stringify(payload, null, 2),
    `rss-intake-export-${stamp}.json`,
    "application/json",
  );
}

function exportCurrentViewCsv() {
  const filtered = getCurrentFilteredItems();
  const headers = [
    "id",
    "title",
    "link",
    "feed_name",
    "source_type",
    "country",
    "iso_date",
    "pub_date",
    "updated_iso",
    "created_at",
    "matched_keywords",
    "story_surface_count",
    "surfaces",
    "levers",
    "user_tags",
    "content_snippet",
  ];
  const lines = [headers.map(csvEscape).join(",")];
  for (const item of filtered) {
    const tags = inferAndMergeTagsForItem(item);
    const surfaces = tags.surfaces.map((t) => t.label).join(" | ");
    const levers = tags.levers.map((t) => t.label).join(" | ");
    const userTags = (item.user_tags || []).map((t) => `${t.tag_type}:${t.tag_id}`).join(" | ");
    const kwCsv = (item.matched_keywords || [])
      .map((k) => `${k.keyword_type}:${k.keyword}`)
      .join(" | ");
    const row = [
      item.id,
      item.title || "",
      item.link || "",
      item.feed_name || "",
      item.source_type || "",
      resolveItemCountryCode(item) || "",
      item.iso_date || "",
      item.pub_date || "",
      item.updated_iso || "",
      item.created_at || "",
      kwCsv,
      item.story_surface_count != null ? item.story_surface_count : 1,
      surfaces,
      levers,
      userTags,
      item.content_snippet || "",
    ];
    lines.push(row.map(csvEscape).join(","));
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadFile(lines.join("\n"), `rss-intake-export-${stamp}.csv`, "text/csv;charset=utf-8");
}

hoursEl.addEventListener("change", () => {
  const isCustom = hoursEl.value === "custom";
  if (customRangeWrapEl) customRangeWrapEl.classList.toggle("hidden", !isCustom);
  if (isCustom && dateFromEl && dateToEl) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateToEl.value = today.toISOString().slice(0, 10);
    dateFromEl.value = weekAgo.toISOString().slice(0, 10);
    load();
  } else {
    load();
  }
});
dateFromEl?.addEventListener("change", () => {
  if (hoursEl?.value === "custom" && dateFromEl.value && dateToEl?.value) load();
});
dateToEl?.addEventListener("change", () => {
  if (hoursEl?.value === "custom" && dateFromEl?.value && dateToEl.value) load();
});
searchEl.addEventListener("input", onFilter);
pressSignalFilterEl?.addEventListener("change", onFilter);
pressSignalSortEl?.addEventListener("change", onFilter);
signalKeywordFilterEl?.addEventListener("change", onFilter);
document.getElementById("include-archived")?.addEventListener("change", () => load());

/** Basename or full path for short UI labels. */
function digestFileLabel(path) {
  if (!path) return "";
  const i = path.replace(/\\/g, "/").lastIndexOf("/");
  return i >= 0 ? path.slice(i + 1) : path;
}

function runDigestIngestAndExport(btn) {
  if (!btn) return;
  const defaultLabel = "Generate digest file";
  btn.disabled = true;
  btn.textContent = "Running…";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);
  fetch("/api/digest/ingest-and-export", { method: "POST", signal: controller.signal })
    .then(async (res) => {
      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (_) {
        console.error("ingest-and-export response not JSON:", text.slice(0, 200));
      }
      return { ok: res.ok, status: res.status, json, text };
    })
    .then(({ ok, status, json, text }) => {
      clearTimeout(timeoutId);
      if (ok && json && json.ok) {
        const results = json.results || [];
        const total = results.reduce((n, r) => n + (r.newCount ?? 0), 0);
        const dupes = results.reduce((n, r) => n + (r.duplicateDedupCount ?? 0), 0);
        const parts = [];
        if (total) parts.push(`${total} new`);
        if (dupes) parts.push(`${dupes} dedup`);
        const file = digestFileLabel(json.digest_file);
        if (json.digest_export_error) {
          parts.push("file error");
        } else if (file) {
          parts.push(file);
        }
        btn.textContent = parts.length ? parts.join(" · ") : "Done";
        setTimeout(() => {
          btn.textContent = defaultLabel;
        }, 3500);
        load();
      } else if (json && json.error) {
        const msg = json.error;
        btn.textContent = msg.length > 20 ? msg.slice(0, 17) + "…" : msg;
        console.error("ingest-and-export failed:", status, json);
        setTimeout(() => {
          btn.textContent = defaultLabel;
        }, 5000);
      } else if (status === 404 || status === 0) {
        btn.textContent = "Restart: npm run serve";
        setTimeout(() => {
          btn.textContent = defaultLabel;
        }, 6000);
      } else {
        btn.textContent = "Server error";
        console.error("ingest-and-export failed:", status, text ? text.slice(0, 300) : "(empty)");
        setTimeout(() => {
          btn.textContent = defaultLabel;
        }, 5000);
      }
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      const msg = err.name === "AbortError" ? "Timed out" : err.message || "Network error";
      btn.textContent = msg.length > 20 ? msg.slice(0, 17) + "…" : msg;
      console.error("ingest-and-export error:", err);
      setTimeout(() => {
        btn.textContent = defaultLabel;
      }, 5000);
    })
    .finally(() => {
      btn.disabled = false;
    });
}

function runDigest(btn, defaultLabel) {
  if (!btn) return;
  const defaultLabelFinal = defaultLabel;
  btn.disabled = true;
  btn.textContent = "Running…";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min
  fetch("/api/ingest", { method: "POST", signal: controller.signal })
    .then(async (res) => {
      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (_) {
        console.error("Ingest response not JSON:", text.slice(0, 200));
      }
      return { ok: res.ok, status: res.status, json, text };
    })
    .then(({ ok, status, json, text }) => {
      clearTimeout(timeoutId);
      if (ok && json && json.ok) {
        const results = json.results || [];
        const total = results.reduce((n, r) => n + (r.newCount ?? 0), 0);
        const dupes = results.reduce((n, r) => n + (r.duplicateDedupCount ?? 0), 0);
        const parts = [];
        if (total) parts.push(`${total} new`);
        if (dupes) parts.push(`${dupes} dedup`);
        btn.textContent = parts.length ? parts.join(", ") : "Done";
        setTimeout(() => {
          btn.textContent = defaultLabelFinal;
        }, 2500);
        load();
      } else if (json && json.error) {
        const msg = json.error;
        btn.textContent = msg.length > 20 ? msg.slice(0, 17) + "…" : msg;
        console.error("Ingest failed:", status, json);
        setTimeout(() => {
          btn.textContent = defaultLabelFinal;
        }, 5000);
      } else if (status === 404 || status === 0) {
        btn.textContent = "Restart: npm run serve";
        console.error("Ingest: 404. Stop other apps on port 3000, then run: npm run serve");
        setTimeout(() => {
          btn.textContent = defaultLabelFinal;
        }, 6000);
      } else {
        btn.textContent = "Server error";
        console.error("Ingest failed:", status, text ? text.slice(0, 300) : "(empty)");
        setTimeout(() => {
          btn.textContent = defaultLabelFinal;
        }, 5000);
      }
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      const msg = err.name === "AbortError" ? "Timed out" : err.message || "Network error";
      btn.textContent = msg.length > 20 ? msg.slice(0, 17) + "…" : msg;
      console.error("Ingest error:", err);
      setTimeout(() => {
        btn.textContent = defaultLabelFinal;
      }, 5000);
    })
    .finally(() => {
      btn.disabled = false;
    });
}

document.getElementById("digest-run-btn")?.addEventListener("click", () => {
  runDigest(document.getElementById("digest-run-btn"), "Run digest");
});
document.getElementById("insights-generate-digest-btn")?.addEventListener("click", () => {
  runDigestIngestAndExport(document.getElementById("insights-generate-digest-btn"));
});
document
  .getElementById("export-json-btn")
  ?.addEventListener("click", () => exportCurrentViewJson());
document.getElementById("export-csv-btn")?.addEventListener("click", () => exportCurrentViewCsv());

document.getElementById("toggle-hidden-btn")?.addEventListener("click", () => {
  const panel = document.getElementById("hidden-panel");
  if (panel) panel.classList.toggle("hidden");
});
document.getElementById("restore-all-hidden")?.addEventListener("click", () => {
  clearHiddenItemIds();
  render(data.items);
});
document.getElementById("collapse-hidden")?.addEventListener("click", () => {
  document.getElementById("hidden-panel")?.classList.add("hidden");
});
document.addEventListener("click", (e) => {
  const unhideBtn = e.target.closest(".btn-unhide");
  if (unhideBtn) {
    e.preventDefault();
    const itemId = parseInt(unhideBtn.dataset.itemId ?? "0", 10);
    if (itemId) {
      removeHiddenItemId(itemId);
      render(data.items);
    }
  }
});

// Multiselect dropdown toggle
function setupMultiselect(trigger, panel) {
  if (!trigger || !panel) return;
  let closeHandler = null;
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = panel.classList.toggle("open");
    trigger.setAttribute("aria-expanded", open);
    if (open) {
      closeHandler = (ev) => {
        if (panel.contains(ev.target) || trigger.contains(ev.target)) return;
        panel.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        document.removeEventListener("click", closeHandler);
      };
      setTimeout(() => document.addEventListener("click", closeHandler), 0);
    } else if (closeHandler) {
      document.removeEventListener("click", closeHandler);
    }
  });
}

setupMultiselect(countryTriggerEl, countryPanelEl);
setupMultiselect(regionTriggerEl, regionPanelEl);
setupMultiselect(tagTriggerEl, tagPanelEl);
setupMultiselect(sourceTriggerEl, sourcePanelEl);
setupMultiselect(curatedTriggerEl, curatedPanelEl);
curatedEnabledEl?.addEventListener("change", () => {
  if (!curatedEnabledEl.checked) {
    selectedCuratedToggleIds.clear();
    setAllCuratedGroupChecks(false);
    resetTagFiltersToAll();
  } else {
    selectedCuratedToggleIds.clear();
    for (const t of CURATED_TOGGLES) selectedCuratedToggleIds.add(t.id);
    setAllCuratedGroupChecks(true);
  }
  updateCuratedSummary();
  load();
});

// Tab switching
document.querySelectorAll(".nav-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const t = tab.dataset.tab;
    document.querySelectorAll(".nav-tab").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".view").forEach((x) => x.classList.remove("active"));
    tab.classList.add("active");
    const view = document.getElementById("view-" + t);
    if (view) view.classList.add("active");
    if (headerControlsEl) headerControlsEl.style.display = t === "digest" ? "" : "none";
    if (t === "feeds") loadFeeds();
    if (t === "tags") loadTags();
    if (t === "insights") loadInsights();
    if (t === "trends") loadTrends();
  });
});

[insightsSearchEl, insightsCountryFilterEl, insightsSourceFilterEl, insightsSortEl].forEach(
  (el) => {
    el?.addEventListener("input", () => renderInsights(insightsData, data.countryLabels || {}, data.sourceTypeLabels || {}));
    el?.addEventListener("change", () => renderInsights(insightsData, data.countryLabels || {}, data.sourceTypeLabels || {}));
  },
);
insightsRegionStripEl?.addEventListener("change", () =>
  renderInsights(insightsData, data.countryLabels || {}, data.sourceTypeLabels || {}),
);

function buildTrendsQuery() {
  const asIntInRange = (raw, fallback, min, max) => {
    const n = parseInt(String(raw ?? ""), 10);
    if (!Number.isFinite(n)) return String(fallback);
    return String(Math.min(max, Math.max(min, n)));
  };
  const h = asIntInRange(trendsHoursEl?.value, 168, 24, 720);
  const kwLimit = asIntInRange(trendsKeywordLimitEl?.value, 12, 3, 40);
  const minC = asIntInRange(trendsMinClusterEl?.value, 2, 2, 20);
  const tok = asIntInRange(trendsClusterTokensEl?.value, 6, 3, 12);
  const topicMode = String(trendsTopicModeEl?.value || "type").toLowerCase() === "phrase" ? "phrase" : "type";
  const riskLens = String(trendsRiskLensEl?.value || "all").toLowerCase() === "enforcement_heavy"
    ? "enforcement_heavy"
    : "all";
  const q = new URLSearchParams();
  q.set("hours", h);
  q.set("topic_mode", topicMode);
  q.set("keyword_limit", kwLimit);
  q.set("risk_lens", riskLens);
  q.set("min_cluster", minC);
  q.set("cluster_tokens", tok);
  const compareMode = String(trendsCompareModeEl?.value || "auto").toLowerCase() === "custom" ? "custom" : "auto";
  q.set("compare_mode", compareMode);
  if (compareMode === "custom") {
    const prevFrom = String(trendsPrevFromEl?.value || "").trim();
    const prevTo = String(trendsPrevToEl?.value || "").trim();
    if (prevFrom && prevTo) {
      q.set("prev_from", prevFrom);
      q.set("prev_to", prevTo);
    }
  }
  if (trendsIncludeAllEl?.checked) q.set("include_all", "true");
  if (trendsIncludeArchivedEl?.checked) q.set("include_archived", "true");
  return q.toString();
}

function updateTrendsCompareControls() {
  const custom = String(trendsCompareModeEl?.value || "auto").toLowerCase() === "custom";
  trendsPrevRangeWrapEl?.classList.toggle("hidden", !custom);
  if (trendsCompareActiveEl && custom) {
    const pf = String(trendsPrevFromEl?.value || "").trim();
    const pt = String(trendsPrevToEl?.value || "").trim();
    trendsCompareActiveEl.textContent =
      pf && pt
        ? `Using compare window: ${pf} to ${pt}`
        : "Using compare window: custom dates not set (falls back to previous matching window)";
  } else if (trendsCompareActiveEl) {
    trendsCompareActiveEl.textContent = "Using compare window: previous matching window";
  }
}

function renderTrendsBars(rows, maxN) {
  const slice = (rows || []).slice(0, maxN);
  if (slice.length === 0) return '<p class="trends-empty">No data</p>';
  const max = Math.max(1, ...slice.map((r) => r.count));
  return slice
    .map((r) => {
      const pct = Math.round((r.count / max) * 100);
      const lab = escapeHtml(r.label || r.key);
      const fullLabel = escapeAttr(r.label || r.key);
      return `<div class="trends-bar-row">
        <span class="trends-bar-label" title="${fullLabel}">${lab}</span>
        <div class="trends-bar-track" role="presentation"><div class="trends-bar-fill" style="width:${pct}%"></div></div>
        <span class="trends-bar-count">${r.count}</span>
      </div>`;
    })
    .join("");
}

function renderTrendsCard(title, rows, maxBars) {
  return `<div class="trends-card"><h4>${escapeHtml(title)}</h4>${renderTrendsBars(rows, maxBars)}</div>`;
}

function renderDeltaBadge(delta, pct) {
  const n = Number(delta || 0);
  const sign = n > 0 ? "+" : "";
  const cls = n > 0 ? "up" : n < 0 ? "down" : "flat";
  const pctLabel = pct == null ? "" : ` (${sign}${pct}%)`;
  return `<span class="trends-delta trends-delta-${cls}">${sign}${n}${pctLabel}</span>`;
}

function renderTrendsDeltaRows(rows, maxN) {
  const slice = (rows || []).slice(0, maxN);
  if (slice.length === 0) return '<p class="trends-empty">No trend change data</p>';
  return slice
    .map((r) => {
      const label = escapeHtml(r.label || r.key);
      return `<div class="trends-delta-row">
        <span class="trends-delta-label">${label}</span>
        <span class="trends-delta-count">${r.count}</span>
        ${renderDeltaBadge(r.delta, r.delta_pct)}
      </div>`;
    })
    .join("");
}

function renderTrendsDeltaCard(title, rows, maxRows) {
  return `<div class="trends-card trends-card-priority"><h4>${escapeHtml(title)}</h4>${renderTrendsDeltaRows(rows, maxRows)}</div>`;
}

function renderTrendSeriesCard(title, series, maxSeries) {
  const slice = (series || []).slice(0, maxSeries);
  if (slice.length === 0) return `<div class="trends-card"><h4>${escapeHtml(title)}</h4><p class="trends-empty">No keyword time series</p></div>`;
  const rows = slice
    .map((s) => {
      const pts = Array.isArray(s.points) ? s.points : [];
      const total = pts.reduce((n, p) => n + Number(p.count || 0), 0);
      const sparkVals = pts.slice(-14);
      const max = Math.max(1, ...sparkVals.map((p) => Number(p.count || 0)));
      const spark = sparkVals
        .map((p) => {
          const h = Math.max(8, Math.round((Number(p.count || 0) / max) * 100));
          return `<span class="trends-spark-bar" style="height:${h}%"></span>`;
        })
        .join("");
      return `<div class="trends-series-row">
        <div class="trends-series-head"><span class="trends-series-label">${escapeHtml(s.label || s.key)}</span><span class="trends-series-total">${total}</span></div>
        <div class="trends-sparkline" aria-hidden="true">${spark}</div>
      </div>`;
    })
    .join("");
  return `<div class="trends-card"><h4>${escapeHtml(title)}</h4>${rows}</div>`;
}

function renderTrendsView(payload) {
  const grid = document.getElementById("trends-grid");
  const keywordGrid = document.getElementById("trends-keyword-grid");
  const summary = document.getElementById("trends-summary");
  const clustersEl = document.getElementById("trends-clusters");
  const clustersEmpty = document.getElementById("trends-clusters-empty");
  if (!grid || !keywordGrid || !summary || !clustersEl) return;
  const cp = payload.cluster_params || {};
  const topicLabel = payload.topic_mode === "phrase" ? "phrase-level" : "keyword-type";
  summary.innerHTML = `<p class="feeds-hint">Primary signal: <strong>${topicLabel}</strong> momentum and compliance risk movement in this window. Overlapping stories are shown below for context validation only.</p>`;

  keywordGrid.innerHTML =
    renderTrendsDeltaCard("Topic momentum vs prior window", payload.keyword_delta_vs_prior_window, 10) +
    renderTrendsCard("Top regulatory signals", payload.by_keyword_type, 10) +
    renderTrendsCard("Country risk watch", payload.risk_index_by_country, 10) +
    renderTrendsCard("Topic risk watch", payload.risk_index_by_topic, 10) +
    renderTrendSeriesCard("Keyword activity over time", payload.keywords_over_time, 6) +
    renderTrendsCard(
      payload.topic_mode === "phrase" ? "Top phrases in window" : "Top keyword types in window",
      payload.top_keywords,
      12,
    );

  grid.innerHTML =
    renderTrendsCard("Items per day", payload.by_day, 21) +
    renderTrendsCard("By country", payload.by_country, 22) +
    renderTrendsCard("By source type", payload.by_source_type, 12) +
    renderTrendsCard("Top feeds", payload.by_feed, 18) +
    renderTrendsCard("Journey surfaces", payload.by_surface, 18) +
    renderTrendsCard("Operational levers", payload.by_lever, 18);

  const clusters = payload.clusters || [];
  if (clusters.length === 0) {
    clustersEl.innerHTML = "";
    clustersEmpty?.classList.remove("hidden");
  } else {
    clustersEmpty?.classList.add("hidden");
    clustersEl.innerHTML = clusters
      .map((c) => {
        const head = `${escapeHtml(c.country_label || c.country || "—")} · ${escapeHtml(c.primary_surface_label || "No surface")} · <strong>${c.count}</strong> items`;
        const st = c.sample_title || "";
        const sampleShort = st.length > 100 ? `${escapeHtml(st.slice(0, 100))}…` : escapeHtml(st);
        const rows = c.members
          .map((m) => {
            const tit = m.title || "";
            const titDisp = tit.length > 140 ? `${escapeHtml(tit.slice(0, 140))}…` : escapeHtml(tit);
            return `<tr><td>${escapeHtml(m.feed_name || "—")}</td><td>${titDisp}</td><td>${m.iso_date ? escapeHtml(String(m.iso_date).slice(0, 10)) : "—"}</td><td>${m.link ? `<a class="insights-link" href="${escapeAttr(m.link)}" target="_blank" rel="noopener">Open</a>` : "—"}</td></tr>`;
          })
          .join("");
        return `<details class="trends-cluster"><summary class="trends-cluster-summary">${head}<span class="trends-cluster-sample"> — ${sampleShort || "—"}</span></summary><table class="trends-cluster-table"><thead><tr><th>Feed</th><th>Title</th><th>Date</th><th>Link</th></tr></thead><tbody>${rows}</tbody></table></details>`;
      })
      .join("");
  }
}

async function loadTrends() {
  if (!trendsLoadingEl || !trendsContentEl) return;
  trendsLoadingEl.textContent = "Loading analytics…";
  trendsLoadingEl.classList.remove("hidden");
  trendsContentEl.classList.add("hidden");
  try {
    const res = await fetch(`/api/analytics?${buildTrendsQuery()}`);
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      const hint =
        typeof text === "string" && text.trimStart().toLowerCase().startsWith("<!doctype")
          ? " (server returned HTML—use the same host as this page, e.g. npm run serve from the rss-intake project)"
          : "";
      throw new Error((json?.error || text || res.statusText) + hint);
    }
    if (trendsWindowLabelEl) {
      const compareLabel = json.prior_window?.label ? ` · Compare: ${json.prior_window.label}` : "";
      trendsWindowLabelEl.textContent = `Window: ${json.window?.label || "—"}${compareLabel} · ${json.totals?.items ?? 0} items`;
    }
    if (trendsCompareActiveEl) {
      trendsCompareActiveEl.textContent = json.prior_window?.label
        ? `Using compare window: ${json.prior_window.label}`
        : trendsCompareActiveEl.textContent;
    }
    renderTrendsView(json);
    trendsLoadingEl.classList.add("hidden");
    trendsContentEl.classList.remove("hidden");
  } catch (e) {
    trendsLoadingEl.textContent =
      e instanceof Error ? `Failed to load: ${e.message}` : "Failed to load analytics.";
    console.error(e);
  }
}

[trendsHoursEl, trendsCompareModeEl, trendsPrevFromEl, trendsPrevToEl, trendsTopicModeEl, trendsKeywordLimitEl, trendsRiskLensEl, trendsMinClusterEl, trendsClusterTokensEl, trendsIncludeAllEl, trendsIncludeArchivedEl].forEach(
  (el) => {
    el?.addEventListener("change", () => {
      updateTrendsCompareControls();
      loadTrends();
    });
  },
);
trendsRefreshBtnEl?.addEventListener("click", () => loadTrends());
updateTrendsCompareControls();

// Tags management
async function loadIgnoreKeywords() {
  if (!tagsIgnoreListEl) return;
  try {
    const res = await fetch("/api/ignore-keywords");
    const json = await res.json();
    const keywords = json.keywords || [];
    tagsIgnoreListEl.innerHTML =
      keywords.length === 0
        ? '<div class="tags-empty">No ignore keywords. Add one above.</div>'
        : keywords
            .map(
              (kw) => `
        <div class="tag-row tag-row-ignore" data-keyword="${escapeAttr(kw)}">
          <span class="tag-chip tag-chip-removable">${escapeHtml(kw)}<button type="button" class="tag-chip-remove ignore-remove" aria-label="Remove">×</button></span>
        </div>`,
            )
            .join("");
    tagsIgnoreListEl.querySelectorAll(".ignore-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".tag-row-ignore");
        const kw = row?.dataset?.keyword;
        if (kw) removeIgnoreKeyword(kw);
      });
    });
  } catch (e) {
    tagsIgnoreListEl.innerHTML = '<div class="tags-loading">Failed to load.</div>';
  }
}

async function addIgnoreKeywordSubmit(keyword) {
  const k = (keyword || "").trim().toLowerCase();
  if (!k) return;
  try {
    const res = await fetch("/api/ignore-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: k }),
    });
    if (res.ok) {
      loadIgnoreKeywords();
      load();
    } else {
      const json = await res.json();
      alert(json.error || "Failed to add");
    }
  } catch (e) {
    alert("Failed to add keyword");
  }
}

async function removeIgnoreKeyword(kw) {
  try {
    const res = await fetch(`/api/ignore-keywords/${encodeURIComponent(kw)}`, { method: "DELETE" });
    if (res.ok || res.status === 404) {
      loadIgnoreKeywords();
      load();
    }
  } catch (e) {
    alert("Failed to remove keyword");
  }
}

async function loadTags() {
  if (!tagsSurfacesListEl || !tagsLeversListEl) return;
  loadIgnoreKeywords();
  tagsSurfacesListEl.innerHTML = '<div class="tags-loading">Loading…</div>';
  tagsLeversListEl.innerHTML = '<div class="tags-loading">Loading…</div>';
  try {
    const res = await fetch("/api/tags");
    const json = await res.json();
    const surfaces = json.surfaces || [];
    const levers = json.levers || [];

    const renderTagCard = (t, tagType) => {
      const kws = t.keywords || [];
      const chips = kws
        .map(
          (kw) =>
            `<span class="tag-chip tag-chip-removable" data-keyword="${escapeAttr(kw)}">${escapeHtml(kw)}<button type="button" class="tag-chip-remove" aria-label="Remove">×</button></span>`,
        )
        .join("");
      return `
        <div class="tag-row tag-card" data-tag-type="${tagType}" data-tag-id="${escapeAttr(t.id)}">
          <div class="tag-row-main" role="button" tabindex="0" aria-expanded="false" aria-label="Edit keywords">
            <div class="tag-row-info">
              <span class="tag-row-label">${escapeHtml(t.label)}</span>
              <span class="tag-row-id">${escapeHtml(t.id)}</span>
            </div>
            <div class="tag-row-actions">
              <button type="button" class="btn-add-keywords" data-tag-type="${tagType}" data-tag-id="${escapeAttr(t.id)}" title="Add keywords">+ Keywords</button>
              ${t.is_builtin ? "" : `<button type="button" class="btn-delete tag-delete" data-tag-type="${tagType}" data-tag-id="${escapeAttr(t.id)}" title="Remove tag">Delete</button>`}
            </div>
          </div>
          <div class="tag-keywords-area">
            <div class="tag-keywords-chips">${chips || '<span class="tag-keywords-empty">No keywords</span>'}</div>
            <div class="tag-keywords-add hidden" data-tag-type="${tagType}" data-tag-id="${escapeAttr(t.id)}">
              <input type="text" class="tag-keywords-input" placeholder="keyword1, keyword2, ..." />
              <button type="button" class="btn-add-keywords-submit">Add</button>
            </div>
          </div>
        </div>`;
    };

    tagsSurfacesListEl.innerHTML =
      surfaces.length === 0
        ? '<div class="tags-empty">No surfaces defined. Add one above.</div>'
        : surfaces.map((s) => renderTagCard(s, "surface")).join("");

    tagsLeversListEl.innerHTML =
      levers.length === 0
        ? '<div class="tags-empty">No levers defined. Add one above.</div>'
        : levers.map((l) => renderTagCard(l, "lever")).join("");

    tagsSurfacesListEl.querySelectorAll(".tag-delete").forEach((btn) => {
      btn.addEventListener("click", () => deleteTag(btn.dataset.tagType, btn.dataset.tagId));
    });
    tagsLeversListEl.querySelectorAll(".tag-delete").forEach((btn) => {
      btn.addEventListener("click", () => deleteTag(btn.dataset.tagType, btn.dataset.tagId));
    });

    document.querySelectorAll(".tag-row-main").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest(".btn-add-keywords, .btn-delete")) return;
        const row = el.closest(".tag-row");
        const addEl = row?.querySelector(".tag-keywords-add");
        const isOpen = !addEl?.classList.contains("hidden");
        document.querySelectorAll(".tag-keywords-add").forEach((x) => x.classList.add("hidden"));
        document
          .querySelectorAll(".tag-row-main")
          .forEach((x) => x.setAttribute("aria-expanded", "false"));
        if (!isOpen) {
          addEl?.classList.remove("hidden");
          el.setAttribute("aria-expanded", "true");
          addEl?.querySelector(".tag-keywords-input")?.focus();
        }
      });
    });

    document.querySelectorAll(".btn-add-keywords").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".tag-keywords-add").forEach((el) => el.classList.add("hidden"));
        document
          .querySelectorAll(".tag-row-main")
          .forEach((x) => x.setAttribute("aria-expanded", "false"));
        const row = btn.closest(".tag-row");
        const addEl = row?.querySelector(".tag-keywords-add");
        addEl?.classList.remove("hidden");
        row?.querySelector(".tag-row-main")?.setAttribute("aria-expanded", "true");
        const input = addEl?.querySelector(".tag-keywords-input");
        if (input) {
          input.value = "";
          input.focus();
        }
      });
    });

    document.querySelectorAll(".tag-chip-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const chip = btn.closest(".tag-chip");
        const row = chip?.closest(".tag-row");
        const tagType = row?.dataset?.tagType;
        const tagId = row?.dataset?.tagId;
        const keyword = chip?.dataset?.keyword;
        if (!tagType || !tagId || !keyword) return;
        const chips = row?.querySelectorAll(".tag-chip");
        const remaining = Array.from(chips || [])
          .map((c) => c.dataset?.keyword)
          .filter((k) => k && k !== keyword);
        saveKeywordsToTag(tagType, tagId, remaining);
      });
    });

    document.querySelectorAll(".btn-add-keywords-submit").forEach((btn) => {
      btn.addEventListener("click", () => {
        const addEl = btn.closest(".tag-keywords-add");
        const input = addEl?.querySelector(".tag-keywords-input");
        const row = addEl?.closest(".tag-row");
        const tagType = addEl?.dataset?.tagType;
        const tagId = addEl?.dataset?.tagId;
        const val = (input?.value || "").trim();
        if (!tagType || !tagId || !val) return;
        const newKeywords = val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (newKeywords.length === 0) return;
        const existing = Array.from(row?.querySelectorAll(".tag-chip") || [])
          .map((c) => c.dataset?.keyword)
          .filter(Boolean);
        const combined = [...existing, ...newKeywords];
        saveKeywordsToTag(tagType, tagId, combined);
        if (input) input.value = "";
      });
    });
  } catch (e) {
    tagsSurfacesListEl.innerHTML =
      '<div class="tags-loading">Failed to load. Is the server running?</div>';
    tagsLeversListEl.innerHTML = '<div class="tags-loading">Failed to load.</div>';
  }
}

async function addTagSubmit(tagType, tagId, label, keywords) {
  try {
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_type: tagType, tag_id: tagId, label, keywords }),
    });
    const json = await res.json();
    if (res.ok) {
      loadTags();
      load(); // refresh digest so new tag appears in add-tag dropdown
    } else {
      alert(json.error || "Failed to add tag");
    }
  } catch (e) {
    alert("Failed to add tag");
  }
}

async function saveKeywordsToTag(tagType, tagId, keywords) {
  try {
    const res = await fetch(`/api/tags/${tagType}/${encodeURIComponent(tagId)}/keywords`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: keywords || [] }),
    });
    if (res.ok) {
      loadTags();
      load();
    } else {
      const json = await res.json();
      alert(json.error || "Failed to save keywords");
    }
  } catch (e) {
    alert("Failed to save keywords");
  }
}

async function addKeywordsToTag(tagType, tagId, keywords) {
  try {
    const res = await fetch(`/api/tags/${tagType}/${encodeURIComponent(tagId)}/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords }),
    });
    if (res.ok) {
      loadTags();
      load();
    } else {
      let msg = "Failed to add keywords";
      try {
        const json = await res.json();
        msg = json.error || msg;
      } catch (_) {
        if (res.status === 404) msg = "Server may need a restart. Try running: npm run serve";
      }
      alert(msg);
    }
  } catch (e) {
    alert("Failed to add keywords. Is the server running?");
  }
}

async function removeKeywordFromTag(tagType, tagId, keyword) {
  try {
    const res = await fetch(
      `/api/tags/${tagType}/${encodeURIComponent(tagId)}/keywords/${encodeURIComponent(keyword)}`,
      { method: "DELETE" },
    );
    if (res.ok || res.status === 404) {
      loadTags();
      load();
    }
  } catch (e) {
    alert("Failed to remove keyword");
  }
}

async function deleteTag(tagType, tagId) {
  if (!confirm(`Remove tag "${tagId}"?`)) return;
  try {
    const res = await fetch(`/api/tags/${tagType}/${encodeURIComponent(tagId)}`, {
      method: "DELETE",
    });
    if (res.ok || res.status === 404) {
      loadTags();
      load();
    }
  } catch (e) {
    alert("Failed to delete tag");
  }
}

tagFormEl?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tagType = document.getElementById("tag-type")?.value;
  const tagId = (document.getElementById("tag-id")?.value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const tagLabel = (document.getElementById("tag-label")?.value || "").trim();
  const tagKeywordsRaw = (document.getElementById("tag-keywords")?.value || "").trim();
  const keywords = tagKeywordsRaw
    ? tagKeywordsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  if (!tagType || !tagId || !tagLabel) return;
  await addTagSubmit(tagType, tagId, tagLabel, keywords);
  tagFormEl.reset();
});

leverFormEl?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const leverId = (document.getElementById("lever-id")?.value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const leverLabel = (document.getElementById("lever-label")?.value || "").trim();
  const leverKeywordsRaw = (document.getElementById("lever-keywords")?.value || "").trim();
  const keywords = leverKeywordsRaw
    ? leverKeywordsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  if (!leverId || !leverLabel) return;
  await addTagSubmit("lever", leverId, leverLabel, keywords);
  leverFormEl.reset();
});

// Feeds management
function feedHealthDotClass(status) {
  const s = String(status || "ok")
    .trim()
    .toLowerCase();
  if (s === "dead") return "feed-health-dot feed-health-dot-dead";
  if (s === "stale") return "feed-health-dot feed-health-dot-stale";
  return "feed-health-dot feed-health-dot-ok";
}

function feedHealthTitle(status) {
  const s = String(status || "ok")
    .trim()
    .toLowerCase();
  return `Feed health: ${s}`;
}

function feedHealthRank(s) {
  const x = String(s || "ok")
    .trim()
    .toLowerCase();
  if (x === "dead") return 0;
  if (x === "stale") return 1;
  return 2;
}

function compareManageFeeds(a, b, sortKey, countryLabels) {
  switch (sortKey) {
    case "name_desc":
      return (b.name || "").localeCompare(a.name || "", undefined, { sensitivity: "base" });
    case "country_asc": {
      const ca = (a.country || "").toUpperCase();
      const cb = (b.country || "").toUpperCase();
      const c = ca.localeCompare(cb);
      if (c !== 0) return c;
      return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
    }
    case "source_asc": {
      const sa = a.source_type || "";
      const sb = b.source_type || "";
      const c = sa.localeCompare(sb);
      if (c !== 0) return c;
      return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
    }
    case "health_desc": {
      const d = feedHealthRank(a.health_status) - feedHealthRank(b.health_status);
      if (d !== 0) return d;
      return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
    }
    case "name_asc":
    default:
      return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
  }
}

function buildFeedRowHtml(f, countryLabels) {
  const ht = feedHealthTitle(f.health_status);
  const hc = feedHealthDotClass(f.health_status);
  return `
      <div class="feed-row" data-feed-id="${escapeAttr(f.id)}">
        <span class="${hc}" title="${escapeAttr(ht)}" aria-label="${escapeAttr(ht)}"></span>
        <div class="feed-row-info">
          <div class="feed-row-name">${escapeHtml(f.name)}</div>
          <a href="${escapeAttr(f.url)}" target="_blank" rel="noopener" class="feed-row-url">${escapeHtml(f.url)}</a>
          <div class="feed-row-meta">${escapeHtml(f.source_type)}${f.country ? " · " + (countryLabels[f.country] || f.country) : ""}${f.is_builtin ? " · built-in" : " · custom"}</div>
        </div>
        <div class="feed-row-operator">
          <button type="button" class="btn-delete" data-id="${escapeAttr(f.id)}" title="Remove feed">Delete</button>
        </div>
      </div>
    `;
}

function feedMatchesManageFilters(f, countryLabels) {
  const q = (feedsFilterSearchEl?.value || "").trim().toLowerCase();
  if (q) {
    const hay = [f.name, f.url, f.country, countryLabels[f.country], f.source_type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  const reg = (feedsFilterRegionEl?.value || "all").trim().toLowerCase();
  if (reg && reg !== "all") {
    if (countryToManageRegionBucket(f.country) !== reg) return false;
  }
  const src = (feedsFilterSourceEl?.value || "all").trim().toLowerCase();
  if (src && src !== "all") {
    if (String(f.source_type || "").toLowerCase() !== src) return false;
  }
  return true;
}

function populateFeedsSourceTypeFilter() {
  const sel = feedsFilterSourceEl;
  if (!sel) return;
  const st = manageFeedsCache?.sourceTypeLabels || {};
  const keys = Object.keys(st);
  if (keys.length === 0) return;
  const current = sel.value;
  sel.innerHTML = '<option value="all">All source types</option>';
  for (const k of keys.sort((a, b) =>
    String(st[a] || a).localeCompare(String(st[b] || b), undefined, { sensitivity: "base" }),
  )) {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = st[k] || k;
    sel.appendChild(opt);
  }
  if ([...sel.options].some((o) => o.value === current)) sel.value = current;
  else sel.value = "all";
}

function ensureFeedsManageToolbarListeners() {
  if (feedsManageToolbarBound) return;
  feedsManageToolbarBound = true;
  const rerender = () => renderManageFeedsList();
  feedsFilterSearchEl?.addEventListener("input", rerender);
  feedsFilterRegionEl?.addEventListener("change", rerender);
  feedsFilterSourceEl?.addEventListener("change", rerender);
  feedsSortEl?.addEventListener("change", rerender);
}

function attachFeedRowActionListeners() {
  if (!feedsListEl) return;
  feedsListEl.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteFeed(btn.dataset.id));
  });
}

function renderManageFeedsList() {
  if (!feedsListEl || !manageFeedsCache) return;
  const { feeds, countryLabels } = manageFeedsCache;
  if (feeds.length === 0) {
    feedsListEl.innerHTML = '<div class="feeds-loading">No feeds. Add one above.</div>';
    return;
  }
  const filtered = feeds.filter((f) => feedMatchesManageFilters(f, countryLabels));
  if (filtered.length === 0) {
    feedsListEl.innerHTML =
      '<div class="feeds-loading">No feeds match the current filters.</div>';
    return;
  }
  const sortKey = feedsSortEl?.value || "name_asc";
  const buckets = new Map();
  for (const gid of MANAGE_FEED_REGION_ORDER) buckets.set(gid, []);
  for (const f of filtered) {
    const b = countryToManageRegionBucket(f.country);
    const arr = buckets.get(b);
    if (arr) arr.push(f);
    else buckets.set(b, [f]);
  }
  for (const arr of buckets.values()) {
    arr.sort((a, b) => compareManageFeeds(a, b, sortKey, countryLabels));
  }
  const parts = [];
  for (const gid of MANAGE_FEED_REGION_ORDER) {
    const arr = buckets.get(gid) || [];
    if (arr.length === 0) continue;
    const label = manageRegionGroupLabel(gid);
    parts.push(
      `<div class="feed-region-group" data-region="${escapeAttr(gid)}">` +
        `<h4 class="feed-region-heading">${escapeHtml(label)} <span class="feed-region-count">(${arr.length})</span></h4>` +
        `<div class="feed-region-rows">` +
        arr.map((f) => buildFeedRowHtml(f, countryLabels)).join("") +
        `</div></div>`,
    );
  }
  feedsListEl.innerHTML =
    parts.join("") ||
    '<div class="feeds-loading">No feeds match the current filters.</div>';
  attachFeedRowActionListeners();
}

async function loadFeeds() {
  if (!feedsListEl) return;
  feedsListEl.innerHTML = '<div class="feeds-loading">Loading feeds…</div>';
  ensureFeedsManageToolbarListeners();
  try {
    const res = await fetch("/api/feed-sources");
    const json = await res.json();
    const feeds = json.feeds || [];
    const countryLabels = json.countryLabels || {};
    const countries = json.countriesOfInterest || [];

    manageFeedsCache = {
      feeds,
      countryLabels,
      sourceTypeLabels: json.sourceTypeLabels || {},
    };

    if (feedCountryEl) {
      feedCountryEl.innerHTML = '<option value="">—</option>';
      for (const code of countries) {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = countryLabels[code] || code;
        feedCountryEl.appendChild(opt);
      }
    }

    populateFeedsSourceTypeFilter();
    renderManageFeedsList();
  } catch (e) {
    manageFeedsCache = null;
    feedsListEl.innerHTML =
      '<div class="feeds-loading">Failed to load feeds. Is the server running?</div>';
  }
}

async function deleteFeed(id) {
  if (!confirm("Remove this feed? It will no longer be parsed.")) return;
  try {
    const res = await fetch("/api/feed-sources/" + encodeURIComponent(id), { method: "DELETE" });
    if (res.ok) loadFeeds();
    else feedsListEl.innerHTML = '<div class="feeds-loading">Failed to delete.</div>';
  } catch (e) {
    feedsListEl.innerHTML = '<div class="feeds-loading">Failed to delete.</div>';
  }
}

feedFormEl?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = feedNameEl?.value?.trim();
  const url = feedUrlEl?.value?.trim();
  const source_type = feedSourceTypeEl?.value;
  const country = feedCountryEl?.value || undefined;
  if (!name || !url || !source_type) return;
  try {
    const res = await fetch("/api/feed-sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, source_type, country }),
    });
    const json = await res.json();
    if (res.ok) {
      feedNameEl.value = "";
      feedUrlEl.value = "";
      feedSourceTypeEl.value = "regulator";
      feedCountryEl.value = "";
      loadFeeds();
    } else {
      alert(json.error || "Failed to add feed");
    }
  } catch (e) {
    alert("Failed to add feed");
  }
});

// Ignore keywords: add (click + Enter)
document.addEventListener("click", (e) => {
  if (e.target?.id === "ignore-keyword-add") {
    const input = document.getElementById("ignore-keyword-input");
    const val = (input?.value || "").trim();
    if (!val) return;
    addIgnoreKeywordSubmit(val);
    if (input) input.value = "";
  }
});
document.addEventListener("keydown", (e) => {
  if (e.target?.id === "ignore-keyword-input" && e.key === "Enter") {
    e.preventDefault();
    const val = (e.target?.value || "").trim();
    if (val) {
      addIgnoreKeywordSubmit(val);
      e.target.value = "";
    }
  }
});

// Ingest (fetch all feeds) — same as Run digest on Digest tab
document.getElementById("ingest-btn")?.addEventListener("click", () => {
  runDigest(document.getElementById("ingest-btn"), "Fetch feeds now");
});

// Populate Country and Source dropdowns and feed list on page load
fetchConfig()
  .then((config) => {
    data.sourceTypeLabels = config.sourceTypeLabels ?? {};
    data.countryLabels = config.countryLabels ?? {};
    data.countriesOfInterest = config.countriesOfInterest ?? [];
    populateFilters();
    loadFeeds(); // load feed list so it's ready when user opens Manage Feeds tab
  })
  .catch(() => {});

initStorySurfacesModal();
load();
