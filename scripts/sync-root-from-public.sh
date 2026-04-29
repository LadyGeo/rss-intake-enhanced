#!/usr/bin/env bash
# Keep repo-root UI files identical to public/ (five-tab app + keywords + styles).
# Uses rsync -L so symlinks under public/ are never followed into ../ (which would corrupt both copies).
set -euo pipefail
cd "$(dirname "$0")/.."
for f in index.html thisisTHEapp.js styles.css keyword-lists.js keyword-i18n.js; do
  rsync -aL "public/$f" "./$f"
done
echo "Synced from public/: index.html thisisTHEapp.js styles.css keyword-lists.js keyword-i18n.js"
