-- `updated_at` is now set by the app: Drizzle's `$onUpdate` on every update it runs (see schema/columns.ts), and
-- Better Auth for its own tables. Postgres has no ON UPDATE, so writes outside the app leave it alone
DROP TRIGGER "user_updated_at" ON "user";
--> statement-breakpoint
DROP TRIGGER "session_updated_at" ON "session";
--> statement-breakpoint
DROP TRIGGER "account_updated_at" ON "account";
--> statement-breakpoint
DROP TRIGGER "verification_updated_at" ON "verification";
--> statement-breakpoint
DROP TRIGGER "planets_updated_at" ON "planets";
--> statement-breakpoint
DROP TRIGGER "people_updated_at" ON "people";
--> statement-breakpoint
DROP FUNCTION "set_updated_at"();
