CREATE TABLE "planets" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL CONSTRAINT "planets_name_unique" UNIQUE,
	"description" text,
	"type" text NOT NULL,
	"moons" integer DEFAULT 0 NOT NULL,
	"diameter_km" integer NOT NULL,
	"distance_from_sun_au" real NOT NULL,
	"orbital_period_days" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
