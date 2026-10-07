import { isUniqueViolation, newPublicId } from "@benplate/db";

import { planetIdPrefix } from "@benplate/contract";

import { os, protectedProcedure } from "../orpc";

const listPlanets = os.planet.list.handler(({ context }) => {
  return context.db.selectFrom("planets").selectAll().orderBy("distanceFromSunAu").execute();
});

const getPlanet = os.planet.get.handler(async ({ context, input, errors }) => {
  const planet = await context.db
    .selectFrom("planets")
    .selectAll()
    .where("publicId", "=", input.publicId)
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
        .values({ ...input, publicId: newPublicId(planetIdPrefix) })
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
    const result = await context.db
      .deleteFrom("planets")
      .where("publicId", "=", input.publicId)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw errors.NOT_FOUND({ message: `Planet ${input.publicId} not found` });
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
