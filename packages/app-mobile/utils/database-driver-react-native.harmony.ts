import DatabaseDriver, { DatabaseCloseOptions, DatabaseOpenOptions, SqlSelectParams } from '@joplin/lib/database-driver';
import { TurboModuleRegistry } from 'react-native';

// Hand-written TurboModule (harmony-shell/.../joplin/JoplinSQLiteModule.ets)
// that wraps @ohos.data.relationalStore. It returns rows as column arrays so
// the bridge only ever transports JSON.
interface QueryPayload {
	columns: string[];
	rows: unknown[][];
}

interface ExecPayload {
	lastInsertRowId: number;
	changes: number;
}

interface JoplinSQLiteModule {
	open(name: string): Promise<void>;
	close(name: string): Promise<void>;
	deleteDatabase(name: string): Promise<void>;
	exec(name: string, sql: string, paramsJson: string): Promise<string>;
	selectAll(name: string, sql: string, paramsJson: string): Promise<string>;
	selectOne(name: string, sql: string, paramsJson: string): Promise<string>;
}

const getModule = () => TurboModuleRegistry.getEnforcing<JoplinSQLiteModule>('JoplinSQLite');

const serializeParams = (params: SqlSelectParams) => {
	return JSON.stringify((params ?? []).map(param => {
		if (param instanceof Uint8Array) return Array.from(param);
		return param;
	}));
};

const rowsToObjects = (payload: QueryPayload) => {
	return payload.rows.map(row => {
		const result: Record<string, unknown> = {};
		for (let i = 0; i < payload.columns.length; i++) {
			result[payload.columns[i]] = row[i];
		}
		return result;
	});
};

export default class DatabaseDriverHarmony implements DatabaseDriver {
	private dbName_ = '';
	private lastInsertId_: string = null;

	public async open(options: DatabaseOpenOptions) {
		this.dbName_ = options.name;
		await getModule().open(options.name);
	}

	public async deleteDatabase(options: DatabaseCloseOptions) {
		await getModule().deleteDatabase(options.name);
	}

	public async selectOne(sql: string, params: SqlSelectParams = []) {
		const payload = JSON.parse(await getModule().selectOne(this.dbName_, sql, serializeParams(params))) as QueryPayload;
		const rows = rowsToObjects(payload);
		return rows.length ? rows[0] : undefined;
	}

	public async selectAll(sql: string, params: SqlSelectParams = []) {
		const payload = JSON.parse(await getModule().selectAll(this.dbName_, sql, serializeParams(params))) as QueryPayload;
		return rowsToObjects(payload);
	}

	public async exec(sql: string, params: SqlSelectParams = []) {
		const result = JSON.parse(await getModule().exec(this.dbName_, sql, serializeParams(params))) as ExecPayload;
		if (result.lastInsertRowId) {
			this.lastInsertId_ = String(result.lastInsertRowId);
		}
	}

	public lastInsertId() {
		return this.lastInsertId_;
	}

	public loadExtension(path: string) {
		throw new Error(`No extension support for ${path} on HarmonyOS`);
	}

	public close() {
		return getModule().close(this.dbName_);
	}

	public sqliteErrorToJsError(error: Error) {
		return error;
	}
}
