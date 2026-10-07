import { type Database, jsonObjectFrom, newPublicId } from "@benplate/db";

import { publicIdPrefixes } from "@benplate/contract";

import { os, protectedProcedure } from "../orpc";

// People as the contract returns them: the homeworld comes along as a JSON object built by Postgres, with the
// planet's public id instead of the private `homeworld_id`
const selectPeople = (db: Database) =>
  db.selectFrom("people").select((eb) => [
    "people.publicId",
    "people.name",
    "people.birthYear",
    "people.heightCm",
    "people.massKg",
    "people.createdAt",
    "people.updatedAt",
    jsonObjectFrom(
      eb
        .selectFrom("planets")
        .select(["planets.publicId", "planets.name"])
        .whereRef("planets.id", "=", "people.homeworldId"),
    )
      // The foreign key guarantees the planet exists
      .$notNull()
      .as("homeworld"),
  ]);

// The private id behind a planet's public id, which is what the API takes for a relation
const findPlanetId = async (db: Database, publicId: string) => {
  const planet = await db
    .selectFrom("planets")
    .select("id")
    .where("publicId", "=", publicId)
    .executeTakeFirst();

  return planet?.id;
};

const listPeople = os.person.list.handler(({ context }) => {
  return selectPeople(context.db).orderBy("people.name").execute();
});

const getPerson = os.person.get.handler(async ({ context, input, errors }) => {
  const person = await selectPeople(context.db)
    .where("people.publicId", "=", input.publicId)
    .executeTakeFirst();

  if (!person) {
    throw errors.NOT_FOUND({ message: `Person ${input.publicId} not found` });
  }

  return person;
});

const createPerson = protectedProcedure.person.create.handler(
  async ({ context, input, errors }) => {
    const { homeworldPublicId, ...person } = input;
    const homeworldId = await findPlanetId(context.db, homeworldPublicId);

    if (homeworldId === undefined) {
      throw errors.NOT_FOUND({ message: `Planet ${homeworldPublicId} not found` });
    }

    const { publicId } = await context.db
      .insertInto("people")
      .values({ ...person, homeworldId, publicId: newPublicId(publicIdPrefixes.person) })
      .returning("publicId")
      .executeTakeFirstOrThrow();

    return selectPeople(context.db)
      .where("people.publicId", "=", publicId)
      .executeTakeFirstOrThrow();
  },
);

const updatePerson = protectedProcedure.person.update.handler(
  async ({ context, input, errors }) => {
    const { publicId, homeworldPublicId, ...changes } = input;
    let homeworldId: number | undefined;

    if (homeworldPublicId !== undefined) {
      homeworldId = await findPlanetId(context.db, homeworldPublicId);

      if (homeworldId === undefined) {
        throw errors.NOT_FOUND({ message: `Planet ${homeworldPublicId} not found` });
      }
    }

    const person = await context.db
      .updateTable("people")
      // Kysely skips undefined values, so an unchanged homeworld stays. An empty patch still needs a SET clause;
      // the updated_at trigger overwrites it anyway
      .set({ ...changes, homeworldId, updatedAt: new Date() })
      .where("publicId", "=", publicId)
      .returning("publicId")
      .executeTakeFirst();

    if (!person) {
      throw errors.NOT_FOUND({ message: `Person ${publicId} not found` });
    }

    return selectPeople(context.db)
      .where("people.publicId", "=", publicId)
      .executeTakeFirstOrThrow();
  },
);

const deletePerson = protectedProcedure.person.delete.handler(
  async ({ context, input, errors }) => {
    const result = await context.db
      .deleteFrom("people")
      .where("publicId", "=", input.publicId)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw errors.NOT_FOUND({ message: `Person ${input.publicId} not found` });
    }
  },
);

export const personRouter = os.person.router({
  list: listPeople,
  get: getPerson,
  create: createPerson,
  update: updatePerson,
  delete: deletePerson,
});
