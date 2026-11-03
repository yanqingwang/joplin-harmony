# Joplin HarmonyOS shell (P0)

React Native OpenHarmony (RNOH) shell that runs a React Native app on HarmonyOS 7 / API 26. This is the P0 scaffold for porting Joplin's mobile app; it proves the RNOH toolchain end to end before the Joplin-specific native modules are ported.

## Version alignment

| Component | Version |
|---|---|
| React Native | 0.86.3 (same as `packages/app-mobile`) |
| RNOH | 0.86.1 (`peerDependencies: react-native 0.86.3`) |
| DevEco Studio / SDK | 26.0.0 / API 26 (26.0.0.105) |
| Bundle name | `com.heartroad.joplin` |

## Layout

```
joplin-harmony/
├── harmony/             # DevEco Studio project root (open this in DevEco)
│   ├── AppScope/
│   ├── entry/
│   ├── build-profile.json5
│   └── oh-package.json5 # depends on react_native_openharmony.har
└── harmony-shell/       # JavaScript workspace (Metro, RNOH CLI, shims)
    ├── package.json
    ├── joplin-entry.js  # RN entry
    ├── metro.joplin.config.js
    ├── build.sh / build-joplin.sh / dev-loop.sh
    └── node_modules/    # linked into ../harmony as node_modules
```

## Build

```bash
cd code/joplin-harmony/harmony-shell
bash build.sh           # P0: placeholder shell bundle
bash build-joplin.sh    # P1: real Joplin mobile bundle (needs monorepo yarn install)
```

`build.sh` bundles the placeholder `App.tsx` and writes
`release/joplin-harmony-p0-unsigned.hap`. `build-joplin.sh` bundles the real
Joplin app through `metro.joplin.config.js` + `joplin-entry.js` and writes
`release/joplin-harmony-p1-unsigned.hap`. Both write the JS bundle and assets
into `../harmony/entry/src/main/resources/rawfile/` and build the DevEco project
in `../harmony`.

P1 status: the real Joplin mobile app starts and its core flows (notes, folders,
Markdown viewer, editor, settings) work on the API 26 emulator. Remaining gaps
are listed in `wk/AIReports/joplin-鸿蒙移植-P1进展-2026-11-03.md`.

## Signing / install

The HAP is **unsigned**. Signing is configured in DevEco Studio
(Project Structure → Signing Configs) or with the AppGallery release certificate
and profile; see `../harmony/README.md`. The project deliberately has no
`signingConfigs` block because hvigor expects DevEco-encrypted passwords.
