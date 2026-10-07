import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";

import { authedContract, integerSchema, publicIdSchema } from "./common";

const tags = ["Planets"];

// Starts every planet's public id (`pl_k3m9x0q2a7zd`); the router passes it to `newPublicId`
export const planetIdPrefix = "pl";

const planetIdSchema = publicIdSchema(planetIdPrefix);

// The same list as the `type` column in @benplate/db; the router stops type-checking when they differ
export const planetTypes = ["terrestrial", "gas giant", "ice giant"] as const;

// What clients see of a planet: a column added to the table, like the integer `id`, stays private until it is
// listed here. Types only, no input rules, so a row stored before a rule was tightened still passes response validation
const planetSchema = v.object({
  publicId: v.string(),
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

// The server sets both ids and both timestamps, so clients can't send them. Also the schema of the web forms
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

const getPlanet = oc
  .meta(
    openapi({
      method: "GET",
      path: "/planets/{publicId}",
      tags,
      summary: "Get a planet by public id",
    }),
  )
  .errors({ NOT_FOUND: {} })
  .input(v.object({ publicId: planetIdSchema }))
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
  .meta(openapi({ method: "PATCH", path: "/planets/{publicId}", tags, summary: "Update a planet" }))
  .errors({ NOT_FOUND: {}, CONFLICT: {} })
  .input(v.object({ publicId: planetIdSchema, ...v.partial(newPlanetSchema).entries }))
  .output(planetSchema);

const deletePlanet = authedContract
  .meta(
    openapi({
      method: "DELETE",
      path: "/planets/{publicId}",
      successStatus: 204,
      tags,
      summary: "Delete a planet",
    }),
  )
  .errors({ NOT_FOUND: {} })
  .input(v.object({ publicId: planetIdSchema }));

export const planetContract = {
  list: listPlanets,
  get: getPlanet,
  create: createPlanet,
  update: updatePlanet,
  delete: deletePlanet,
};
