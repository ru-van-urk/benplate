import { planets } from "@maribor/db/schema/index";
import { openapi } from "@orpc/openapi";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";

import { publicProcedure } from "../index";

const tags = ["Planets"];

const planetSchema = createSelectSchema(planets);

const newPlanetSchema = v.omit(
  createInsertSchema(planets, {
    name: (schema) => v.pipe(schema, v.nonEmpty()),
    moons: (schema) => v.pipe(schema, v.minValue(0)),
    diameterKm: (schema) => v.pipe(schema, v.minValue(1)),
    distanceFromSunAu: (schema) => v.pipe(schema, v.minValue(0)),
    orbitalPeriodDays: (schema) => v.pipe(schema, v.minValue(0)),
  }),
  ["id"],
);

export const listPlanets = publicProcedure
  .meta(
    openapi({
      method: "GET",
      path: "/planets",
      tags,
      summary: "List planets, ordered from the Sun",
    }),
  )
  .output(v.array(planetSchema))
  .handler(({ context }) => {
    return context.db.select().from(planets).orderBy(planets.distanceFromSunAu);
  });

export const findPlanet = publicProcedure
  .meta(openapi({ method: "GET", path: "/planets/{id}", tags, summary: "Find a planet by id" }))
  .input(v.object({ id: v.pipe(v.number(), v.integer()) }))
  .output(planetSchema)
  .handler(async ({ context, input }) => {
    const [planet] = await context.db.select().from(planets).where(eq(planets.id, input.id));

    if (!planet) {
      throw new ORPCError("NOT_FOUND", { message: `Planet ${input.id} not found` });
    }

    return planet;
  });

export const createPlanet = publicProcedure
  .meta(
    openapi({
      method: "POST",
      path: "/planets",
      successStatus: 201,
      tags,
      summary: "Create a planet",
    }),
  )
  .input(newPlanetSchema)
  .output(planetSchema)
  .handler(({ context, input }) => {
    return context.db.insert(planets).values(input).returning().get();
  });

export const planetRouter = {
  list: listPlanets,
  find: findPlanet,
  create: createPlanet,
};
