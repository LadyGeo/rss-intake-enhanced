# RSS Intake (enhanced UI)

This repository holds the **enhanced web UI** for RSS Intake: HTML, CSS, and client JavaScript. The desktop app and full server build **embed** these files from the `public/` folder.

## If you just want it to work

1. **Full five-tab app in the browser (recommended):** use **[LadyGeo/RSS_Intake](https://github.com/LadyGeo/RSS_Intake)** — download the ZIP, run **`Start RSS Intake.command`**, then open **`http://localhost:3000`**. That repo includes the **Express API**, **SQLite**, ingest, and this **same five-tab UI** under `public/`.

2. **macOS desktop `.app`:** when you publish builds, attach **`.app` / `.dmg` to [Releases](https://github.com/LadyGeo/rss-intake-enhanced/releases)** (or ship them from RSS_Intake). That bundles UI + API in one install.

3. **This repo alone** is **static files only**. Do not rely on **`python -m http.server`** or “open HTML in the browser” without also running an API (see below). Otherwise you will see a **clear on-page message** and **“Server error”** on actions that call **`/api/...`**.

## Developers: preview the UI against a running API

The **canonical** bundle for packaging is **`public/`**. Root **`index.html`** (and matching JS/CSS) are kept **in sync** with `public/` so if you run `python3 -m http.server` from the **repo root**, you get the same **five-tab** UI as in `public/` (Digest, Tags, Manage Feeds, Coverage, Trends).

```bash
npm install   # optional; only needed for npm scripts
npm run preview
```

That serves `public/` on **http://127.0.0.1:4173**. You still need the **Express** server (from your desktop build or another repo). When the API is on another origin/port, open:

```text
http://127.0.0.1:4173/?api=http://127.0.0.1:YOUR_API_PORT
```

Or set once in the browser devtools:

```js
localStorage.setItem("rss-intake-api-base", "http://127.0.0.1:YOUR_API_PORT");
```

Then reload (no query string needed).

### Same thing with Python only

```bash
cd public
python3 -m http.server 4173
```

Then use **`?api=`** or **`rss-intake-api-base`** as above.

## Repository layout

| Path | Purpose |
|------|--------|
| **`public/`** | **Source of truth** for the shipped UI (`index.html`, `thisisTHEapp.js`, styles, keywords). |
| Root `index.html`, `thisisTHEapp.js`, … | **Mirrors `public/`** — run **`npm run sync`** after editing `public/` so root stays identical. |
| `data/` | Example digests / local data (not required to run the UI). |
| `docs/` | Extra technical notes. |

The **HTTP API** (Express, SQLite, ingest, etc.) is **not defined in this repo**; it lives in the **desktop / server project** that packages this UI. If you open-source that stack too, link it from this README.

## Publishing for others (checklist)

- [ ] **Releases**: Attach a signed **macOS** build (`.app` / `.dmg`) for normal users.
- [ ] **README** (this file): Point users to Releases; explain static vs full app.
- [ ] **Desktop build**: Apply packaging fixes in [docs/DESKTOP_BUILD.md](docs/DESKTOP_BUILD.md) (Electron `chdir`, UI path, updater noise).
- [ ] **macOS distribution**: Use **Developer ID** signing and **notarization** so Gatekeeper does not block downloads.
- [ ] **Quarantine**: First-time downloaders may need **System Settings → Privacy & Security → Open Anyway** until notarized builds are shipped.

## Optional: GitHub Actions CI

Some personal access tokens **cannot push** new files under `.github/workflows/` (GitHub requires the `workflow` scope). To enable CI anyway:

1. On GitHub: **Actions → New workflow → set up a workflow yourself**, paste the YAML from [docs/github-actions-ci.yml](docs/github-actions-ci.yml), and save as **`ci.yml`**.

2. Locally before pushing: **`bash scripts/verify-public-ui.sh`** — same checks the workflow runs.

## License

Add a `LICENSE` file if you want others to reuse the code clearly.
