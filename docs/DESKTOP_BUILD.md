# Desktop bundle (Electron + Express)

This repo only contains the **static UI**. If you maintain the **Electron + Express** app that consumes it, apply the following so downloaded `.app` bundles work reliably.

## 1. `electron/main.cjs` — do not `chdir` into `app.asar`

`app.getAppPath()` points at the **`app.asar` file** in production, not a directory. `process.chdir(root)` throws **`ENOTDIR`**.

**Fix:** in packaged mode, `chdir` to `path.dirname(root)` instead of `root`.

```js
const runtimeCwd = app.isPackaged ? path.dirname(root) : root;
process.chdir(runtimeCwd);
```

## 2. `dist/server.js` — resolve the locked UI `public` folder

Packaged layout has UI at **`app.asar/public`**, not `../../rss-intake-enhanced/public`.

**Fix:** when resolving the UI directory, try multiple candidates (env override first, then repo-style path, then `path.join(root, "public")`, then `path.join(root, "..", "public")`). Use the first path where `index.html` exists.

## 3. `electron-updater` — missing `app-update.yml`

If **`app-update.yml`** is not shipped, `autoUpdater.checkForUpdatesAndNotify()` logs **ENOENT**.

**Fix:** only call the updater when `app.isPackaged` **and** the yml exists, e.g.:

```js
const updateYml = path.join(process.resourcesPath, "app-update.yml");
if (app.isPackaged && fs.existsSync(updateYml)) {
  // checkForUpdatesAndNotify()
}
```

Or ship a minimal `app-update.yml` consistent with `package.json` `build.publish`.

## 4. macOS signing & Gatekeeper

- **Ad-hoc** builds: `spctl` may report **rejected**; users may need **Right-click → Open** once.
- **Distribution:** sign with **Developer ID Application**, **notarize**, staple the ticket.
- After editing **`app.asar`**, run **`codesign --force --deep --sign -`** on the `.app` again or the bundle will fail integrity checks.

## 5. Quarantine (browser downloads)

Extended attribute **`com.apple.quarantine`** can block behavior. Clearing it is a support workaround; **notarization** is the proper fix for strangers’ Macs.

```bash
xattr -dr com.apple.quarantine "/Applications/RSS Intake.app"
```

## 6. Keep GitHub UI in sync

Point your desktop build’s “locked UI” copy at **`public/`** from this repository (submodule, copy step in CI, or manual sync) so Releases always match what you test on GitHub.
