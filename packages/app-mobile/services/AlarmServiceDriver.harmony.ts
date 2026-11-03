import Logger from '@joplin/utils/Logger';

// Alarm notifications are not implemented on HarmonyOS yet. Mirrors the web
// driver so the app can start; scheduled alarms become a no-op.
export default class AlarmServiceDriver {
	public constructor(logger: Logger) {
		logger.warn('WARNING: AlarmServiceDriver is not implemented on HarmonyOS');
	}

	public hasPersistentNotifications() {
		return false;
	}

	public notificationIsSet() {
		throw new Error('Available only for non-persistent alarms');
	}

	public setInAppNotificationHandler(_v: unknown) {
	}

	public async hasPermissions(_perm: unknown = null) {
		return false;
	}

	public async requestPermissions() {
		return false;
	}

	public async clearNotification(_id: number) {
	}

	public async scheduleNotification(_notification: Notification) {

	}
}
