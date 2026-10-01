import { pgTable } from "drizzle-orm/pg-core";

export const planetTypes = ["terrestrial", "gas giant", "ice giant"] as const;

export const planets = pgTable("planets", (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),

  name: t.text().notNull().unique(),
  description: t.text(),

  type: t.text({ enum: planetTypes }).notNull(),

  moons: t.integer().notNull().default(0),
  diameterKm: t.integer().notNull(),

  distanceFromSunAu: t.real().notNull(),
  orbitalPeriodDays: t.real().notNull(),
}));

export type Planet = typeof planets.$inferSelect;
