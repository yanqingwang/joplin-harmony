// HarmonyOS Nitro Modules shim. Nitro is a C++ JSI runtime with no RNOH build,
// so every hybrid object lookup fails loudly instead of crashing at import.
const createHybridObject = (name) => {
	throw new Error(`Nitro module "${name}" is not available on HarmonyOS`);
};

const NitroModules = {
	createHybridObject,
	hasHybridObject: () => false,
	getHybridObjectNames: () => [],
};

export { createHybridObject };
export default NitroModules;
