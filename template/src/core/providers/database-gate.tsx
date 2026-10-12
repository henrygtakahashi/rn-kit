import { MigrationRunner } from '@/core/providers/migration-runner';
import { useState, type ReactNode } from 'react';

type DatabaseGateProps = {
  children: ReactNode;
  loading: ReactNode;
  renderError: (retry: () => void) => ReactNode;
};

// Applies migrations before any screen reads. Providers cannot render shared/ui,
// so the root layout passes the loading and error views in.
export function DatabaseGate({ children, loading, renderError }: DatabaseGateProps) {
  const [attempt, setAttempt] = useState(0);
  const retry = () => setAttempt((current) => current + 1);
  return (
    <MigrationRunner key={attempt} loading={loading} error={renderError(retry)}>
      {children}
    </MigrationRunner>
  );
}
