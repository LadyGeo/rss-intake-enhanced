#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
test -f public/index.html
test -f public/thisisTHEapp.js
test -f public/styles.css
grep -q 'thisisTHEapp.js' public/index.html
grep -q 'resolveApiBaseForStaticHost' public/thisisTHEapp.js
grep -q 'data-tab="insights"' public/index.html
grep -q 'data-tab="trends"' public/index.html
for f in index.html thisisTHEapp.js styles.css keyword-lists.js keyword-i18n.js; do
  diff -q "$f" "public/$f" >/dev/null
done
echo "public/ UI bundle OK; root mirrors public/ (five-tab + assets)"
