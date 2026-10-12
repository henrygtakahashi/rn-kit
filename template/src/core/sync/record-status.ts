import type { AppExecutor } from '@/core/db/types';
import type { RecordStatusUpdate } from '@/core/sync/outbox';
import { getTableName, sql, type Table } from 'drizzle-orm';

/**
 * Builds the `onRecordStatus` callback for the outbox from the project's syncable
 * tables. Outbox rows name their table in `entity`; every syncable table has the
 * `id` and `sync_status` columns from `syncableColumns()`.
 */
export function createRecordStatusUpdater(tables: readonly Table[]): RecordStatusUpdate {
  const tableNames = new Set(tables.map((table) => getTableName(table)));
  return (executor: AppExecutor, { entity, entityId, status }) => {
    if (!tableNames.has(entity)) return;
    executor.run(
      sql`update ${sql.identifier(entity)} set sync_status = ${status} where id = ${entityId}`
    );
  };
}
