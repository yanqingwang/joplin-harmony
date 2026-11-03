/**
 * SQLite TurboModule backed by @ohos.data.relationalStore.
 *
 * Rows are returned as { columns, rows } so the JavaScript side does the
 * object mapping: it keeps ArkTS out of dynamic object construction and makes
 * the bridge payload a single JSON string.
 */

import { AnyThreadTurboModule, AnyThreadTurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { relationalStore } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';

type BindValue = number | string | boolean | null | Uint8Array;

interface QueryResult {
  columns: string[];
  rows: Object[][];
}

interface ExecResult {
  lastInsertRowId: number;
  changes: number;
}

export class JoplinSQLiteModule extends AnyThreadTurboModule {
  public static readonly NAME = 'JoplinSQLite';

  private stores: Map<string, relationalStore.RdbStore> = new Map();

  public constructor(ctx: AnyThreadTurboModuleContext) {
    super(ctx);
  }

  private getStore(name: string): Promise<relationalStore.RdbStore> {
    const existing = this.stores.get(name);
    if (existing) {
      return Promise.resolve(existing);
    }
    const config: relationalStore.StoreConfig = {
      name: name,
      securityLevel: relationalStore.SecurityLevel.S1,
    };
    const context = this.ctx.uiAbilityContext as common.UIAbilityContext;
    return relationalStore.getRdbStore(context, config).then((store: relationalStore.RdbStore) => {
      this.stores.set(name, store);
      return store;
    });
  }

  private toBindArgs(paramsJson: string): relationalStore.ValueType[] {
    const parsed: Object[] = JSON.parse(paramsJson || '[]') as Object[];
    const args: relationalStore.ValueType[] = [];
    for (const value of parsed) {
      if (typeof value === 'boolean') {
        args.push(value ? 1 : 0);
      } else {
        args.push(value as relationalStore.ValueType);
      }
    }
    return args;
  }

  private async readRows(store: relationalStore.RdbStore, sql: string, args: relationalStore.ValueType[]): Promise<QueryResult> {
    const resultSet = await store.querySql(sql, args);
    try {
      const columns: string[] = resultSet.columnNames;
      const rows: Object[][] = [];
      while (resultSet.goToNextRow()) {
        const row: Object[] = [];
        for (let i = 0; i < columns.length; i++) {
          row.push(resultSet.getValue(i) as Object);
        }
        rows.push(row);
      }
      const result: QueryResult = { columns: columns, rows: rows };
      return result;
    } finally {
      resultSet.close();
    }
  }

  public async open(name: string): Promise<void> {
    await this.getStore(name);
  }

  public async close(name: string): Promise<void> {
    const store = this.stores.get(name);
    if (store) {
      this.stores.delete(name);
      await store.close();
    }
  }

  public async deleteDatabase(name: string): Promise<void> {
    await this.close(name);
    const context = this.ctx.uiAbilityContext as common.UIAbilityContext;
    await relationalStore.deleteRdbStore(context, name);
  }

  public async exec(name: string, sql: string, paramsJson: string): Promise<string> {
    const store = await this.getStore(name);
    const normalized = sql.trim().toUpperCase();
    const noChange: ExecResult = { lastInsertRowId: 0, changes: 0 };

    // relationalStore drives transactions itself, so Joplin's explicit
    // transaction statements are routed to the store API instead of SQL.
    if (normalized === 'BEGIN' || normalized.startsWith('BEGIN ')) {
      await store.beginTransaction();
      return JSON.stringify(noChange);
    }
    if (normalized === 'COMMIT' || normalized.startsWith('COMMIT ')) {
      await store.commit();
      return JSON.stringify(noChange);
    }
    if (normalized === 'ROLLBACK' || normalized.startsWith('ROLLBACK ')) {
      await store.rollBack();
      return JSON.stringify(noChange);
    }
    // Pragmas are connection tuning; relationalStore does not accept them.
    if (normalized.startsWith('PRAGMA')) {
      return JSON.stringify(noChange);
    }

    await store.executeSql(sql, this.toBindArgs(paramsJson));

    const stats = await this.readRows(store, 'SELECT changes() AS changes, last_insert_rowid() AS lastInsertRowId', []);
    const first = stats.rows.length > 0 ? stats.rows[0] : [];
    const result: ExecResult = {
      changes: typeof first[0] === 'number' ? first[0] as number : 0,
      lastInsertRowId: typeof first[1] === 'number' ? first[1] as number : 0,
    };
    return JSON.stringify(result);
  }

  public async selectAll(name: string, sql: string, paramsJson: string): Promise<string> {
    const store = await this.getStore(name);
    const result = await this.readRows(store, sql, this.toBindArgs(paramsJson));
    return JSON.stringify(result);
  }

  public async selectOne(name: string, sql: string, paramsJson: string): Promise<string> {
    const store = await this.getStore(name);
    const result = await this.readRows(store, sql, this.toBindArgs(paramsJson));
    const limited: QueryResult = {
      columns: result.columns,
      rows: result.rows.slice(0, 1),
    };
    return JSON.stringify(limited);
  }
}
