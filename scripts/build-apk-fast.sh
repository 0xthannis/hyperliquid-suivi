#!/usr/bin/env bash
# Build APK sans refaire prebuild (rapide si android/ est déjà prêt).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f "$ROOT/google-services.json" ]; then
  echo "❌ google-services.json manquant à la racine"
  exit 1
fi

if [ ! -f "$ROOT/android/app/google-services.json" ]; then
  echo "→ Copie google-services.json + prebuild (une seule fois)…"
  npx expo prebuild --platform android --no-install
else
  echo "→ Prebuild ignoré (déjà configuré)"
fi

JDK="$ROOT/.build-tools/jdk-17/Contents/Home"
export JAVA_HOME="${JAVA_HOME:-$JDK}"
export PATH="$JAVA_HOME/bin:$PATH"

echo "→ Compilation Gradle release (arm64 uniquement, ~2–4 min)…"
cd "$ROOT/android"
# Une seule archi = build beaucoup plus rapide ; suffisant pour téléphones récents.
./gradlew assembleRelease --no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a

DIST="$ROOT/dist"
mkdir -p "$DIST"
cp app/build/outputs/apk/release/app-release.apk "$DIST/AT-Capital-Terminal-277.apk"
cp app/build/outputs/apk/release/app-release.apk "$ROOT/web/public/AT-Capital-Terminal-277.apk"
echo "✅ APK : $DIST/AT-Capital-Terminal-277.apk"
ls -lh "$DIST/AT-Capital-Terminal-277.apk"
