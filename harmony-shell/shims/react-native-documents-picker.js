// HarmonyOS document picker shim. Picking files needs @ohos.file.picker, which
// is not wired up yet; every call rejects with a user-facing error.
export const errorCodes = {
	OPERATION_CANCELED: 'OPERATION_CANCELED',
	IN_PROGRESS: 'ASYNC_OP_IN_PROGRESS',
	UNABLE_TO_OPEN_FILE_TYPE: 'UNABLE_TO_OPEN_FILE_TYPE',
};

export const pick = async () => {
	const error = new Error('Picking documents is not available on HarmonyOS yet');
	error.code = errorCodes.UNABLE_TO_OPEN_FILE_TYPE;
	throw error;
};

export const pickDirectory = async () => pick();

export const isErrorWithCode = (error) => Boolean(error && error.code);
