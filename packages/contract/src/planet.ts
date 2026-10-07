import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";

import { authedContract, idSchema, integerSchema } from "./common";

const tags = ["Planets"];

// The same list as the `type` column in @benplate/db; the router stops type-checking when they differ
export const planetTypes = ["terrestrial", "gas giant", "ice giant"] as const;

// What clients see of a planet: a column added to the table stays private until it is listed here. Types
// only, no input rules, so a row stored before a rule was tightened still passes response validation
const planetSchema = v.object({
  id: idSchema,
  name: v.string(),
  description: v.nullable(v.string()),
  type: v.picklist(planetTypes),
  moons: v.number(),
  diameterKm: v.number(),
  distanceFromSunAu: v.number(),
  orbitalPeriodDays: v.number(),
  createdAt: v.date(),
  updatedAt: v.date(),
});

// The server sets the id and both timestamps, so clients can't send them. Also the schema of the web forms
export const newPlanetSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Enter a name")),
  description: v.optional(v.nullable(v.string())),
  type: v.picklist(planetTypes),
  // The column defaults to 0
  moons: v.optional(v.pipe(integerSchema, v.minValue(0))),
  diameterKm: v.pipe(integerSchema, v.minValue(1)),
  distanceFromSunAu: v.pipe(v.number(), v.minValue(0)),
  orbitalPeriodDays: v.pipe(v.number(), v.minValue(0)),
});

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
