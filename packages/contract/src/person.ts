import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import * as v from "valibot";

import { authedContract, hasChanges, idSchema, integerSchema, referenceSchema } from "./common";

const tags = ["People"];

// What clients see of a person, with the homeworld embedded by its id and name
const personSchema = v.object({
  id: v.string(),
  name: v.string(),
  birthYear: v.nullable(v.string()),
  heightCm: v.nullable(v.number()),
  massKg: v.nullable(v.number()),
  homeworld: referenceSchema,
  createdAt: v.date(),
  updatedAt: v.date(),
});

// Also the schema of the web forms. Another resource is referenced by its id, named `<relation>Id`
export const newPersonSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Enter a name")),
  homeworldId: idSchema("Choose a homeworld"),
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
      path: "/people/{id}",
      tags,
      summary: "Get a person by id",
    }),
  )
  .errors({ NOT_FOUND: {} })
  .input(v.object({ id: idSchema() }))
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
  .meta(openapi({ method: "PATCH", path: "/people/{id}", tags, summary: "Update a person" }))
  // NOT_FOUND: the person or the new homeworld
  .errors({ NOT_FOUND: {} })
  .input(
    v.pipe(
      v.object({ id: idSchema(), ...v.partial(newPersonSchema).entries }),
      v.check(hasChanges, "Send at least one field to change"),
    ),
  )
  .output(personSchema);

const deletePerson = authedContract
  .meta(
    openapi({
      method: "DELETE",
      path: "/people/{id}",
      successStatus: 204,
      tags,
      summary: "Delete a person",
    }),
  )
  .errors({ NOT_FOUND: {} })
  .input(v.object({ id: idSchema() }));

export const personContract = {
  list: listPeople,
  get: getPerson,
  create: createPerson,
  update: updatePerson,
  delete: deletePerson,
};
