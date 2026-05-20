#!/usr/bin/env bash
# Génère un APK release local (nécessite Android SDK + Java 17)
set -euo pipefail
cd "$(dirname "$0")/.."

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

if [ ! -d android ]; then
  echo "→ Génération du projet Android natif…"
  npx expo prebuild --platform android
fi

echo "→ Compilation APK release…"
cd android
./gradlew assembleRelease

APK="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK" ]; then
  cp "$APK" ../suivi-thanh.apk
  echo "✅ APK prêt : $(cd .. && pwd)/suivi-thanh.apk"
else
  echo "❌ APK introuvable. Vérifie Android Studio / SDK."
  exit 1
fi
