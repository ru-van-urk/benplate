import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";

import { authedContract, hasChanges, idSchema, integerSchema, referenceSchema } from "./common";

const tags = ["Planets"];

// The values of the `climate` enum in @benplate/db; the router stops type-checking when they differ
export const climates = ["arid", "temperate", "tropical", "frozen", "murky", "hot"] as const;

// What clients see of a planet: a column added to the table stays private until it is listed here. Types only, no input rules, so a row stored before a rule was tightened still passes response
// validation
const planetSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.nullable(v.string()),
  climate: v.picklist(climates),
  terrain: v.string(),
  diameterKm: v.number(),
  rotationPeriodHours: v.number(),
  orbitalPeriodDays: v.number(),
  // A Postgres `bigint`, which pg returns as a string of digits
  population: v.nullable(v.string()),
  createdAt: v.date(),
  updatedAt: v.date(),
});

// A planet's own page also lists who lives there
const planetWithResidentsSchema = v.object({
  ...planetSchema.entries,
  residents: v.array(referenceSchema),
});

// The database sets the id and both timestamps, so clients can't send them. Also the schema of the web forms
export const newPlanetSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Enter a name")),
  description: v.optional(v.nullable(v.string())),
  climate: v.picklist(climates),
  terrain: v.pipe(v.string(), v.nonEmpty("Enter the terrain")),
  diameterKm: v.pipe(integerSchema, v.minValue(1)),
  rotationPeriodHours: v.pipe(integerSchema, v.minValue(1)),
  orbitalPeriodDays: v.pipe(integerSchema, v.minValue(1)),
  // Digits, at most 18 so it always fits a `bigint`; null when unknown
  population: v.optional(
    v.nullable(v.pipe(v.string(), v.regex(/^\d{1,18}$/, "Enter a whole number"))),
  ),
});

const listPlanets = oc
  .meta(openapi({ method: "GET", path: "/planets", tags, summary: "List planets by name" }))
  .output(v.array(planetSchema));

const getPlanet = oc
  .meta(
    openapi({
      method: "GET",
      path: "/planets/{id}",
      tags,
      summary: "Get a planet and its residents by id",
    }),
  )
  .errors({ NOT_FOUND: {} })
  .input(v.object({ id: idSchema() }))
  .output(planetWithResidentsSchema);

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
  .input(
    v.pipe(
      v.object({ id: idSchema(), ...v.partial(newPlanetSchema).entries }),
      v.check(hasChanges, "Send at least one field to change"),
    ),
  )
  .output(planetSchema);

const deletePlanet = authedContract
  .meta(
    openapi({
      method: "DELETE",
      path: "/planets/{id}",
      successStatus: 204,
      tags,
      summary: "Delete a planet that has no residents",
    }),
  )
  // CONFLICT: people still live there
  .errors({ NOT_FOUND: {}, CONFLICT: {} })
  .input(v.object({ id: idSchema() }));

export const planetContract = {
  list: listPlanets,
  get: getPlanet,
  create: createPlanet,
  update: updatePlanet,
  delete: deletePlanet,
};
