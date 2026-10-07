import { pgEnum, snakeCase } from "drizzle-orm/pg-core";

import { timestamps } from "./columns";

// A Postgres enum, so the database rejects other values and kysely-codegen types the column as their union.
// Adding a value is a normal migration, but it can't be used in the same deploy (see the README)
export const planetType = pgEnum("planet_type", ["terrestrial", "gas giant", "ice giant"]);

export const planets = snakeCase.table("planets", (t) => ({
  id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
  // The only id the API exposes; filled with newPublicId() on insert
  publicId: t.text().notNull().unique("planets_public_id_unique"),

  name: t.text().notNull().unique("planets_name_unique"),
  description: t.text(),

  type: planetType().notNull(),

  moons: t.integer().notNull().default(0),
  diameterKm: t.integer().notNull(),

  distanceFromSunAu: t.real().notNull(),
  orbitalPeriodDays: t.real().notNull(),

  ...timestamps,
}));

export type Planet = typeof planets.$inferSelect;
