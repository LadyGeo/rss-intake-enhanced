#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
test -f public/index.html
test -f public/thisisTHEapp.js
test -f public/styles.css
grep -q 'thisisTHEapp.js' public/index.html
grep -q 'resolveApiBaseForStaticHost' public/thisisTHEapp.js
echo "public/ UI bundle OK"
