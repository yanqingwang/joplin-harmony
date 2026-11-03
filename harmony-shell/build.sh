#!/usr/bin/env bash
# Build the Joplin HarmonyOS P0 shell HAP with the DevEco Studio 26 toolchain.
# Produces an UNSIGNED hap. Installing on a device requires a signing profile
# registered for the bundleName com.heartroad.joplin.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEVECO="${DEVECO_HOME:-/Applications/DevEco-Studio.app/Contents}"
export PATH="$DEVECO/tools/node/bin:$DEVECO/tools/ohpm/bin:$DEVECO/tools/hvigor/bin:$PATH"
export JAVA_HOME="$DEVECO/jbr/Contents/Home"
export DEVECO_SDK_HOME="$DEVECO/sdk"

cd "$ROOT"

# 1. JS dependencies
[ -d node_modules/react-native ] || npm install --no-audit --no-fund

# 2. JS bundle -> harmony/entry/src/main/resources/rawfile/bundle.harmony.js
npm run bundle

# 3. HarmonyOS project
cd "$ROOT/../harmony"
[ -d oh_modules ] || ohpm install

hvigorw --mode module -p product=default -p module=entry@default assembleHap --no-daemon "$@"

HAP="$(ls -t entry/build/default/outputs/default/*.hap | head -1)"
mkdir -p "$ROOT/../release"
cp "$HAP" "$ROOT/../release/joplin-harmony-p0-unsigned.hap"
ls -lh "$ROOT/../release/joplin-harmony-p0-unsigned.hap"
