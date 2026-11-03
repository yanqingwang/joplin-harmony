// HarmonyOS expo-audio shim. Voice typing is not available; every entry point
// reports a permission denial or throws, which the caller already handles.
export const AudioQuality = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
export const IOSOutputFormat = { MPEG4AAC: 'aac ' };

const denied = async () => ({ granted: false, status: 'denied' });

export const getRecordingPermissionsAsync = denied;
export const requestRecordingPermissionsAsync = denied;
export const requestNotificationPermissionsAsync = denied;
export const setAudioModeAsync = async () => {};

export const useAudioRecorder = () => ({
	prepareToRecordAsync: async () => {},
	record: () => {},
	stop: async () => {},
	pause: () => {},
});

export const useAudioRecorderState = () => ({
	isRecording: false,
	durationMillis: 0,
	canRecord: false,
});
