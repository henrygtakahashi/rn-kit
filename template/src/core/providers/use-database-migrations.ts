import { db } from '@/core/db/client';
import migrations from '@/core/db/migrations/migrations';
import { captureError } from '@/core/monitoring/monitoring';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect } from 'react';

export type DatabaseStatus = 'migrating' | 'ready' | 'error';

// Providers cannot render shared/ui, so the root layout renders these states.
export function useDatabaseMigrations(): DatabaseStatus {
  const { success, error } = useMigrations(db, migrations);

  // Reports to monitoring, an external system.
  useEffect(() => {
    if (error) captureError(error, { area: 'migrations' });
  }, [error]);

  if (error) return 'error';
  return success ? 'ready' : 'migrating';
}
