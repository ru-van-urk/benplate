import { timestamp } from "drizzle-orm/pg-core";

// Spread into every table. Both have SQL defaults; `updated_at` is kept current by a trigger that each
// table's migration creates (see the `planets_updated_at` migration)
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
};
