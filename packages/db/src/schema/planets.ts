import { sql } from "drizzle-orm";
import { pgEnum, snakeCase } from "drizzle-orm/pg-core";

import { timestamps } from "./columns";

// A Postgres enum, so the database rejects other values and the column is typed as their union.
// Adding a value is a normal migration, but it can't be used in the same deploy (see docs/database.md)
export const climate = pgEnum("climate", [
  "arid",
  "temperate",
  "tropical",
  "frozen",
  "murky",
  "hot",
]);

export const planets = snakeCase.table("planets", (t) => ({
  // Postgres 18's uuidv7(): time-ordered, so new rows land at the end of the primary key index
  id: t
    .uuid()
    .primaryKey()
    .default(sql`uuidv7()`),

  name: t.text().notNull().unique("planets_name_unique"),
  description: t.text(),

  climate: climate().notNull(),
  terrain: t.text().notNull(),

  diameterKm: t.integer().notNull(),
  rotationPeriodHours: t.integer().notNull(),
  orbitalPeriodDays: t.integer().notNull(),

  // Coruscant's trillion doesn't fit an `integer`. pg returns `bigint` as a string, so the API does too
  population: t.bigint({ mode: "string" }),

  ...timestamps,
}));
