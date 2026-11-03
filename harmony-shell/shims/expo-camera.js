// HarmonyOS expo-camera shim. Barcode scanning is unavailable; the view shows
// a placeholder instead of a preview.
import * as React from 'react';
import { Text, View } from 'react-native';

export const BarcodeSettings = {};
export const CameraMountError = {};
export const CameraRatio = { '4:3': '4:3', '16:9': '16:9' };

export const CameraView = () => React.createElement(
	View,
	{ style: { flex: 1, alignItems: 'center', justifyContent: 'center' } },
	React.createElement(Text, null, 'Camera is not available on HarmonyOS yet'),
);

export const useCameraPermissions = () => [
	{ granted: false, status: 'denied', canAskAgain: false },
	async () => ({ granted: false, status: 'denied', canAskAgain: false }),
];
