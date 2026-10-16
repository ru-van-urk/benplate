import { type Database, newPublicId } from "@benplate/db";
import { people } from "@benplate/db/schema";
import { eq } from "drizzle-orm";

import { publicIdPrefixes } from "@benplate/contract";

import { os, protectedProcedure } from "../orpc";

// What a person embeds of their homeworld: the planet's public id instead of the private `homeworld_id`
const homeworld = { columns: { publicId: true, name: true } } as const;

const findPerson = (db: Database, publicId: string) => {
  return db.query.people.findFirst({ where: { publicId }, with: { homeworld } });
};

// The planet behind a public id, which is what the API takes for a relation; its private id is what's stored
const findPlanet = (db: Database, publicId: string) => {
  return db.query.planets.findFirst({
    where: { publicId },
    columns: { id: true, publicId: true, name: true },
  });
};

const listPeople = os.person.list.handler(({ context }) => {
  return context.db.query.people.findMany({ orderBy: { name: "asc" }, with: { homeworld } });
});

const getPerson = os.person.get.handler(async ({ context, input, errors }) => {
  const person = await findPerson(context.db, input.publicId);

  if (!person) {
    throw errors.NOT_FOUND({ message: `Person ${input.publicId} not found` });
  }

  return person;
});

const createPerson = protectedProcedure.person.create.handler(
  async ({ context, input, errors }) => {
    const { homeworldPublicId, ...values } = input;
    const planet = await findPlanet(context.db, homeworldPublicId);

    if (!planet) {
      throw errors.NOT_FOUND({ message: `Planet ${homeworldPublicId} not found` });
    }

    const [person] = await context.db
      .insert(people)
      .values({ ...values, homeworldId: planet.id, publicId: newPublicId(publicIdPrefixes.person) })
      .returning();

    if (!person) {
      throw new Error("The insert returned no row");
    }

    // The output schema keeps the planet's public id and name, and drops its private id
    return { ...person, homeworld: planet };
  },
);

const updatePerson = protectedProcedure.person.update.handler(
  async ({ context, input, errors }) => {
    const { publicId, homeworldPublicId, ...changes } = input;
    let homeworldId: number | undefined;

    if (homeworldPublicId !== undefined) {
      const planet = await findPlanet(context.db, homeworldPublicId);

      if (!planet) {
        throw errors.NOT_FOUND({ message: `Planet ${homeworldPublicId} not found` });
      }

      homeworldId = planet.id;
    }

    // Drizzle skips undefined values, so an unchanged homeworld stays
    await context.db
      .update(people)
      .set({ ...changes, homeworldId })
      .where(eq(people.publicId, publicId));

    // Read back with the homeworld; nothing to read means there was no such person
    const person = await findPerson(context.db, publicId);

    if (!person) {
      throw errors.NOT_FOUND({ message: `Person ${publicId} not found` });
    }

    return person;
  },
);

const deletePerson = protectedProcedure.person.delete.handler(
  async ({ context, input, errors }) => {
    const deleted = await context.db
      .delete(people)
      .where(eq(people.publicId, input.publicId))
      .returning({ id: people.id });

    if (deleted.length === 0) {
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
