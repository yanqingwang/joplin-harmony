// HarmonyOS locale shim. Defaults to English; a real implementation should use
// @ohos.intl / i18n.
const locales = [{ countryCode: 'US', languageCode: 'en', languageTag: 'en-US', isRTL: false }];

export const getLocales = () => locales;
export const getCountry = () => 'US';
export const getCalendar = () => 'gregorian';
export const getTimeZone = () => 'UTC';
export const uses24HourClock = () => true;
export const usesMetricSystem = () => true;
export const getNumberFormatSettings = () => ({ decimalSeparator: '.', groupingSeparator: ',' });
export const findBestLanguageTag = () => ({ languageTag: 'en-US', isRTL: false });
