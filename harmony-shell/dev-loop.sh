#!/usr/bin/env bash
# Rebuild the HarmonyOS bundle + HAP, install on the emulator, launch it, and
# print the JS/native errors raised during startup. Usage: ./dev-loop.sh
set -uo pipefail

SHELL_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SHELL_DIR/.." && pwd)"
DEVECO="/Applications/DevEco-Studio.app/Contents"
HDC="$DEVECO/sdk/default/openharmony/toolchains/hdc"
TARGET="${HDC_TARGET:-127.0.0.1:5555}"
BUNDLE="$PROJECT_DIR/harmony/entry/src/main/resources/rawfile/bundle.harmony.js"

export PATH="$DEVECO/tools/node/bin:$DEVECO/tools/ohpm/bin:$DEVECO/tools/hvigor/bin:$PATH"
export JAVA_HOME="$DEVECO/jbr/Contents/Home"
export DEVECO_SDK_HOME="$DEVECO/sdk"

cd "$SHELL_DIR" || exit 1

# The RNOH hvigor plugin needs the JS workspace visible from the HarmonyOS
# project root; recreate the links if they were cleaned.
[ -e "$PROJECT_DIR/harmony/node_modules" ] || ln -s ../harmony-shell/node_modules "$PROJECT_DIR/harmony/node_modules"
[ -e "$PROJECT_DIR/harmony/package.json" ] || ln -s ../harmony-shell/package.json "$PROJECT_DIR/harmony/package.json"

echo "== bundling =="
if ! ./node_modules/.bin/react-native bundle-harmony \
	--entry-file "$SHELL_DIR/joplin-entry.js" \
	--config "$SHELL_DIR/metro.joplin.config.js" \
	--bundle-output "$BUNDLE" \
	--assets-dest "$PROJECT_DIR/harmony/entry/src/main/resources/rawfile" \
	--dev false > /tmp/joplin-bundle.log 2>&1; then
	echo "BUNDLE FAILED"
	tail -30 /tmp/joplin-bundle.log
	exit 1
fi

echo "== building hap =="
cd "$PROJECT_DIR/harmony" || exit 1
if ! hvigorw --mode module -p product=default -p module=entry@default assembleHap --no-daemon > /tmp/harmony-hap.log 2>&1; then
	echo "HVIGOR FAILED"
	tail -30 /tmp/harmony-hap.log
	exit 1
fi

HAP="$PROJECT_DIR/harmony/entry/build/default/outputs/default/entry-default-unsigned.hap"
cp "$HAP" "$PROJECT_DIR/release/joplin-harmony-p1-unsigned.hap"

echo "== installing =="
"$HDC" -t "$TARGET" install -r "$HAP" 2>&1 | tail -1
"$HDC" -t "$TARGET" shell aa force-stop com.heartroad.joplin >/dev/null 2>&1

echo "== launching =="
"$HDC" -t "$TARGET" shell aa start -a EntryAbility -b com.heartroad.joplin 2>&1 | tail -1
sleep "${LAUNCH_WAIT:-15}"

echo "== runtime errors =="
"$HDC" -t "$TARGET" shell hilog -x 2>/dev/null |
	grep -E "com\.heartroad\.joplin" |
	grep -E "RNOH_JS|RNOH_CPP|Error|Cannot find native module" |
	tail -20

echo "== done =="
