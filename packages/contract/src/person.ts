import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";

import {
  authedContract,
  integerSchema,
  publicIdPrefixes,
  publicIdSchema,
  referenceSchema,
} from "./common";

const tags = ["People"];

const personIdSchema = publicIdSchema(publicIdPrefixes.person);

// What clients see of a person. The homeworld is embedded by its public id and name; the private `homeworld_id`
// stays in the database
const personSchema = v.object({
  publicId: v.string(),
  name: v.string(),
  birthYear: v.nullable(v.string()),
  heightCm: v.nullable(v.number()),
  massKg: v.nullable(v.number()),
  homeworld: referenceSchema,
  createdAt: v.date(),
  updatedAt: v.date(),
});

// Also the schema of the web forms. Another resource is referenced by its public id, named `<relation>PublicId`;
// the router looks up the private id it stores
export const newPersonSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Enter a name")),
  homeworldPublicId: publicIdSchema(publicIdPrefixes.planet, "Choose a homeworld"),
  // Galactic years, like "19BBY"
  birthYear: v.optional(v.nullable(v.string())),
  heightCm: v.optional(v.nullable(v.pipe(integerSchema, v.minValue(1)))),
  massKg: v.optional(v.nullable(v.pipe(integerSchema, v.minValue(1)))),
});

const listPeople = oc
  .meta(openapi({ method: "GET", path: "/people", tags, summary: "List people by name" }))
  .output(v.array(personSchema));

const getPerson = oc
  .meta(
    openapi({
      method: "GET",
      path: "/people/{publicId}",
      tags,
      summary: "Get a person by public id",
    }),
  )
  .errors({ NOT_FOUND: {} })
  .input(v.object({ publicId: personIdSchema }))
  .output(personSchema);

const createPerson = authedContract
  .meta(
    openapi({
      method: "POST",
      path: "/people",
      successStatus: 201,
      tags,
      summary: "Create a person",
    }),
  )
  // NOT_FOUND: the homeworld
  .errors({ NOT_FOUND: {} })
  .input(newPersonSchema)
  .output(personSchema);

const updatePerson = authedContract
  .meta(openapi({ method: "PATCH", path: "/people/{publicId}", tags, summary: "Update a person" }))
  // NOT_FOUND: the person or the new homeworld
  .errors({ NOT_FOUND: {} })
  .input(v.object({ publicId: personIdSchema, ...v.partial(newPersonSchema).entries }))
  .output(personSchema);

const deletePerson = authedContract
  .meta(
    openapi({
      method: "DELETE",
      path: "/people/{publicId}",
      successStatus: 204,
      tags,
      summary: "Delete a person",
    }),
  )
  .errors({ NOT_FOUND: {} })
  .input(v.object({ publicId: personIdSchema }));

export const personContract = {
  list: listPeople,
  get: getPerson,
  create: createPerson,
  update: updatePerson,
  delete: deletePerson,
};
