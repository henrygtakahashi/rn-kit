export const SYNC_STATUSES = ['pending', 'synced', 'failed'] as const;

export type SyncStatus = (typeof SYNC_STATUSES)[number];
