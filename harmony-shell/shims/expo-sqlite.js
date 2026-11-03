// HarmonyOS shim for expo-sqlite. Routes all database operations through the
// JoplinSQLite TurboModule backed by @ohos.data.relationalStore.
import { TurboModuleRegistry } from 'react-native';

const sqlite = TurboModuleRegistry.get('JoplinSQLite');

class SQLiteDatabase {
	constructor(name) {
		this.name = name;
	}

	async execAsync(sql) {
		await sqlite.exec(this.name, sql, '[]');
	}

	async runAsync(sql, params = []) {
		const result = JSON.parse(await sqlite.exec(this.name, sql, JSON.stringify(params || [])));
		return {
			lastInsertRowId: result.lastInsertRowId || 0,
			changes: result.changes || 0,
		};
	}

	async getFirstAsync(sql, params = []) {
		const raw = await sqlite.selectOne(this.name, sql, JSON.stringify(params || []));
		const result = JSON.parse(raw);
		if (result.rows.length === 0) return null;
		const row = result.rows[0];
		const obj = {};
		for (let i = 0; i < result.columns.length; i++) {
			obj[result.columns[i]] = row[i];
		}
		return obj;
	}

	async getAllAsync(sql, params = []) {
		const raw = await sqlite.selectAll(this.name, sql, JSON.stringify(params || []));
		const result = JSON.parse(raw);
		const output = [];
		for (const row of result.rows) {
			const obj = {};
			for (let i = 0; i < result.columns.length; i++) {
				obj[result.columns[i]] = row[i];
			}
			output.push(obj);
		}
		return output;
	}

	async closeAsync() {
		await sqlite.close(this.name);
	}
}

const openDatabaseAsync = async (name, options, directory) => {
	await sqlite.open(name);
	return new SQLiteDatabase(name);
};

const deleteDatabaseAsync = async (name, directory) => {
	await sqlite.deleteDatabase(name);
};

export { openDatabaseAsync, deleteDatabaseAsync, SQLiteDatabase };
export default { openDatabaseAsync, deleteDatabaseAsync };
