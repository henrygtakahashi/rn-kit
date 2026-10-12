import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

// Each app has its own sandbox, so one fixed file name is enough.
const DATABASE_NAME = 'app.db';

// The change listener powers Drizzle's useLiveQuery.
const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export const db = drizzle(sqlite);
