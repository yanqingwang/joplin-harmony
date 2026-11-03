// HarmonyOS expo-image-manipulator shim. Resizing is a no-op: the original
// image is returned so callers still copy and store a valid file.
export const SaveFormat = { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' };

class ManipulateContext {
	constructor(sourceUri) {
		this.sourceUri_ = sourceUri;
	}

	resize() {
		return this;
	}

	rotate() {
		return this;
	}

	crop() {
		return this;
	}

	async renderAsync() {
		const sourceUri = this.sourceUri_;
		return {
			saveAsync: async () => ({ uri: sourceUri, width: 0, height: 0 }),
		};
	}
}

export const ImageManipulator = {
	manipulate: (sourceUri) => new ManipulateContext(sourceUri),
};
