// HarmonyOS shim for react-native-share. Joplin only calls Share.open() when
// exporting a file. A real implementation should use @ohos.systemShare.
const notImplemented = async () => {
	throw new Error('Sharing is not implemented on HarmonyOS yet');
};

const Share = {
	Social: {},
	open: notImplemented,
	shareSingle: notImplemented,
	dismissShare: async () => {},
	isPackageInstalled: async () => false,
};

export default Share;
