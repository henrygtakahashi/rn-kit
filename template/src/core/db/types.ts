import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export type AppDatabase = ExpoSQLiteDatabase;

// Repositories and the sync engine accept a database or an open transaction.
export type AppExecutor = Pick<AppDatabase, 'select' | 'insert' | 'update' | 'delete' | 'run'>;
