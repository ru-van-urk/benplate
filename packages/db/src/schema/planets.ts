import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const planetTypes = ["terrestrial", "gas giant", "ice giant"] as const;

export const planets = sqliteTable("planets", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
  type: text({ enum: planetTypes }).notNull(),
  moons: integer().notNull().default(0),
  diameterKm: integer().notNull(),
  distanceFromSunAu: real().notNull(),
  orbitalPeriodDays: real().notNull(),
});

export type Planet = typeof planets.$inferSelect;
