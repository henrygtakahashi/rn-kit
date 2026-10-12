const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 5 * 60_000;

export const MAX_SEND_ATTEMPTS = 8;

// Exponential backoff with a cap: 2 s, 4 s, 8 s ... up to 5 minutes.
export function getRetryDelay(attempts: number) {
  const exponent = Math.max(0, attempts - 1);
  return Math.min(BASE_DELAY_MS * 2 ** exponent, MAX_DELAY_MS);
}
