// An expo-sqlite stand-in over node:sqlite, so the real Drizzle Expo driver and
// the real migrations run in Node tests.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { AppDatabase } from '@/core/db/types';
import { drizzle } from 'drizzle-orm/expo-sqlite/driver';

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '..', 'migrations');

type Journal = { entries: { tag: string }[] };

function createExpoSqliteStandIn(database: DatabaseSync) {
  return {
    prepareSync(sql: string) {
      const statement = database.prepare(sql);
      const isReader = statement.columns().length > 0;
      return {
        executeSync(params: SQLInputValue[] = []) {
          if (isReader) {
            const rows = statement.all(...params);
            return { changes: 0, lastInsertRowId: 0, getAllSync: () => rows, getFirstSync: () => rows[0] ?? null };
          }
          const result = statement.run(...params);
          return {
            changes: Number(result.changes),
            lastInsertRowId: Number(result.lastInsertRowid),
            getAllSync: () => [],
            getFirstSync: () => null,
          };
        },
        executeForRawResultSync(params: SQLInputValue[] = []) {
          statement.setReturnArrays(true);
          const rows = statement.all(...params);
          statement.setReturnArrays(false);
          return { getAllSync: () => rows };
        },
      };
    },
  };
}

function applyMigrations(database: DatabaseSync) {
  const journal: Journal = JSON.parse(
    readFileSync(path.join(MIGRATIONS_DIR, 'meta', '_journal.json'), 'utf8')
  );
  for (const entry of journal.entries) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, `${entry.tag}.sql`), 'utf8');
    sql.split('--> statement-breakpoint').forEach((statement) => database.exec(statement));
  }
}

export function createTestDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  applyMigrations(sqlite);
  // The stand-in implements only the part of expo-sqlite that Drizzle calls.
  const db = drizzle(createExpoSqliteStandIn(sqlite) as never) as unknown as AppDatabase;
  return { db, sqlite };
}
