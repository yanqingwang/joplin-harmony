// HarmonyOS expo shim. Only the module reload helper is used by Joplin and it
// is reachable through RN's DevSettings, which RNOH supports.
import { DevSettings } from 'react-native';

export const reloadAppAsync = async () => {
	DevSettings.reload();
};
