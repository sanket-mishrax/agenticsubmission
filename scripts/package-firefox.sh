#!/usr/bin/env bash
# Package the extension as a Firefox .xpi (ZIP archive).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT_DIR="$ROOT/extension"
OUT_DIR="$ROOT/dist"

if [[ ! -f "$EXT_DIR/manifest.json" ]]; then
  echo "Error: extension/manifest.json not found." >&2
  exit 1
fi

VERSION="$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$EXT_DIR/manifest.json" | head -1 | sed 's/.*"\([^"]*\)"$/\1/')"
NAME="manuscript-submit-assistant"
XPI_NAME="${NAME}-${VERSION}.xpi"

mkdir -p "$OUT_DIR"

# Remove previous build of the same version
rm -f "$OUT_DIR/$XPI_NAME"
RELEASES_DIR="$ROOT/releases"
mkdir -p "$RELEASES_DIR"

# XPI must contain manifest.json at the archive root (not inside a subfolder)
(
  cd "$EXT_DIR"
  zip -r "$OUT_DIR/$XPI_NAME" . \
    -x "*.DS_Store" \
    -x "*__MACOSX*" \
    -x "*.git*" \
    -x "*~"
)

cp "$OUT_DIR/$XPI_NAME" "$RELEASES_DIR/$XPI_NAME"

echo ""
echo "=========================================="
echo "  Firefox .xpi created successfully"
echo "=========================================="
echo ""
echo "  Local build:  $OUT_DIR/$XPI_NAME"
echo "  Releases:     $RELEASES_DIR/$XPI_NAME"
echo ""
echo "If you cloned this repo, use the file in releases/:"
echo "  releases/$XPI_NAME"
echo ""
echo "Install in Firefox:"
echo "  1. Open about:addons"
echo "  2. Gear icon → Install Add-on From File…"
echo "  3. Select $OUT_DIR/$XPI_NAME"
echo ""
echo "For unsigned installs, you may need xpinstall.signatures.required = false in about:config"
