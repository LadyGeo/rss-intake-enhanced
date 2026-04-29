# RSS Intake (enhanced UI)

This repository holds the **enhanced web UI** for RSS Intake: HTML, CSS, and client JavaScript. The desktop app and full server build **embed** these files from the `public/` folder.

## If you just want it to work

1. **Prefer the desktop app** (macOS): install the **`.app` or `.dmg` from [Releases](https://github.com/LadyGeo/rss-intake-enhanced/releases)** when published. That serves the UI and the **`/api/...`** backend together, so nothing extra is required.

2. **Do not rely on “open the folder in a browser” or `python -m http.server` alone.** Those only serve static files. The UI calls **`/api/config`**, **`/api/items`**, etc. Without the API, you will see **“Failed to load”** or **“Server error”**.

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
| Root `index.html`, `thisisTHEapp.js`, … | **Mirrors `public/`** for the same five-tab app when you serve from the repo root; update both whenever you change the UI. |
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
