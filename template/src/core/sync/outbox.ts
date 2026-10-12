import { outbox, type OutboxOperation } from '@/core/db/sync-schema';
import type { AppExecutor } from '@/core/db/types';
import { getRetryDelay, MAX_SEND_ATTEMPTS } from '@/core/sync/backoff';
import type { SyncTransport } from '@/core/sync/transport';
import { captureError } from '@/core/monitoring/monitoring';
import type { SyncStatus } from '@/shared/types/sync';
import { createId } from '@/shared/utils/id';
import { and, asc, eq, inArray } from 'drizzle-orm';

type EnqueueInput = {
  entity: string;
  entityId: string;
  operation: OutboxOperation;
  payload: unknown;
  now: Date;
};

// Call inside the same transaction as the local change.
export function enqueueOperation(executor: AppExecutor, input: EnqueueInput) {
  executor
    .insert(outbox)
    .values({
      id: createId(),
      entity: input.entity,
      entityId: input.entityId,
      operation: input.operation,
      payload: JSON.stringify(input.payload),
      idempotencyKey: createId(),
      createdAt: input.now,
    })
    .run();
}

export type RecordStatusUpdate = (
  executor: AppExecutor,
  update: { entity: string; entityId: string; status: SyncStatus }
) => void;

type ProcessOptions = {
  db: AppExecutor & { transaction: <T>(run: (tx: AppExecutor) => T) => T };
  transport: SyncTransport;
  now: () => Date;
  onRecordStatus: RecordStatusUpdate;
};

export type ProcessResult = { sent: number; failed: number; deferred: boolean };

// Sends operations strictly in order. A failed or not-yet-due operation blocks
// every later one, so no change ever overtakes an earlier change.
export async function processOutbox({ db, transport, now, onRecordStatus }: ProcessOptions) {
  const result: ProcessResult = { sent: 0, failed: 0, deferred: false };
  const queue = db.select().from(outbox).orderBy(asc(outbox.id)).all();

  for (const row of queue) {
    if (row.status === 'failed') return result;
    if (row.nextAttemptAt.getTime() > now().getTime()) {
      result.deferred = true;
      return result;
    }
    try {
      await transport.send({
        entity: row.entity,
        entityId: row.entityId,
        operation: row.operation,
        payload: JSON.parse(row.payload),
        idempotencyKey: row.idempotencyKey,
      });
    } catch (error) {
      captureError(error, { area: 'sync', operationId: row.id });
      const attempts = row.attempts + 1;
      const hasFailed = attempts >= MAX_SEND_ATTEMPTS;
      db.transaction((tx) => {
        tx.update(outbox)
          .set({
            attempts,
            status: hasFailed ? 'failed' : 'pending',
            nextAttemptAt: new Date(now().getTime() + getRetryDelay(attempts)),
          })
          .where(eq(outbox.id, row.id))
          .run();
        if (hasFailed) onRecordStatus(tx, { entity: row.entity, entityId: row.entityId, status: 'failed' });
      });
      if (hasFailed) result.failed += 1;
      else result.deferred = true;
      return result;
    }

    db.transaction((tx) => {
      tx.delete(outbox).where(eq(outbox.id, row.id)).run();
      const remaining = tx
        .select({ id: outbox.id })
        .from(outbox)
        .where(and(eq(outbox.entity, row.entity), eq(outbox.entityId, row.entityId)))
        .all();
      if (remaining.length === 0) {
        onRecordStatus(tx, { entity: row.entity, entityId: row.entityId, status: 'synced' });
      }
    });
    result.sent += 1;
  }
  return result;
}

// Manual retry after the attempt limit: the operations go back to the queue.
export function retryFailedOperations(
  db: ProcessOptions['db'],
  ids: string[],
  onRecordStatus: RecordStatusUpdate
) {
  if (ids.length === 0) return;
  db.transaction((tx) => {
    const rows = tx.select().from(outbox).where(inArray(outbox.id, ids)).all();
    tx.update(outbox)
      .set({ status: 'pending', attempts: 0, nextAttemptAt: new Date(0) })
      .where(inArray(outbox.id, ids))
      .run();
    rows.forEach((row) =>
      onRecordStatus(tx, { entity: row.entity, entityId: row.entityId, status: 'pending' })
    );
  });
}
