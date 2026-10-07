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
  id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
  // The only id the API exposes; filled with newPublicId() on insert
  publicId: t.text().notNull().unique("planets_public_id_unique"),

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
