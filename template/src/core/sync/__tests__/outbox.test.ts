import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { createTestDatabase } from '@/core/db/__tests__/test-database';
import { outbox } from '@/core/db/sync-schema';
import type { AppDatabase } from '@/core/db/types';
import { getRetryDelay, MAX_SEND_ATTEMPTS } from '@/core/sync/backoff';
import {
  enqueueOperation,
  processOutbox,
  retryFailedOperations,
  type RecordStatusUpdate,
} from '@/core/sync/outbox';
import type { OutgoingOperation, SyncTransport } from '@/core/sync/transport';
import type { SyncStatus } from '@/shared/types/sync';
import { eq } from 'drizzle-orm';

const START = new Date('2026-10-01T10:00:00Z');
const ENTITY = 'items';

function enqueue(db: AppDatabase, entityId: string) {
  enqueueOperation(db, {
    entity: ENTITY,
    entityId,
    operation: 'create',
    payload: { id: entityId },
    now: START,
  });
}

function recordingTransport(failWhen: (operation: OutgoingOperation) => boolean = () => false) {
  const sent: OutgoingOperation[] = [];
  const transport: SyncTransport = {
    send: async (operation) => {
      sent.push(operation);
      if (failWhen(operation)) throw new Error('offline');
    },
  };
  return { sent, transport };
}

// Records the last status reported for each record instead of writing a table.
function recordingStatusUpdate() {
  const statuses = new Map<string, SyncStatus>();
  const update: RecordStatusUpdate = (_executor, { entity, entityId, status }) => {
    statuses.set(`${entity}:${entityId}`, status);
  };
  return { statuses, update };
}

describe('getRetryDelay', () => {
  it('doubles each attempt and stops at the cap', () => {
    assert.equal(getRetryDelay(1), 2_000);
    assert.equal(getRetryDelay(2), 4_000);
    assert.equal(getRetryDelay(30), 5 * 60_000);
  });
});

describe('processOutbox', () => {
  let db: AppDatabase;
  let now: Date;
  let status: ReturnType<typeof recordingStatusUpdate>;

  beforeEach(() => {
    db = createTestDatabase().db;
    now = START;
    status = recordingStatusUpdate();
  });

  const run = (transport: SyncTransport) =>
    processOutbox({ db, transport, now: () => now, onRecordStatus: status.update });

  it('sends in order, empties the queue, and marks records synced', async () => {
    enqueue(db, 'a');
    enqueue(db, 'b');
    const { sent, transport } = recordingTransport();

    const result = await run(transport);

    assert.deepEqual(
      sent.map((operation) => operation.entityId),
      ['a', 'b']
    );
    assert.equal(result.sent, 2);
    assert.equal(db.select().from(outbox).all().length, 0);
    assert.equal(status.statuses.get(`${ENTITY}:a`), 'synced');
  });

  it('stops at the first failure and backs off without sending later operations', async () => {
    enqueue(db, 'a');
    enqueue(db, 'b');
    const { sent, transport } = recordingTransport((operation) => operation.entityId === 'a');

    const result = await run(transport);
    const failed = db.select().from(outbox).where(eq(outbox.entityId, 'a')).get();

    assert.equal(result.deferred, true);
    assert.deepEqual(
      sent.map((operation) => operation.entityId),
      ['a']
    );
    assert.equal(failed?.attempts, 1);
    assert.equal(failed?.nextAttemptAt.getTime(), START.getTime() + getRetryDelay(1));

    // Not due yet: nothing is sent, and "b" does not overtake "a".
    const second = await run(transport);
    assert.equal(second.sent, 0);
    assert.equal(sent.length, 1);
  });

  it('resends with the same idempotency key', async () => {
    enqueue(db, 'a');
    let shouldFail = true;
    const { sent, transport } = recordingTransport(() => shouldFail);

    await run(transport);
    shouldFail = false;
    now = new Date(START.getTime() + getRetryDelay(1));
    await run(transport);

    assert.equal(sent.length, 2);
    assert.equal(sent[0]?.idempotencyKey, sent[1]?.idempotencyKey);
  });

  it('marks the operation and the record failed after the limit, and retry requeues them', async () => {
    enqueue(db, 'a');
    const { transport } = recordingTransport(() => true);

    for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
      await run(transport);
      now = new Date(now.getTime() + getRetryDelay(attempt));
    }

    const [failed] = db.select().from(outbox).all();
    assert.equal(failed?.status, 'failed');
    assert.equal(status.statuses.get(`${ENTITY}:a`), 'failed');

    retryFailedOperations(db, [failed?.id ?? ''], status.update);
    const [requeued] = db.select().from(outbox).all();
    assert.equal(requeued?.status, 'pending');
    assert.equal(requeued?.attempts, 0);
    assert.equal(status.statuses.get(`${ENTITY}:a`), 'pending');
  });

  it('never sends past a failed operation until it is retried', async () => {
    enqueue(db, 'a');
    db.update(outbox).set({ status: 'failed' }).where(eq(outbox.entityId, 'a')).run();
    enqueue(db, 'b');
    const { sent, transport } = recordingTransport();

    const result = await run(transport);

    assert.equal(result.sent, 0);
    assert.equal(sent.length, 0);
  });
});
