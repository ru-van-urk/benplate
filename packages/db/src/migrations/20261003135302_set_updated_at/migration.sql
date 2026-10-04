-- Shared by every table's `<table>_updated_at` trigger: keeps `updated_at` current on every UPDATE,
-- whatever wrote the row. The one PL/pgSQL function in the schema
CREATE FUNCTION "set_updated_at"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
	NEW."updated_at" = now();
	RETURN NEW;
END;
$$;
