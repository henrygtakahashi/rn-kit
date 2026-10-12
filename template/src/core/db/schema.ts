// Project tables. Spread `syncableColumns()` from sync-schema.ts into every table
// that syncs, and register the table in src/core/sync/syncable-tables.ts.
//
// Example:
//   export const items = sqliteTable('items', {
//     ...syncableColumns(),
//     name: text('name').notNull(),
//   });
export {};
