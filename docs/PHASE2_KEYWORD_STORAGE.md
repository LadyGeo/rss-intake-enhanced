# Phase 2: Keyword storage & display — this repo (`rss-intake-enhanced`)

**Intent:** Transparent `matched_keywords` (phrase + `keyword_type`); humans triage from **shown phrases**, not synthetic scores.

---

## Implemented here (no external path dependency)

### 1. Phrase lists — `public/keyword-lists.js` (and root `keyword-lists.js` copy)

- Defines `window.RSS_INTAKE_KEYWORD_LISTS`: `enforcement`, `severity`, `deadline`, `timing`, `proposal`, `litigation`, `context`, `pdp`, `pricing`, `checkout`, `shipping`, `privacy`, `accessibility`.
- Loaded **before** `thisisTHEapp.js` from `public/index.html` and root `index.html`.

### 1b. Locale → English — `public/keyword-i18n.js` (and root copy)

- Defines `window.RSS_INTAKE_I18N_RULES`: same `keyword_type` keys, each rule `{ en, patterns[] }`.
- Non-English `patterns` match with **diacritic folding** + **ß→ss** (`foldForLocaleMatch` in `thisisTHEapp.js`); hits emit **English** `keyword` + `match_source: "locale_map"` for chip tooltips.
- Loaded after `keyword-lists.js`, before `thisisTHEapp.js`.

### 2. Merge + enrich — `thisisTHEapp.js`

After each `/api/items` load:

- `findClientMatchedKeywords(title + snippet)` scans English lists (multi-word substring; single-token word boundary via existing `matchesKeyword`).
- `findI18nMatchedKeywords(title + snippet)` scans `RSS_INTAKE_I18N_RULES` with `foldForLocaleMatch`, emits English `keyword` + `match_source: "locale_map"`.
- `mergeMatchedKeywordRows(apiRows, clientRows)` dedupes on `keyword_type + keyword` (case-insensitive); preserves `signal_strength` and `match_source` when present.
- `enrichItemsWithClientKeywords(items)` merges API → English client → i18n client on every item.

So: **server rows win on duplicates**; client + locale maps fill gaps when the API omits or under-populates matches.

### 3. UI (already present)

- Grouped chips, “Matched phrases” filter, “Enforcement first” sort, exports aligned with the filtered/sorted view.

---

## When you add a real DB + ingest (elsewhere)

- Persist rows in `matched_keywords`; return them on `GET /api/items`.
- Optionally **trim** client lists to avoid double-counting, or keep merge as a safety net during migration.
- Optional `signal_strength` on rows for **sort only** — never as a displayed “confidence” score.

---

## Maintenance

- Edit **`public/keyword-lists.js`** (then sync **`keyword-lists.js`** at repo root if you still load the root `index.html`).
- Grow lists from your exhaustive doc in small PRs; prefer **specific phrases** over single ultra-common tokens to limit noise.
