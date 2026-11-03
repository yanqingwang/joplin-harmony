// HarmonyOS clipboard shim. Joplin only uses setString/getString. Values are
// kept in memory; a real implementation should use @ohos.pasteboard.
let value = '';

const Clipboard = {
	setString: (text) => {
		value = String(text ?? '');
	},
	getString: async () => value,
	hasString: async () => value.length > 0,
	setImage: async () => {},
	getImage: async () => '',
	hasImage: async () => false,
	setURL: async (url) => {
		value = String(url ?? '');
	},
	getURL: async () => value,
	hasURL: async () => value.length > 0,
	setNumber: async (num) => {
		value = String(num ?? '');
	},
	setWebURI: async (uri) => {
		value = String(uri ?? '');
	},
};

export default Clipboard;
