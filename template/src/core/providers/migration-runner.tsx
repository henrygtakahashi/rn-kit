import { useDatabaseMigrations } from '@/core/providers/use-database-migrations';
import type { ReactNode } from 'react';

type MigrationRunnerProps = {
  children: ReactNode;
  loading: ReactNode;
  error: ReactNode;
};

export function MigrationRunner({ children, loading, error }: MigrationRunnerProps) {
  const status = useDatabaseMigrations();
  if (status === 'error') return error;
  if (status === 'migrating') return loading;
  return children;
}
