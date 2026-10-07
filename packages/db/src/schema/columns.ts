import { timestamp } from "drizzle-orm/pg-core";

// Spread into every table. Both have SQL defaults; `updated_at` is kept current by a `<table>_updated_at`
// trigger that the table's own migration creates (see the `star_wars` migration)
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
};
