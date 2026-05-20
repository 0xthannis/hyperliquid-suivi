#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TOOLS="$ROOT/.build-tools"
JDK_DIR="$TOOLS/jdk-17"
SDK_ROOT="$TOOLS/android-sdk"
DIST="$ROOT/dist"
mkdir -p "$TOOLS" "$DIST"

JDK_URL="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.17%2B10/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.17_10.tar.gz"
CMDLINE_URL="https://dl.google.com/android/repository/commandlinetools-mac-13114758_latest.zip"

if [ ! -x "$JDK_DIR/Contents/Home/bin/java" ]; then
  echo "→ Téléchargement Java 17 (~180 Mo)…"
  curl -L --fail -o "$TOOLS/jdk.tar.gz" "$JDK_URL"
  rm -rf "$JDK_DIR"
  tar -xzf "$TOOLS/jdk.tar.gz" -C "$TOOLS"
  mv "$TOOLS"/jdk-17* "$JDK_DIR"
fi

export JAVA_HOME="$JDK_DIR/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
echo "Java: $($JAVA_HOME/bin/java -version 2>&1 | head -1)"

if [ ! -d "$SDK_ROOT/cmdline-tools/latest/bin" ]; then
  echo "→ Téléchargement Android SDK tools…"
  curl -L --fail -o "$TOOLS/cmdline-tools.zip" "$CMDLINE_URL"
  rm -rf "$SDK_ROOT"
  mkdir -p "$SDK_ROOT/cmdline-tools"
  unzip -q "$TOOLS/cmdline-tools.zip" -d "$SDK_ROOT/cmdline-tools"
  mv "$SDK_ROOT/cmdline-tools/cmdline-tools" "$SDK_ROOT/cmdline-tools/latest"
fi

export ANDROID_HOME="$SDK_ROOT"
export ANDROID_SDK_ROOT="$SDK_ROOT"
SDKMGR="$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager"
export PATH="$SDK_ROOT/platform-tools:$SDK_ROOT/cmdline-tools/latest/bin:$PATH"

echo "→ Installation composants Android (peut prendre plusieurs minutes)…"
yes | "$SDKMGR" --sdk_root="$SDK_ROOT" --licenses >/dev/null 2>&1 || true
"$SDKMGR" --sdk_root="$SDK_ROOT" \
  "platform-tools" \
  "platforms;android-36" \
  "build-tools;36.0.0" \
  "ndk;27.1.12297006"

if [ ! -f "$ROOT/google-services.json" ]; then
  echo ""
  echo "❌ google-services.json manquant à la racine du projet."
  echo "   Firebase Console → ton projet → Ajouter app Android"
  echo "   Package : com.thanh.suivitrades"
  echo "   Télécharge google-services.json → place-le ici :"
  echo "   $ROOT/google-services.json"
  echo ""
  exit 1
fi

echo "→ Prebuild Android (Firebase / google-services)…"
npx expo prebuild --platform android --no-install

echo "→ Compilation APK release…"
cd "$ROOT/android"
./gradlew assembleRelease --no-daemon

APK_SRC="app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_SRC" ]; then
  echo "❌ APK non trouvé"
  exit 1
fi

cp "$APK_SRC" "$DIST/AT-Capital-Terminal-277.apk"
cp "$APK_SRC" "$ROOT/web/public/AT-Capital-Terminal-277.apk"
echo ""
echo "✅ APK prêt : $DIST/AT-Capital-Terminal-277.apk"
echo "✅ APK web  : $ROOT/web/public/AT-Capital-Terminal-277.apk"
ls -lh "$DIST/AT-Capital-Terminal-277.apk"
