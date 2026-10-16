import { index, snakeCase } from "drizzle-orm/pg-core";

import { timestamps } from "./columns";

// Better Auth's core schema (https://www.better-auth.com/docs/concepts/database#core-schema), written by hand in
// our conventions, except for the ids: Better Auth generates its own random text ids, so `id` and `user_id` stay
// `text`, as in its docs. It checks these tables at startup.
// A plugin's tables or fields come from its docs page, added here like any other schema change

export const user = snakeCase.table("user", (t) => ({
  id: t.text().primaryKey(),

  name: t.text().notNull(),
  email: t.text().notNull().unique("user_email_unique"),
  emailVerified: t.boolean().notNull().default(false),
  image: t.text(),

  ...timestamps,
}));

export const session = snakeCase.table(
  "session",
  (t) => ({
    id: t.text().primaryKey(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    token: t.text().notNull().unique("session_token_unique"),
    expiresAt: t.timestamp({ withTimezone: true }).notNull(),
    ipAddress: t.text(),
    userAgent: t.text(),

    ...timestamps,
  }),
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = snakeCase.table(
  "account",
  (t) => ({
    id: t.text().primaryKey(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    accountId: t.text().notNull(),
    providerId: t.text().notNull(),
    accessToken: t.text(),
    refreshToken: t.text(),
    idToken: t.text(),
    accessTokenExpiresAt: t.timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: t.timestamp({ withTimezone: true }),
    scope: t.text(),
    password: t.text(),

    ...timestamps,
  }),
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = snakeCase.table(
  "verification",
  (t) => ({
    id: t.text().primaryKey(),

    identifier: t.text().notNull(),
    value: t.text().notNull(),
    expiresAt: t.timestamp({ withTimezone: true }).notNull(),

    ...timestamps,
  }),
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
