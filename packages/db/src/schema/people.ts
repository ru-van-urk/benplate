import { sql } from "drizzle-orm";
import { foreignKey, index, snakeCase } from "drizzle-orm/pg-core";

import { timestamps } from "./columns";
import { planets } from "./planets";

export const people = snakeCase.table(
  "people",
  (t) => ({
    id: t
      .uuid()
      .primaryKey()
      .default(sql`uuidv7()`),
    homeworldId: t.uuid().notNull(),

    name: t.text().notNull(),
    // Galactic years, like "19BBY"
    birthYear: t.text(),
    heightCm: t.integer(),
    massKg: t.integer(),

    ...timestamps,
  }),
  (table) => [
    // Named, so the API can map a violation (deleting a planet that still has residents) to CONFLICT
    foreignKey({
      name: "people_homeworld_id_fkey",
      columns: [table.homeworldId],
      foreignColumns: [planets.id],
    }).onDelete("restrict"),
    index("people_homeworld_id_idx").on(table.homeworldId),
  ],
);
