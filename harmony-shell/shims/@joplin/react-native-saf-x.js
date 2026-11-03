// HarmonyOS shim for @joplin/react-native-saf-x. Android Storage Access Framework
// is not available on HarmonyOS; all operations reject gracefully.
const notAvailable = async () => {
	throw new Error('SAF is not available on HarmonyOS');
};

const RNSAF = {
	stat: notAvailable,
	listFiles: notAvailable,
	writeFile: notAvailable,
	writeFileInDirectory: notAvailable,
	readFile: notAvailable,
	copyFile: notAvailable,
	copyFileToDirectory: notAvailable,
	moveFile: notAvailable,
	rename: notAvailable,
	mkdir: notAvailable,
	unlink: notAvailable,
	exists: async () => false,
	openDocumentTree: async () => null,
};

export default RNSAF;
export const openDocumentTree = RNSAF.openDocumentTree;
