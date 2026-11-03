// HarmonyOS biometrics shim. Reports no enrolled hardware so Joplin falls back
// to the master password. A real implementation should use @ohos.userIAM.
export const AuthenticationType = { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 };

export const hasHardwareAsync = async () => false;
export const isEnrolledAsync = async () => false;
export const supportedAuthenticationTypesAsync = async () => [];
export const authenticateAsync = async () => ({ success: false, error: 'not_available' });
