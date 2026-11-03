// HarmonyOS react-native-version-info shim. The real app version lives in the
// HAP manifest; this only feeds log lines and the about screen.
const VersionInfo = {
	appVersion: '3.7.3',
	buildVersion: '1',
	bundleIdentifier: 'com.heartroad.joplin',
};

export const appVersion = VersionInfo.appVersion;
export const buildVersion = VersionInfo.buildVersion;
export const bundleIdentifier = VersionInfo.bundleIdentifier;

export default VersionInfo;
