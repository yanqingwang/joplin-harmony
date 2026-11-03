// HarmonyOS react-native-quick-crypto shim. The primitives Joplin's E2EE uses
// (PBKDF2, SHA, AES-GCM, random bytes) are backed by the JoplinCrypto
// TurboModule (@ohos.security.cryptoFramework). Streaming cipher calls are
// buffered because Joplin always writes the whole payload in one update().
import { TurboModuleRegistry } from 'react-native';

const native = TurboModuleRegistry.get('JoplinCrypto');

const requireNative = () => {
	if (!native) throw new Error('JoplinCrypto TurboModule is not available');
	return native;
};

const toBuffer = (data, encoding = 'utf8') => {
	if (typeof data === 'string') return Buffer.from(data, encoding);
	if (Buffer.isBuffer(data)) return data;
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	return Buffer.from(data);
};

const toBase64 = (data, encoding) => toBuffer(data, encoding).toString('base64');

const randomBytes = (size, callback) => {
	const result = Buffer.from(requireNative().randomBytes(size), 'base64');
	if (callback) {
		setTimeout(() => callback(null, result), 0);
		return undefined;
	}
	return result;
};

const ab2str = (buf, encoding = 'hex', start = 0, end) => {
	const from = Math.max(0, start ?? 0);
	const to = Math.min(buf.byteLength, end ?? buf.byteLength);
	return Buffer.from(buf).toString(encoding, from, to);
};

const binaryLikeToArrayBuffer = (data, encoding = 'utf-8') => {
	const buffer = toBuffer(data, encoding);
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

// Node accepts "SHA-512"/"sha512", but HarmonyOS only accepts "SHA512".
const normalizeDigest = (name) => String(name).replace(/[-_]/g, '').toUpperCase();

const createHash = (algorithm) => {
	const chunks = [];
	const hash = {
		update(data) {
			chunks.push(toBuffer(data));
			return hash;
		},
		digest() {
			return Buffer.from(requireNative().digest(normalizeDigest(algorithm), Buffer.concat(chunks).toString('base64')), 'base64');
		},
	};
	return hash;
};

const pbkdf2 = (password, salt, iterations, keylen, digest, callback) => {
	requireNative()
		.pbkdf2(toBase64(password), toBase64(salt), iterations, keylen, normalizeDigest(digest))
		.then((result) => callback(null, Buffer.from(result, 'base64')))
		.catch((error) => callback(error));
};

// Auth tags and AAD are supplied through setAAD()/setAuthTag(), so the payload
// only reaches the native module at final().
const createCipher = (encrypting, algorithm, key, iv, options) => {
	const chunks = [];
	const keyBase64 = toBase64(key);
	const ivBase64 = toBase64(iv);
	const authTagLength = options?.authTagLength ?? 16;
	let aad = Buffer.alloc(0);
	let authTag = null;

	return {
		setAAD(data) { aad = toBuffer(data); },
		setAuthTag(data) { authTag = toBuffer(data); },
		update(data) {
			chunks.push(toBuffer(data));
			return Buffer.alloc(0);
		},
		final() {
			if (authTag && authTag.length !== authTagLength) {
				throw new Error(`Invalid authentication tag length: ${authTag.length}`);
			}
			const data = Buffer.concat(chunks).toString('base64');
			const aadBase64 = aad.toString('base64');
			const native = requireNative();
			const result = encrypting
				? native.encrypt(algorithm, keyBase64, ivBase64, aadBase64, data)
				: native.decrypt(algorithm, keyBase64, ivBase64, aadBase64, data, authTag ? authTag.toString('base64') : '');
			if (encrypting) {
				const parsed = JSON.parse(result);
				authTag = Buffer.from(parsed.tag, 'base64');
				return Buffer.from(parsed.ct, 'base64');
			}
			return Buffer.from(result, 'base64');
		},
		getAuthTag() {
			if (!authTag) throw new Error('Auth tag is not available');
			return authTag;
		},
	};
};

const QuickCrypto = {
	randomBytes,
	ab2str,
	binaryLikeToArrayBuffer,
	createHash,
	pbkdf2,
	createCipheriv: (algorithm, key, iv, options) => createCipher(true, algorithm, key, iv, options),
	createDecipheriv: (algorithm, key, iv, options) => createCipher(false, algorithm, key, iv, options),
};

export { randomBytes, ab2str, binaryLikeToArrayBuffer, createHash, pbkdf2 };
export const createCipheriv = QuickCrypto.createCipheriv;
export const createDecipheriv = QuickCrypto.createDecipheriv;

export default QuickCrypto;
