import type { OutboxOperation } from '@/core/db/sync-schema';

export type OutgoingOperation = {
  entity: string;
  entityId: string;
  operation: OutboxOperation;
  payload: unknown;
  idempotencyKey: string;
};

// The server is unknown, so sync talks to it only through this interface.
// `send` resolves when the server confirmed the operation and rejects otherwise.
export type SyncTransport = {
  send: (operation: OutgoingOperation) => Promise<void>;
};
