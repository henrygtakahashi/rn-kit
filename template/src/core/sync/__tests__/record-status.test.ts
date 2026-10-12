import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTestDatabase } from '@/core/db/__tests__/test-database';
import { syncableColumns } from '@/core/db/sync-schema';
import { createRecordStatusUpdater } from '@/core/sync/record-status';
import { eq } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// A table defined only for this test, created with plain SQL.
const items = sqliteTable('items', { ...syncableColumns(), name: text('name').notNull() });

function setup() {
  const { db, sqlite } = createTestDatabase();
  sqlite.exec(`create table items (
    id text primary key, created_at integer not null, updated_at integer not null,
    deleted_at integer, sync_status text not null default 'pending', name text not null)`);
  const now = new Date('2026-10-01T10:00:00Z');
  db.insert(items).values({ id: 'a', name: 'A', createdAt: now, updatedAt: now }).run();
  return db;
}

describe('createRecordStatusUpdater', () => {
  it('updates sync_status on a registered table', () => {
    const db = setup();
    const update = createRecordStatusUpdater([items]);

    update(db, { entity: 'items', entityId: 'a', status: 'synced' });

    assert.equal(db.select().from(items).where(eq(items.id, 'a')).get()?.syncStatus, 'synced');
  });

  it('ignores entities that are not registered', () => {
    const db = setup();
    const update = createRecordStatusUpdater([]);

    update(db, { entity: 'items', entityId: 'a', status: 'failed' });

    assert.equal(db.select().from(items).where(eq(items.id, 'a')).get()?.syncStatus, 'pending');
  });
});
