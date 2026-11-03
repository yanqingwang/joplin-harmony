import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

// Implemented by harmony/entry/src/main/ets/joplin/JoplinSQLiteModule.ets.
// Rows come back as JSON ({columns, rows}) to keep the bridge payload flat.
export interface Spec extends TurboModule {
	open(name: string): Promise<void>;
	close(name: string): Promise<void>;
	deleteDatabase(name: string): Promise<void>;
	exec(name: string, sql: string, paramsJson: string): Promise<string>;
	selectAll(name: string, sql: string, paramsJson: string): Promise<string>;
	selectOne(name: string, sql: string, paramsJson: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('JoplinSQLite');
