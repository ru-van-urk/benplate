import { type Database, isForeignKeyViolation } from "@benplate/db";
import { people } from "@benplate/db/schema";
import { eq } from "drizzle-orm";

import { os, protectedProcedure } from "../orpc";

// What a person embeds of their homeworld
const homeworld = { columns: { id: true, name: true } } as const;

const findPerson = (db: Database, id: string) => {
  return db.query.people.findFirst({ where: { id }, with: { homeworld } });
};

const listPeople = os.person.list.handler(({ context }) => {
  return context.db.query.people.findMany({ orderBy: { name: "asc" }, with: { homeworld } });
});

const getPerson = os.person.get.handler(async ({ context, input, errors }) => {
  const person = await findPerson(context.db, input.id);

  if (!person) {
    throw errors.NOT_FOUND({ message: `Person ${input.id} not found` });
  }

  return person;
});

const createPerson = protectedProcedure.person.create.handler(
  async ({ context, input, errors }) => {
    let created: { id: string } | undefined;

    try {
      [created] = await context.db.insert(people).values(input).returning({ id: people.id });
    } catch (error) {
      // The foreign key refuses a homeworld that doesn't exist
      if (isForeignKeyViolation(error, "people_homeworld_id_fkey")) {
        throw errors.NOT_FOUND({ message: `Planet ${input.homeworldId} not found`, cause: error });
      }

      throw error;
    }

    // Read back with the homeworld
    const person = created && (await findPerson(context.db, created.id));

    if (!person) {
      throw new Error("The insert returned no row");
    }

    return person;
  },
);

const updatePerson = protectedProcedure.person.update.handler(
  async ({ context, input, errors }) => {
    const { id, ...changes } = input;

    try {
      // Drizzle skips undefined values, so an unchanged homeworld stays
      await context.db.update(people).set(changes).where(eq(people.id, id));
    } catch (error) {
      if (isForeignKeyViolation(error, "people_homeworld_id_fkey")) {
        throw errors.NOT_FOUND({
          message: `Planet ${changes.homeworldId} not found`,
          cause: error,
        });
      }

      throw error;
    }

    // Read back with the homeworld; nothing to read means there was no such person
    const person = await findPerson(context.db, id);

    if (!person) {
      throw errors.NOT_FOUND({ message: `Person ${id} not found` });
    }

    return person;
  },
);

const deletePerson = protectedProcedure.person.delete.handler(
  async ({ context, input, errors }) => {
    const deleted = await context.db
      .delete(people)
      .where(eq(people.id, input.id))
      .returning({ id: people.id });

    if (deleted.length === 0) {
      throw errors.NOT_FOUND({ message: `Person ${input.id} not found` });
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
