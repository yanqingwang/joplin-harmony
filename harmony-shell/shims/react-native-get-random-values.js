// HarmonyOS crypto.getRandomValues shim. Insecure fallback so startup and
// non-security random numbers work; E2EE must use @ohos.security.cryptoFramework.
const globalCrypto = globalThis.crypto || (globalThis.crypto = {});

if (!globalCrypto.getRandomValues) {
	globalCrypto.getRandomValues = (array) => {
		for (let i = 0; i < array.length; i++) {
			array[i] = Math.floor(Math.random() * 256);
		}
		return array;
	};
}

export {};
