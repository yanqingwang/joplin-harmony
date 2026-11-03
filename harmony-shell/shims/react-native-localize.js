// HarmonyOS locale shim. Reads the real device language through the JoplinI18n
// TurboModule (@ohos.i18n); falls back to en-US when the module is unavailable
// (e.g. unit tests).
import { TurboModuleRegistry } from 'react-native';

const enUS = [{ countryCode: 'US', languageCode: 'en', languageTag: 'en-US', isRTL: false }];

const readLocales = () => {
	try {
		const i18n = TurboModuleRegistry.get('JoplinI18n');
		if (i18n && typeof i18n.getLocales === 'function') {
			const parsed = JSON.parse(i18n.getLocales());
			if (Array.isArray(parsed) && parsed.length) return parsed;
		}
	} catch {
		// TurboModule not registered — keep the en-US fallback below.
	}
	return enUS;
};

const locales = readLocales();
const languageTag = locales[0].languageTag;
const isRTL = locales[0].isRTL;

export const getLocales = () => locales;
export const getCountry = () => locales[0].countryCode || 'US';
export const getCalendar = () => 'gregorian';
export const getTimeZone = () => 'UTC';
export const uses24HourClock = () => true;
export const usesMetricSystem = () => true;
export const getNumberFormatSettings = () => ({ decimalSeparator: '.', groupingSeparator: ',' });
export const findBestLanguageTag = () => ({ languageTag, isRTL });
