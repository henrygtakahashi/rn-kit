import { createRecordStatusUpdater } from '@/core/sync/record-status';

// Every table whose records go through the outbox. Add each syncable table from
// schema.ts here; its outbox rows use the table name as `entity`.
export const updateRecordSyncStatus = createRecordStatusUpdater([]);
