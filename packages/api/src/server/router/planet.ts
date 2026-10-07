import { isForeignKeyViolation, isUniqueViolation, jsonArrayFrom, newPublicId } from "@benplate/db";

import { publicIdPrefixes } from "@benplate/contract";

import { os, protectedProcedure } from "../orpc";

const listPlanets = os.planet.list.handler(({ context }) => {
  return context.db.selectFrom("planets").selectAll().orderBy("name").execute();
});

const getPlanet = os.planet.get.handler(async ({ context, input, errors }) => {
  // The residents come along in the same query, as a JSON array built by Postgres
  const planet = await context.db
    .selectFrom("planets")
    .selectAll("planets")
    .select((eb) =>
      jsonArrayFrom(
        eb
          .selectFrom("people")
          .select(["people.publicId", "people.name"])
          .whereRef("people.homeworldId", "=", "planets.id")
          .orderBy("people.name"),
      ).as("residents"),
    )
    .where("planets.publicId", "=", input.publicId)
    .executeTakeFirst();

  if (!planet) {
    throw errors.NOT_FOUND({ message: `Planet ${input.publicId} not found` });
  }

  return planet;
});

const createPlanet = protectedProcedure.planet.create.handler(
  async ({ context, input, errors }) => {
    try {
      return await context.db
        .insertInto("planets")
        .values({ ...input, publicId: newPublicId(publicIdPrefixes.planet) })
        .returningAll()
        .executeTakeFirstOrThrow();
    } catch (error) {
      if (isUniqueViolation(error, "planets_name_unique")) {
        throw errors.CONFLICT({ message: `Planet ${input.name} already exists`, cause: error });
      }

      throw error;
    }
  },
);

const updatePlanet = protectedProcedure.planet.update.handler(
  async ({ context, input, errors }) => {
    const { publicId, ...changes } = input;

    try {
      const planet = await context.db
        .updateTable("planets")
        // An empty patch still needs a SET clause; the updated_at trigger overwrites it anyway
        .set({ ...changes, updatedAt: new Date() })
        .where("publicId", "=", publicId)
        .returningAll()
        .executeTakeFirst();

      if (!planet) {
        throw errors.NOT_FOUND({ message: `Planet ${publicId} not found` });
      }

      return planet;
    } catch (error) {
      if (isUniqueViolation(error, "planets_name_unique")) {
        throw errors.CONFLICT({ message: `Planet ${changes.name} already exists`, cause: error });
      }

      throw error;
    }
  },
);

const deletePlanet = protectedProcedure.planet.delete.handler(
  async ({ context, input, errors }) => {
    try {
      const result = await context.db
        .deleteFrom("planets")
        .where("publicId", "=", input.publicId)
        .executeTakeFirst();

      if (result.numDeletedRows === 0n) {
        throw errors.NOT_FOUND({ message: `Planet ${input.publicId} not found` });
      }
    } catch (error) {
      // The foreign key refuses (ON DELETE RESTRICT) while people still live there
      if (isForeignKeyViolation(error, "people_homeworld_id_fkey")) {
        throw errors.CONFLICT({
          message: `Planet ${input.publicId} still has residents`,
          cause: error,
        });
      }

      throw error;
    }
  },
);

export const planetRouter = os.planet.router({
  list: listPlanets,
  get: getPlanet,
  create: createPlanet,
  update: updatePlanet,
  delete: deletePlanet,
});
