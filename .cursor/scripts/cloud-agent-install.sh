#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "==> Validating Chrome extension manifest"
python3 -c "import json; json.load(open('extension/manifest.json'))"

echo "==> Checking required extension files"
required_files=(
  extension/manifest.json
  extension/background/service-worker.js
  extension/popup/popup.html
  extension/popup/popup.js
  extension/lib/extractor.js
  extension/lib/parser.js
  extension/samples/sample-manuscript.tex
)
for file in "${required_files[@]}"; do
  test -f "$file" || { echo "Missing required file: $file" >&2; exit 1; }
done

echo "==> Verifying Chrome is available"
test -x /usr/local/bin/google-chrome
/usr/local/bin/google-chrome --version

echo "==> Running extraction smoke test"
node .cursor/scripts/smoke-test.mjs

echo "==> Install complete"
