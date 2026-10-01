import { planets } from "@maribor/db/schema/index";
import { eq } from "drizzle-orm";

import { os } from "../orpc";

const listPlanets = os.planet.list.handler(({ context }) => {
  return context.db.select().from(planets).orderBy(planets.distanceFromSunAu);
});

const findPlanet = os.planet.find.handler(async ({ context, input, errors }) => {
  const [planet] = await context.db.select().from(planets).where(eq(planets.id, input.id));

  if (!planet) {
    throw errors.NOT_FOUND({ message: `Planet ${input.id} not found` });
  }

  return planet;
});

const createPlanet = os.planet.create.handler(({ context, input }) => {
  return context.db.insert(planets).values(input).returning().get();
});

export const planetRouter = os.planet.router({
  list: listPlanets,
  find: findPlanet,
  create: createPlanet,
});
