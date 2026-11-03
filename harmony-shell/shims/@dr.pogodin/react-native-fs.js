// HarmonyOS shim for @dr.pogodin/react-native-fs. Routes all file operations
// through the JoplinFileSystem TurboModule backed by @kit.CoreFileKit.
import { TurboModuleRegistry } from 'react-native';

const fs = TurboModuleRegistry.get('JoplinFileSystem');

const dirs = fs
	? JSON.parse(fs.getDirectoriesSync())
	: { files: '', cache: '', temp: '' };

const DocumentDirectoryPath = dirs.files;
const CachesDirectoryPath = dirs.cache;
const TemporaryDirectoryPath = dirs.temp;
const ExternalDirectoryPath = dirs.files;
const LibraryDirectoryPath = dirs.files;
const MainBundlePath = dirs.files;

const normalizeEncoding = (encoding) => {
	if (!encoding) return 'utf8';
	const e = encoding.toLowerCase();
	if (e === 'utf-8') return 'utf8';
	return e;
};

const RNFS = {
	DocumentDirectoryPath,
	CachesDirectoryPath,
	TemporaryDirectoryPath,
	ExternalDirectoryPath,
	LibraryDirectoryPath,
	MainBundlePath,

	readFile: async (path, encoding) => {
		return fs.readFile(path, normalizeEncoding(encoding));
	},

	writeFile: async (path, content, encoding) => {
		return fs.writeFile(path, content, normalizeEncoding(encoding));
	},

	appendFile: async (path, content, encoding) => {
		return fs.appendFile(path, content, normalizeEncoding(encoding));
	},

	exists: async (path) => {
		return fs.exists(path);
	},

	mkdir: async (path) => {
		return fs.mkdir(path);
	},

	unlink: async (path) => {
		return fs.unlink(path);
	},

	moveFile: async (source, dest) => {
		return fs.moveFile(source, dest);
	},

	copyFile: async (source, dest) => {
		return fs.copyFile(source, dest);
	},

	stat: async (path) => {
		const raw = await fs.stat(path);
		if (!raw) throw new Error(`File does not exist: ${path}`);
		const s = JSON.parse(raw);
		return {
			path: s.path,
			size: s.size,
			mtime: new Date(s.mtime),
			birthtime: new Date(s.birthtime),
			isDirectory: () => s.isDirectory,
			isFile: () => !s.isDirectory,
		};
	},

	readDir: async (path) => {
		const raw = await fs.readDir(path);
		const entries = JSON.parse(raw);
		return entries.map((e) => ({
			path: e.path,
			name: e.name,
			size: e.size,
			mtime: new Date(e.mtime),
			birthtime: new Date(e.birthtime),
			isDirectory: () => e.isDirectory,
			isFile: () => !e.isDirectory,
		}));
	},

	read: async (path, length, offset, encoding) => {
		return fs.read(path, offset, length, normalizeEncoding(encoding));
	},

	hash: async (path, algorithm) => {
		return fs.hash(path, algorithm);
	},
};

export default RNFS;