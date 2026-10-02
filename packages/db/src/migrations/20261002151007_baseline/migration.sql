CREATE TABLE "planets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "planets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"type" text NOT NULL,
	"moons" integer DEFAULT 0 NOT NULL,
	"diameter_km" integer NOT NULL,
	"distance_from_sun_au" real NOT NULL,
	"orbital_period_days" real NOT NULL
);
