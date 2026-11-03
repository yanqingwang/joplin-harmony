// Metro config that bundles the real Joplin mobile app for HarmonyOS via RNOH.
// Resolution mirrors packages/app-mobile/metro.config.js, but the project root
// is the RNOH shell so the harmony platform implementation and HAR resolve.
const path = require('path');

const { mergeConfig, getDefaultConfig } = require('@react-native/metro-config');
const { createHarmonyMetroConfig } = require('@react-native-oh/react-native-harmony/metro.config');

const SHELL = __dirname;
const REPO = path.resolve(SHELL, '..');
const APP = path.resolve(REPO, 'packages/app-mobile');

const localPackages = {
	'@joplin/lib': path.resolve(REPO, 'packages/lib'),
	'@joplin/renderer': path.resolve(REPO, 'packages/renderer'),
	'@joplin/turndown': path.resolve(REPO, 'packages/turndown'),
	'@joplin/turndown-plugin-gfm': path.resolve(REPO, 'packages/turndown-plugin-gfm'),
	'@joplin/editor': path.resolve(REPO, 'packages/editor'),
	'@joplin/tools': path.resolve(REPO, 'packages/tools'),
	'@joplin/utils': path.resolve(REPO, 'packages/utils'),
	'@joplin/fork-htmlparser2': path.resolve(REPO, 'packages/fork-htmlparser2'),
	'@joplin/whisper-voice-typing': path.resolve(REPO, 'packages/whisper-voice-typing'),
	'@joplin/fork-uslug': path.resolve(REPO, 'packages/fork-uslug'),
	'@joplin/react-native-saf-x': path.resolve(REPO, 'packages/react-native-saf-x'),
	'@joplin/react-native-alarm-notification': path.resolve(REPO, 'packages/react-native-alarm-notification'),
	'@joplin/fork-sax': path.resolve(REPO, 'packages/fork-sax'),
	'@joplin/htmlpack': path.resolve(REPO, 'packages/htmlpack'),
};

const remappedPackages = {
	...localPackages,
	path: path.resolve(APP, 'node_modules/path-browserify'),
	crypto: path.resolve(APP, 'utils/polyfills/crypto-polyfill'),
	'@joplin/mobile-config': path.resolve(APP, 'config/config.default.js'),
};

// Module name -> replacement. Aliases point at OHOS ports; quick-actions has
// no native support and is stubbed.
const shimmedModules = {
	'react-dom': path.resolve(SHELL, 'shims/react-dom.js'),
	'react-native-quick-actions': path.resolve(SHELL, 'shims/react-native-quick-actions.js'),
	'react-native-share': path.resolve(SHELL, 'shims/react-native-share.js'),
	'@react-native-clipboard/clipboard': path.resolve(SHELL, 'shims/@react-native-clipboard/clipboard.js'),
	'@react-native-community/netinfo': path.resolve(SHELL, 'shims/@react-native-community/netinfo.js'),
	'react-native-localize': path.resolve(SHELL, 'shims/react-native-localize.js'),
	'react-native-get-random-values': path.resolve(SHELL, 'shims/react-native-get-random-values.js'),
	'expo-audio': path.resolve(SHELL, 'shims/expo-audio.js'),
	'expo-camera': path.resolve(SHELL, 'shims/expo-camera.js'),
	'expo-image-manipulator': path.resolve(SHELL, 'shims/expo-image-manipulator.js'),
	'expo-local-authentication': path.resolve(SHELL, 'shims/expo-local-authentication.js'),
	expo: path.resolve(SHELL, 'shims/expo.js'),
	'expo-sqlite': path.resolve(SHELL, 'shims/expo-sqlite.js'),
	'react-native-quick-crypto': path.resolve(SHELL, 'shims/react-native-quick-crypto.js'),
	'react-native-rsa-native': path.resolve(SHELL, 'shims/react-native-rsa-native.js'),
	'rn-fetch-blob': path.resolve(SHELL, 'shims/rn-fetch-blob.js'),
	'react-native-svg': path.resolve(SHELL, 'shims/react-native-svg.js'),
	// The icon packages need only a registered font family, which Index.ets passes
	// to RNApp as fontResourceByFontFamily.
	'@react-native-vector-icons/get-image': path.resolve(SHELL, 'shims/react-native-vector-icons.js'),
	'react-native-version-info': path.resolve(SHELL, 'shims/react-native-version-info.js'),
	'@react-native-community/geolocation': path.resolve(SHELL, 'shims/react-native-geolocation.js'),
	'@react-native-documents/picker': path.resolve(SHELL, 'shims/react-native-documents-picker.js'),
	'react-native-nitro-modules': path.resolve(SHELL, 'shims/react-native-nitro-modules.js'),
	'react-native-safe-area-context': path.resolve(SHELL, 'shims/react-native-safe-area-context.js'),
	// RNOH port of react-native-webview: its JS entry selects WebView.harmony.tsx.
	'react-native-webview': path.resolve(SHELL, 'node_modules/@react-native-oh-tpl/react-native-webview/src/index.ts'),
	'@dr.pogodin/react-native-fs': path.resolve(SHELL, 'shims/@dr.pogodin/react-native-fs.js'),
	'@joplin/react-native-saf-x': path.resolve(SHELL, 'shims/@joplin/react-native-saf-x.js'),
};

const base = getDefaultConfig(SHELL);
const harmonyConfig = createHarmonyMetroConfig({ reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony' });
const harmonyResolveRequest = harmonyConfig.resolver.resolveRequest;

// Several packages in the repo carry their own React, so a plain hierarchical
// resolve bundles two React instances and the renderer installs its hook
// dispatcher on the wrong one. Pin every `react`/`react/*` import to the
// shell's copy.
const shellReactResolutions = new Map();
const resolveShellReact = moduleName => {
	if (shellReactResolutions.has(moduleName)) return shellReactResolutions.get(moduleName);
	let filePath = null;
	try {
		filePath = require.resolve(moduleName, { paths: [SHELL] });
	} catch {
		filePath = null;
	}
	shellReactResolutions.set(moduleName, filePath);
	return filePath;
};

module.exports = mergeConfig(base, harmonyConfig, {
	projectRoot: SHELL,
	watchFolders: [REPO, ...Object.values(localPackages)],
	resolver: {
		// The clone contains stale untracked tsc output (.js next to .ts), and
		// Metro picks the first extension it finds, so TypeScript has to win.
		sourceExts: [...['ts', 'tsx'], ...base.resolver.sourceExts.filter(ext => ext !== 'ts' && ext !== 'tsx')],
		assetExts: [...base.resolver.assetExts, 'jpl'],
		nodeModulesPaths: [
			path.join(SHELL, 'node_modules'),
			path.join(REPO, 'node_modules'),
			path.join(APP, 'node_modules'),
		],
		extraNodeModules: remappedPackages,
		resolveRequest: (ctx, moduleName, platform) => {
			if (moduleName === 'react' || moduleName.startsWith('react/')) {
				const filePath = resolveShellReact(moduleName);
				if (filePath) return { type: 'sourceFile', filePath };
			}
			if (shimmedModules[moduleName]) {
				return { type: 'sourceFile', filePath: shimmedModules[moduleName] };
			}
			return harmonyResolveRequest(ctx, moduleName, platform);
		},
	},
	transformer: {
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: true,
			},
		}),
	},
});
