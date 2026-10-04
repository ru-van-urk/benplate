import { planets } from "@benplate/db/schema";
import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";

import { authedContract, idSchema } from "./common";

export { planetTypes } from "@benplate/db/schema";

const tags = ["Planets"];

const planetSchema = createSelectSchema(planets);

// The server sets the id and both timestamps, so clients can't send them. Also the schema of the web forms
export const newPlanetSchema = v.omit(
  createInsertSchema(planets, {
    name: (schema) => v.pipe(schema, v.nonEmpty("Enter a name")),
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

const createPlanet = authedContract
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

const updatePlanet = authedContract
  .meta(openapi({ method: "PATCH", path: "/planets/{id}", tags, summary: "Update a planet" }))
  .errors({ NOT_FOUND: {}, CONFLICT: {} })
  .input(v.object({ id: idSchema, ...v.partial(newPlanetSchema).entries }))
  .output(planetSchema);

const deletePlanet = authedContract
  .meta(
    openapi({
      method: "DELETE",
      path: "/planets/{id}",
      successStatus: 204,
      tags,
      summary: "Delete a planet",
    }),
  )
  .errors({ NOT_FOUND: {} })
  .input(v.object({ id: idSchema }));

export const planetContract = {
  list: listPlanets,
  find: findPlanet,
  create: createPlanet,
  update: updatePlanet,
  delete: deletePlanet,
};
