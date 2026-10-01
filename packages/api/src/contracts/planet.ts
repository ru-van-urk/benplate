import { planets } from "@maribor/db/schema/index";
import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";

const tags = ["Planets"];

const planetSchema = createSelectSchema(planets);

const newPlanetSchema = v.omit(
  createInsertSchema(planets, {
    name: (schema) => v.pipe(schema, v.nonEmpty()),
    moons: (schema) => v.pipe(schema, v.minValue(0)),
    diameterKm: (schema) => v.pipe(schema, v.minValue(1)),
    distanceFromSunAu: (schema) => v.pipe(schema, v.minValue(0)),
    orbitalPeriodDays: (schema) => v.pipe(schema, v.minValue(0)),
  }),
  ["id"],
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
  .input(v.object({ id: v.pipe(v.number(), v.integer()) }))
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
  .input(newPlanetSchema)
  .output(planetSchema);

export const planetContract = {
  list: listPlanets,
  find: findPlanet,
  create: createPlanet,
};
