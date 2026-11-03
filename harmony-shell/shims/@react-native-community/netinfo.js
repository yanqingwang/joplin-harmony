// HarmonyOS netinfo shim. Joplin only configures and listens for reachability.
// A real implementation should use @ohos.net.connection.
const state = Object.freeze({
	type: 'wifi',
	isConnected: true,
	isInternetReachable: true,
	details: { isConnectionExpensive: false, strength: 100 },
});

export const useNetInfo = () => state;

const NetInfo = {
	configure: () => {},
	addEventListener: (listener) => {
		setTimeout(() => listener(state), 0);
		return () => {};
	},
	fetch: async () => state,
	refresh: async () => state,
	useNetInfo,
};

export default NetInfo;
