import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

// Implemented by harmony/entry/src/main/ets/joplin/JoplinFileSystemModule.ets.
// Structured results are JSON strings so the codegen surface stays primitive.
export interface Spec extends TurboModule {
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

export default TurboModuleRegistry.getEnforcing<Spec>('JoplinFileSystem');
