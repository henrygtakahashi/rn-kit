// Without a monitoring service, errors stay in a small in-memory buffer and go
// to any reporter registered later. `console` is not used (AGENTS.md, "Errors").

type ErrorContext = Record<string, string | number | boolean | undefined>;

export type CapturedError = {
  error: unknown;
  context: ErrorContext;
  capturedAt: number;
};

type Reporter = (captured: CapturedError) => void;

const MAX_BUFFERED_ERRORS = 50;

const buffer: CapturedError[] = [];
const reporters = new Set<Reporter>();

export function captureError(error: unknown, context: ErrorContext = {}) {
  const captured = { error, context, capturedAt: Date.now() };
  buffer.push(captured);
  if (buffer.length > MAX_BUFFERED_ERRORS) buffer.shift();
  reporters.forEach((report) => report(captured));
}

export function addErrorReporter(reporter: Reporter) {
  reporters.add(reporter);
  return () => {
    reporters.delete(reporter);
  };
}

export function getRecentErrors(): readonly CapturedError[] {
  return [...buffer];
}
