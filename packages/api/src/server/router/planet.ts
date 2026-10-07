import { isForeignKeyViolation, isUniqueViolation, newPublicId } from "@benplate/db";
import { planets } from "@benplate/db/schema";
import { eq } from "drizzle-orm";

import { publicIdPrefixes } from "@benplate/contract";

import { os, protectedProcedure } from "../orpc";

const listPlanets = os.planet.list.handler(({ context }) => {
  return context.db.query.planets.findMany({ orderBy: { name: "asc" } });
});

const getPlanet = os.planet.get.handler(async ({ context, input, errors }) => {
  // The residents come along in the same query
  const planet = await context.db.query.planets.findFirst({
    where: { publicId: input.publicId },
    with: { residents: { columns: { publicId: true, name: true }, orderBy: { name: "asc" } } },
  });

  if (!planet) {
    throw errors.NOT_FOUND({ message: `Planet ${input.publicId} not found` });
  }

  return planet;
});

const createPlanet = protectedProcedure.planet.create.handler(
  async ({ context, input, errors }) => {
    try {
      const [planet] = await context.db
        .insert(planets)
        .values({ ...input, publicId: newPublicId(publicIdPrefixes.planet) })
        .returning();

      if (!planet) {
        throw new Error("The insert returned no row");
      }

      return planet;
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
      // Drizzle skips undefined values and adds `updatedAt` ($onUpdate); the contract rules out an empty patch
      const [planet] = await context.db
        .update(planets)
        .set(changes)
        .where(eq(planets.publicId, publicId))
        .returning();

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
      const deleted = await context.db
        .delete(planets)
        .where(eq(planets.publicId, input.publicId))
        .returning({ id: planets.id });

      if (deleted.length === 0) {
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
