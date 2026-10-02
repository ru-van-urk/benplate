import { os } from "../orpc";

const listPlanets = os.planet.list.handler(({ context }) => {
  return context.db.selectFrom("planets").selectAll().orderBy("distanceFromSunAu").execute();
});

const findPlanet = os.planet.find.handler(async ({ context, input, errors }) => {
  const planet = await context.db
    .selectFrom("planets")
    .selectAll()
    .where("id", "=", input.id)
    .executeTakeFirst();

  if (!planet) {
    throw errors.NOT_FOUND({ message: `Planet ${input.id} not found` });
  }

  return planet;
});

const createPlanet = os.planet.create.handler(({ context, input }) => {
  return context.db.insertInto("planets").values(input).returningAll().executeTakeFirstOrThrow();
});

export const planetRouter = os.planet.router({
  list: listPlanets,
  find: findPlanet,
  create: createPlanet,
});
