// HarmonyOS geolocation shim. Note geolocation is optional in Joplin (used for
// geo-tagged notes); implementations should use @ohos.geoLocationManager.
const unavailable = (error) => {
	if (error) setTimeout(() => error({ code: 2, message: 'Location is not available on HarmonyOS yet' }), 0);
};

const Geolocation = {
	setRNConfiguration: () => {},
	requestAuthorization: () => {},
	getCurrentPosition: (_success, error) => unavailable(error),
	watchPosition: (_success, error) => {
		unavailable(error);
		return 0;
	},
	clearWatch: () => {},
	stopObserving: () => {},
};

export default Geolocation;
