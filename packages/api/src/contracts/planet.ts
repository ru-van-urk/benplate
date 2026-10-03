import { planets } from "@benplate/db/schema";
import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";

import { idSchema } from "./common";

const tags = ["Planets"];

const planetSchema = createSelectSchema(planets);

// The server sets the id and both timestamps, so clients can't send them
const newPlanetSchema = v.omit(
  createInsertSchema(planets, {
    name: (schema) => v.pipe(schema, v.nonEmpty()),
    moons: (schema) => v.pipe(schema, v.minValue(0)),
    diameterKm: (schema) => v.pipe(schema, v.minValue(1)),
    distanceFromSunAu: (schema) => v.pipe(schema, v.minValue(0)),
    orbitalPeriodDays: (schema) => v.pipe(schema, v.minValue(0)),
  }),
  ["id", "createdAt", "updatedAt"],
);

const listPlanets = oc
  .meta(
    openapi({
      method: "GET",
      path: "/planets",
      tags,
      summary: "List planets, ordered from the Sun",
    }),
  )
  .output(v.array(planetSchema));

const findPlanet = oc
  .meta(openapi({ method: "GET", path: "/planets/{id}", tags, summary: "Find a planet by id" }))
  .errors({ NOT_FOUND: {} })
  .input(v.object({ id: idSchema }))
  .output(planetSchema);

const createPlanet = oc
  .meta(
    openapi({
      method: "POST",
      path: "/planets",
      successStatus: 201,
      tags,
      summary: "Create a planet",
    }),
  )
  .errors({ CONFLICT: {} })
  .input(newPlanetSchema)
  .output(planetSchema);

export const planetContract = {
  list: listPlanets,
  find: findPlanet,
  create: createPlanet,
};
