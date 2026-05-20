#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
DESKTOP="$ROOT/desktop"

mkdir -p "$DIST" "$DESKTOP/build"

echo "→ Build web (mode Electron)…"
cd "$ROOT/web"
VITE_ELECTRON=true npm run build

if [ ! -f "$ROOT/assets/icon.png" ]; then
  echo "❌ assets/icon.png manquant"
  exit 1
fi

# Icône macOS (.icns) depuis le PNG de la marque
if [ ! -f "$DESKTOP/build/icon.icns" ] || [ "$ROOT/assets/icon.png" -nt "$DESKTOP/build/icon.icns" ]; then
  echo "→ Génération icon.icns…"
  ICONSET="$DESKTOP/build/icon.iconset"
  rm -rf "$ICONSET"
  mkdir -p "$ICONSET"
  sips -z 16 16 "$ROOT/assets/icon.png" --out "$ICONSET/icon_16x16.png" >/dev/null
  sips -z 32 32 "$ROOT/assets/icon.png" --out "$ICONSET/icon_16x16@2x.png" >/dev/null
  sips -z 32 32 "$ROOT/assets/icon.png" --out "$ICONSET/icon_32x32.png" >/dev/null
  sips -z 64 64 "$ROOT/assets/icon.png" --out "$ICONSET/icon_32x32@2x.png" >/dev/null
  sips -z 128 128 "$ROOT/assets/icon.png" --out "$ICONSET/icon_128x128.png" >/dev/null
  sips -z 256 256 "$ROOT/assets/icon.png" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
  sips -z 256 256 "$ROOT/assets/icon.png" --out "$ICONSET/icon_256x256.png" >/dev/null
  sips -z 512 512 "$ROOT/assets/icon.png" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
  sips -z 512 512 "$ROOT/assets/icon.png" --out "$ICONSET/icon_512x512.png" >/dev/null
  sips -z 1024 1024 "$ROOT/assets/icon.png" --out "$ICONSET/icon_512x512@2x.png" >/dev/null
  iconutil -c icns "$ICONSET" -o "$DESKTOP/build/icon.icns"
  rm -rf "$ICONSET"
fi

echo "→ Installation dépendances Electron…"
cd "$DESKTOP"
if [ ! -d node_modules ]; then
  npm install
fi

echo "→ Compilation application macOS (peut prendre quelques minutes)…"
npm run dist

DMG_ARM64=$(find "$DESKTOP/release" -maxdepth 1 -name '*arm64*.dmg' | head -1)
DMG_X64=$(find "$DESKTOP/release" -maxdepth 1 -name '*.dmg' ! -name '*arm64*' | head -1)
ZIP_ARM64=$(find "$DESKTOP/release" -maxdepth 1 -name '*arm64*.zip' | head -1)
APP_ARM64=$(find "$DESKTOP/release/mac-arm64" -maxdepth 1 -name '*.app' -type d 2>/dev/null | head -1)
APP_X64=$(find "$DESKTOP/release/mac" -maxdepth 1 -name '*.app' -type d 2>/dev/null | head -1)

ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ] && [ -n "$DMG_ARM64" ]; then
  cp "$DMG_ARM64" "$DIST/AT-Capital-Terminal-277-mac.dmg"
  PRIMARY_APP="$APP_ARM64"
else
  cp "${DMG_X64:-$DMG_ARM64}" "$DIST/AT-Capital-Terminal-277-mac.dmg"
  PRIMARY_APP="${APP_X64:-$APP_ARM64}"
fi

if [ -n "$DMG_ARM64" ]; then
  cp "$DMG_ARM64" "$DIST/AT-Capital-Terminal-277-mac-arm64.dmg"
fi
if [ -n "$DMG_X64" ]; then
  cp "$DMG_X64" "$DIST/AT-Capital-Terminal-277-mac-x64.dmg"
fi
if [ -n "$ZIP_ARM64" ]; then
  cp "$ZIP_ARM64" "$DIST/AT-Capital-Terminal-277-mac.zip"
fi

echo ""
echo "✅ DMG (recommandé sur ce Mac) : $DIST/AT-Capital-Terminal-277-mac.dmg"
ls -lh "$DIST/AT-Capital-Terminal-277-mac.dmg"
[ -f "$DIST/AT-Capital-Terminal-277-mac-arm64.dmg" ] && ls -lh "$DIST/AT-Capital-Terminal-277-mac-arm64.dmg"
[ -f "$DIST/AT-Capital-Terminal-277-mac-x64.dmg" ] && ls -lh "$DIST/AT-Capital-Terminal-277-mac-x64.dmg"

if [ -n "$PRIMARY_APP" ]; then
  echo ""
  echo "Pour lancer sans installer le DMG :"
  echo "  open \"$PRIMARY_APP\""
fi
