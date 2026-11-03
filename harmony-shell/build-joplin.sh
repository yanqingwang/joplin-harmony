#!/usr/bin/env bash
# Build a HarmonyOS HAP that bundles the real Joplin mobile app (P1).
# Requires the monorepo dependencies to be installed (node .yarn/releases/yarn-4.17.0.cjs install).
# Produces an UNSIGNED hap; at runtime the app currently stops at the first
# missing native TurboModule (react-native-share).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEVECO="${DEVECO_HOME:-/Applications/DevEco-Studio.app/Contents}"
export PATH="$DEVECO/tools/node/bin:$DEVECO/tools/ohpm/bin:$DEVECO/tools/hvigor/bin:$PATH"
export JAVA_HOME="$DEVECO/jbr/Contents/Home"
export DEVECO_SDK_HOME="$DEVECO/sdk"

RAW="$ROOT/../harmony/entry/src/main/resources/rawfile"
mkdir -p "$RAW"

cd "$ROOT"

[ -e "$ROOT/../harmony/node_modules" ] || ln -s ../harmony-shell/node_modules "$ROOT/../harmony/node_modules"
[ -e "$ROOT/../harmony/package.json" ] || ln -s ../harmony-shell/package.json "$ROOT/../harmony/package.json"
./node_modules/.bin/react-native bundle-harmony --reset-cache \
	--entry-file "$ROOT/joplin-entry.js" \
	--config "$ROOT/metro.joplin.config.js" \
	--bundle-output "$RAW/bundle.harmony.js" \
	--assets-dest "$RAW" \
	--dev false

cd "$ROOT/../harmony"
[ -d oh_modules ] || ohpm install
hvigorw --mode module -p product=default -p module=entry@default assembleHap --no-daemon

HAP="$(ls -t entry/build/default/outputs/default/*.hap | head -1)"
mkdir -p "$ROOT/../release"
cp "$HAP" "$ROOT/../release/joplin-harmony-p1-unsigned.hap"
ls -lh "$ROOT/../release/joplin-harmony-p1-unsigned.hap"
