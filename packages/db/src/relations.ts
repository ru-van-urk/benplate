import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

// What `db.query` can load together (`with: { homeworld: true }`), on top of every table in the schema. Better
// Auth's adapter finds its tables here too
export const relations = defineRelations(schema, (r) => ({
  planets: {
    residents: r.many.people({ from: r.planets.id, to: r.people.homeworldId }),
  },
  people: {
    homeworld: r.one.planets({ from: r.people.homeworldId, to: r.planets.id, optional: false }),
  },
}));
