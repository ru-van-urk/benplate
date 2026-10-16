import { timestamp } from "drizzle-orm/pg-core";

// Spread into every table. Drizzle sets `updatedAt` on every update it runs; writes outside the app (Studio,
// psql, SQL migrations) leave it alone, as Postgres has no ON UPDATE
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
