# Joplin HarmonyOS project

This folder is the **DevEco Studio project root**. Open it directly in DevEco Studio
(File → Open → `code/joplin-harmony/harmony`); the JS side lives in `../harmony-shell`.

```
harmony/                 DevEco Studio / hvigor project
├── AppScope/            app.json5: bundleName com.heartroad.joplin, versionCode/Name
├── entry/               entry module (ArkTS shell, RNOH native modules, rawfile bundle)
├── build-profile.json5  products, SDK levels, signing (left empty on purpose)
├── hvigorfile.ts        appTasks + RNOH project plugin
├── hvigor/              hvigor version and RNOH plugin dependency
├── oh-package.json5     RNOH / webview HAR dependencies
└── sign/                local CA and generated debug profile (not used by hvigor)
```

## Why node_modules and package.json are symlinks

The RNOH hvigor plugin runs `react-native codegen-harmony` from the JavaScript
project root and refuses to write outside it. The JavaScript workspace is
`../harmony-shell`, so this project exposes it through two links:

| Link | Target | Purpose |
| --- | --- | --- |
| `node_modules` | `../harmony-shell/node_modules` | RNOH codegen CLI and JS dependencies |
| `package.json` | `../harmony-shell/package.json` | lets the RN CLI discover `codegen-harmony` and the `harmony.codegenConfig` block |

`entry/hvigorfile.ts` pins `nodeModulesPath: './node_modules'` and
`codegen.projectRootPath: '../harmony-shell'` to match. Both links are recreated by
`harmony-shell/dev-loop.sh`/`build-joplin.sh` if missing.

## Build

CLI (bundles the JS first, then builds, installs and launches on the emulator):

```bash
cd code/joplin-harmony
./harmony-shell/dev-loop.sh
```

HAP only:

```bash
cd code/joplin-harmony/harmony
hvigorw --mode module -p product=default -p module=entry@default assembleHap
```

## Signing

`build-profile.json5` intentionally has **no** `signingConfigs`: hvigor 6 treats
`storePassword` / `keyPassword` as DevEco-encrypted values backed by a
`sign/material` directory that only DevEco can create. Configure signing in
DevEco Studio (Project Structure → Signing Configs) or import the AppGallery
release certificate and profile there. Without a signing config, `assembleHap`
produces `entry-default-unsigned.hap`, which installs on the emulator.

`sign/` holds a locally generated CA chain and a debug `signed-profile.p7b`
(bundle `com.heartroad.joplin`, one device UDID). It is kept for reference and
for `hap-sign-tool` experiments; it is not referenced by hvigor.
