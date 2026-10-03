CREATE TRIGGER "user_updated_at" BEFORE UPDATE ON "user"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "session_updated_at" BEFORE UPDATE ON "session"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "account_updated_at" BEFORE UPDATE ON "account"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "verification_updated_at" BEFORE UPDATE ON "verification"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
