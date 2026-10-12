import { SYNC_STATUSES } from '@/shared/types/sync';
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Tables and columns the sync engine needs. Project tables live in schema.ts and
// spread `syncableColumns()` into every table that syncs.

/**
 * Columns every syncable table carries (AGENTS.md, "Data rules"). The sync
 * engine updates `sync_status` by `id`, so keep these names.
 */
export const syncableColumns = () => ({
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
  syncStatus: text('sync_status', { enum: SYNC_STATUSES }).notNull().default('pending'),
});

export const OUTBOX_OPERATIONS = ['create', 'update', 'delete'] as const;
export const OUTBOX_STATUSES = ['pending', 'failed'] as const;

export const outbox = sqliteTable(
  'outbox',
  {
    // UUID v7, so ordering by id is ordering by creation.
    id: text('id').primaryKey(),
    // The name of the table the operation applies to.
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    operation: text('operation', { enum: OUTBOX_OPERATIONS }).notNull(),
    payload: text('payload').notNull(),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    status: text('status', { enum: OUTBOX_STATUSES }).notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    nextAttemptAt: integer('next_attempt_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`0`),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('outbox_status_idx').on(table.status, table.id)]
);

export const syncState = sqliteTable('sync_state', {
  // One row per entity; the cursor is issued by the server, never a device clock.
  entity: text('entity').primaryKey(),
  cursor: text('cursor'),
});

export type OutboxRow = typeof outbox.$inferSelect;
export type OutboxOperation = (typeof OUTBOX_OPERATIONS)[number];
