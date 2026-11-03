// HarmonyOS rn-fetch-blob shim. Transfers go through XMLHttpRequest and written
// through the JoplinFileSystem TurboModule. The fs helpers Joplin does not use
// on HarmonyOS are omitted on purpose.
import { TurboModuleRegistry } from 'react-native';

const fileSystem = TurboModuleRegistry.get('JoplinFileSystem');

const directories = fileSystem
	? JSON.parse(fileSystem.getDirectoriesSync())
	: { files: '', cache: '', temp: '' };

const dirs = {
	DocumentDir: directories.files,
	CacheDir: directories.cache,
	PictureDir: directories.cache,
	MusicDir: directories.cache,
	MovieDir: directories.cache,
	DownloadDir: directories.files,
	DCIMDir: directories.cache,
	SDCardDir: directories.files,
	SDCardApplicationDir: directories.files,
	MainBundleDir: directories.files,
	LibraryDir: directories.files,
};

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const bytesToBase64 = (bytes) => {
	let output = '';
	for (let i = 0; i < bytes.length; i += 3) {
		const a = bytes[i];
		const b = i + 1 < bytes.length ? bytes[i + 1] : NaN;
		const c = i + 2 < bytes.length ? bytes[i + 2] : NaN;
		output += BASE64_CHARS[a >> 2];
		output += BASE64_CHARS[((a & 3) << 4) | (isNaN(b) ? 0 : b >> 4)];
		output += isNaN(b) ? '=' : BASE64_CHARS[((b & 15) << 2) | (isNaN(c) ? 0 : c >> 6)];
		output += isNaN(c) ? '=' : BASE64_CHARS[c & 63];
	}
	return output;
};

const base64ToBytes = (base64) => {
	const clean = base64.replace(/[^A-Za-z0-9+/=]/g, '');
	const size = clean.length / 4 * 3;
	const bytes = new Uint8Array(size);
	let byteIndex = 0;
	for (let i = 0; i < clean.length; i += 4) {
		const e1 = BASE64_CHARS.indexOf(clean[i]);
		const e2 = BASE64_CHARS.indexOf(clean[i + 1]);
		const e3 = BASE64_CHARS.indexOf(clean[i + 2]);
		const e4 = BASE64_CHARS.indexOf(clean[i + 3]);
		if (e1 < 0 || e2 < 0) break;
		bytes[byteIndex++] = (e1 << 2) | (e2 >> 4);
		if (e3 >= 0 && clean[i + 2] !== '=') {
			bytes[byteIndex++] = ((e2 & 15) << 4) | (e3 >> 2);
		}
		if (e4 >= 0 && clean[i + 3] !== '=') {
			bytes[byteIndex++] = ((e3 & 3) << 6) | e4;
		}
	}
	return bytes.subarray(0, byteIndex);
};

const parseHeaders = (rawHeaders) => {
	const headers = {};
	for (const line of (rawHeaders ?? '').split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator > 0) headers[line.substring(0, separator).trim().toLowerCase()] = line.substring(separator + 1).trim();
	}
	return headers;
};

const request = async ({ path, method, url, headers, body }) => {
	// wrap(path) bodies must become the real file contents before sending:
	// JoplinServerApi sets Content-Length from the file size, so sending the
	// URI string would make the server wait for bytes that never arrive
	// (proxy answers 502 Bad Gateway).
	let sendBody = body ?? null;
	const requestHeaders = { ...(headers ?? {}) };
	if (typeof sendBody === 'string' && sendBody.startsWith('RNFetchBlob-file://')) {
		const filePath = sendBody.substring('RNFetchBlob-file://'.length);
		const base64 = await fileSystem.readFile(filePath, 'base64');
		sendBody = base64ToBytes(base64);
		// The network stack computes Content-Length from the actual body; a
		// stale header from the caller would break the upload.
		delete requestHeaders['Content-Length'];
		delete requestHeaders['content-length'];
	}

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		for (const [name, value] of Object.entries(requestHeaders)) {
			xhr.setRequestHeader(name, value);
		}
		if (path) xhr.responseType = 'arraybuffer';

		xhr.onload = async () => {
			let data = xhr.response;
			if (path) {
				const bytes = new Uint8Array(xhr.response);
				await fileSystem.writeFile(path, bytesToBase64(bytes), 'base64');
				data = path;
			}
			const responseHeaders = parseHeaders(xhr.getAllResponseHeaders());
			const text = () => (path ? '' : String(data ?? ''));
			resolve({
				data,
				type: path ? 'path' : 'utf8',
				path: () => data,
				respInfo: { status: xhr.status, headers: responseHeaders },
				info: () => ({ status: xhr.status, headers: responseHeaders }),
				text,
				json: () => JSON.parse(text()),
			});
		};

		xhr.onerror = () => reject(new Error('Network request failed'));
		xhr.ontimeout = () => reject(new Error('Network request timed out'));
		xhr.send(sendBody);
	});
};

const config = (options = {}) => {
	return {
		fetch: (method, url, headers, body) => request({ path: options.path, method, url, headers, body }),
	};
};

const wrap = (path) => `RNFetchBlob-file://${path}`;

const fs = {
	dirs,
	writeFile: (path, content, encoding) => fileSystem.writeFile(path, content, encoding ?? 'utf8'),
	appendFile: (path, content, encoding) => fileSystem.appendFile(path, content, encoding ?? 'utf8'),
	unlink: (path) => fileSystem.unlink(path),
	exists: (path) => fileSystem.exists(path),
	mkdir: (path) => fileSystem.mkdir(path),
};

export default {
	fs,
	dirs,
	config,
	wrap,
};
