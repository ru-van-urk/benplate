CREATE TRIGGER "planets_updated_at" BEFORE UPDATE ON "planets"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
