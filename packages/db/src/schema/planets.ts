import { snakeCase } from "drizzle-orm/pg-core";

import { timestamps } from "./columns";

export const planetTypes = ["terrestrial", "gas giant", "ice giant"] as const;

export const planets = snakeCase.table("planets", (t) => ({
  id: t.text().primaryKey(),

  name: t.text().notNull().unique("planets_name_unique"),
  description: t.text(),

  type: t.text({ enum: planetTypes }).notNull(),

  moons: t.integer().notNull().default(0),
  diameterKm: t.integer().notNull(),

  distanceFromSunAu: t.real().notNull(),
  orbitalPeriodDays: t.real().notNull(),

  ...timestamps,
}));

export type Planet = typeof planets.$inferSelect;
