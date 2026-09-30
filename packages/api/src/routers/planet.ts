import { planets, planetTypes } from "@maribor/db/schema/index";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import * as v from "valibot";

import { publicProcedure } from "../index";

export const listPlanets = publicProcedure.handler(({ context }) => {
  return context.db.select().from(planets).orderBy(planets.distanceFromSunAu);
});

export const findPlanet = publicProcedure
  .input(v.object({ id: v.pipe(v.number(), v.integer()) }))
  .handler(async ({ context, input }) => {
    const [planet] = await context.db.select().from(planets).where(eq(planets.id, input.id));

    if (!planet) {
      throw new ORPCError("NOT_FOUND", { message: `Planet ${input.id} not found` });
    }

    return planet;
  });

export const createPlanet = publicProcedure
  .input(
    v.object({
      name: v.pipe(v.string(), v.nonEmpty()),
      description: v.optional(v.string()),
      type: v.picklist(planetTypes),
      moons: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
      diameterKm: v.pipe(v.number(), v.integer(), v.minValue(1)),
      distanceFromSunAu: v.pipe(v.number(), v.minValue(0)),
      orbitalPeriodDays: v.pipe(v.number(), v.minValue(0)),
    }),
  )
  .handler(async ({ context, input }) => {
    const [planet] = await context.db.insert(planets).values(input).returning();

    return planet;
  });

export const planetRouter = {
  list: listPlanets,
  find: findPlanet,
  create: createPlanet,
};
