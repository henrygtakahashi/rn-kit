import { v7 } from 'uuid';

// UUID v7 sorts by creation time, so ids created offline keep their order.
export function createId() {
  return v7();
}
