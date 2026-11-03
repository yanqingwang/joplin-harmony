// HarmonyOS react-native-rsa-native shim. Legacy RSA key generation is only
// needed for E2EE key setup, which is not available yet.
const notImplemented = (name) => () => {
	throw new Error(`${name} is not implemented on HarmonyOS yet`);
};

const RSA = {
	generateKeys: notImplemented('RSA.generateKeys'),
	generate: notImplemented('RSA.generate'),
	encrypt: notImplemented('RSA.encrypt'),
	decrypt: notImplemented('RSA.decrypt'),
	sign: notImplemented('RSA.sign'),
	verify: notImplemented('RSA.verify'),
};

export { RSA };
export default { RSA };
