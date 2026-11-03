import FsDriverBase, { ReadDirStatsOptions, Stat } from '@joplin/lib/fs-driver-base';
import { TurboModuleRegistry } from 'react-native';
import tarCreate from './tarCreate';
import tarExtract from './tarExtract';
import JoplinError from '@joplin/lib/JoplinError';
import { resolve } from 'path';

type Encoding = 'utf8' | 'ascii' | 'base64';

interface DirInfo {
	files: string;
	cache: string;
	temp: string;
}

interface NativeStat {
	isDirectory: boolean;
	size: number;
	mtime: number;
	birthtime: number;
	path: string;
	name: string;
}

// Hand-written TurboModule (harmony-shell/.../joplin/JoplinFileSystemModule.ets)
// backed by @kit.CoreFileKit.
interface JoplinFileSystemModule {
	getDirectories(): Promise<string>;
	getDirectoriesSync(): string;
	exists(path: string): Promise<boolean>;
	stat(path: string): Promise<string>;
	readDir(path: string): Promise<string>;
	mkdir(path: string): Promise<void>;
	unlink(path: string): Promise<void>;
	moveFile(source: string, dest: string): Promise<void>;
	copyFile(source: string, dest: string): Promise<void>;
	readFile(path: string, encoding: string): Promise<string>;
	read(path: string, offset: number, length: number, encoding: string): Promise<string>;
	writeFile(path: string, content: string, encoding: string): Promise<void>;
	appendFile(path: string, content: string, encoding: string): Promise<void>;
	hash(path: string, algorithm: string): Promise<string>;
}

const getModule = () => TurboModuleRegistry.getEnforcing<JoplinFileSystemModule>('JoplinFileSystem');

const normalizeEncoding = (encoding: string): Encoding => {
	encoding = encoding.toLowerCase();
	if (encoding === 'utf-8') encoding = 'utf8';
	if (!['utf8', 'ascii', 'base64'].includes(encoding)) throw new Error(`Unsupported encoding: ${encoding}.`);
	return encoding as Encoding;
};

const toStat = (nativeStat: NativeStat): Stat => {
	return {
		birthtime: new Date(nativeStat.birthtime),
		mtime: new Date(nativeStat.mtime),
		path: nativeStat.path,
		size: nativeStat.size,
		isDirectory: () => nativeStat.isDirectory,
	};
};

export default class FsDriverRNHarmony extends FsDriverBase {
	private directories_: DirInfo = null;

	// Sync because FsDriverBase.getAppDirectoryPath/getCacheDirectoryPath are
	// sync and used as such by callers such as getProfilesRootDir.
	private directoriesSync() {
		if (!this.directories_) {
			this.directories_ = JSON.parse(getModule().getDirectoriesSync()) as DirInfo;
		}
		return this.directories_;
	}

	public async stat(path: string) {
		const json = await getModule().stat(path);
		if (!json) return null;
		return toStat(JSON.parse(json) as NativeStat);
	}

	public async readFile(path: string, encoding = 'utf8') {
		return getModule().readFile(path, normalizeEncoding(encoding));
	}

	public async writeFile(path: string, content: string, encoding = 'base64') {
		await getModule().writeFile(path, content, normalizeEncoding(encoding));
	}

	public async appendFile(path: string, content: string, encoding = 'base64') {
		await getModule().appendFile(path, content, normalizeEncoding(encoding));
	}

	public async copy(source: string, dest: string) {
		await getModule().copyFile(source, dest);
	}

	public async mkdir(path: string) {
		await getModule().mkdir(path);
	}

	public async unlink(path: string) {
		await getModule().unlink(path);
	}

	// Same as rm -rf; unlink already removes directories recursively.
	public async remove(path: string) {
		await this.unlink(path);
	}

	public async move(source: string, dest: string) {
		await getModule().moveFile(source, dest);
	}

	public async rename(source: string, dest: string) {
		await getModule().moveFile(source, dest);
	}

	public async exists(path: string) {
		return getModule().exists(path);
	}

	public async readDirStats(path: string, options: ReadDirStatsOptions = { recursive: false }) {
		const entries = JSON.parse(await getModule().readDir(path)) as NativeStat[];
		const output: Stat[] = [];
		for (const entry of entries) {
			const stat = toStat(entry);
			stat.path = entry.name;
			output.push(stat);
			await this.readDirStatsHandleRecursion_(path, stat, output, options);
		}
		return output;
	}

	public async open(path: string) {
		const stat = await this.stat(path);
		return {
			path: path,
			offset: 0,
			mode: 'r',
			stat: stat,
		};
	}

	public close() {
		return null;
	}

	public async readFileChunk(handle: { path: string; offset: number; stat: { size: number } | null }, length: number, encoding = 'base64') {
		if (!handle?.stat) {
			throw new JoplinError('File does not exist (reading file chunk).', 'ENOENT');
		}

		if (handle.offset + length > handle.stat.size) {
			length = handle.stat.size - handle.offset;
		}
		if (!length) return null;

		const output = await getModule().read(handle.path, handle.offset, length, normalizeEncoding(encoding));
		// eslint-disable-next-line require-atomic-updates
		handle.offset += length;
		return output ? output : null;
	}

	public resolve(...paths: string[]) {
		return resolve(...paths);
	}

	public async md5File(path: string) {
		return getModule().hash(path, 'md5');
	}

	public async setTimestamp() {
		// HarmonyOS has no portable way to set mtime through fileIo.
	}

	public async tarExtract(options: Omit<Parameters<typeof tarExtract>[0], 'cwd'> & { cwd?: string }) {
		await tarExtract({ cwd: this.getAppDirectoryPath(), ...options });
	}

	public async tarCreate(options: Omit<Parameters<typeof tarCreate>[0], 'cwd'> & { cwd?: string }, filePaths: string[]) {
		await tarCreate({ cwd: this.getAppDirectoryPath(), ...options }, filePaths);
	}

	public async getExternalDirectoryPath(): Promise<string | undefined> {
		return this.directoriesSync().files;
	}

	public getCacheDirectoryPath() {
		return this.directoriesSync().cache;
	}

	public getAppDirectoryPath() {
		return this.directoriesSync().files;
	}

	public isUsingAndroidSAF() {
		return false;
	}
}
