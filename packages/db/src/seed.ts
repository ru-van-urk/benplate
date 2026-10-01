import { existsSync } from "node:fs";

import * as v from "valibot";

import { createDb } from "./index";
import { planets } from "./schema";

// The server app owns DATABASE_URL; an already-set env var (CI, Docker) takes precedence.
const serverEnvFile = "../../apps/server/.env";
if (existsSync(serverEnvFile)) {
  process.loadEnvFile(serverEnvFile);
}

const db = createDb({
  DATABASE_URL: v.parse(v.pipe(v.string(), v.nonEmpty()), process.env.DATABASE_URL),
});

// Earth and Mars come first so a fresh table gives them ids 1 and 2 from the oRPC getting started example.
// Conflicts on name are skipped, so the seed can run again after every push.
await db
  .insert(planets)
  .values([
    {
      name: "Earth",
      description: "The only known planet with liquid surface water and life.",
      type: "terrestrial",
      moons: 1,
      diameterKm: 12742,
      distanceFromSunAu: 1.0,
      orbitalPeriodDays: 365.25,
    },
    {
      name: "Mars",
      description: "A cold desert world with the tallest volcano in the solar system, Olympus Mons.",
      type: "terrestrial",
      moons: 2,
      diameterKm: 6779,
      distanceFromSunAu: 1.52,
      orbitalPeriodDays: 687,
    },
    {
      name: "Mercury",
      description: "The smallest planet and closest to the Sun, with almost no atmosphere.",
      type: "terrestrial",
      moons: 0,
      diameterKm: 4879,
      distanceFromSunAu: 0.39,
      orbitalPeriodDays: 88,
    },
    {
      name: "Venus",
      description: "Shrouded in sulfuric acid clouds, it is the hottest planet in the solar system.",
      type: "terrestrial",
      moons: 0,
      diameterKm: 12104,
      distanceFromSunAu: 0.72,
      orbitalPeriodDays: 224.7,
    },
    {
      name: "Jupiter",
      description: "The largest planet, home to the Great Red Spot, a storm larger than Earth.",
      type: "gas giant",
      moons: 95,
      diameterKm: 139820,
      distanceFromSunAu: 5.2,
      orbitalPeriodDays: 4333,
    },
    {
      name: "Saturn",
      description: "Famous for its bright ring system made of ice and rock.",
      type: "gas giant",
      moons: 146,
      diameterKm: 116460,
      distanceFromSunAu: 9.54,
      orbitalPeriodDays: 10759,
    },
    {
      name: "Uranus",
      description: "An ice giant that rotates on its side, tilted about 98 degrees.",
      type: "ice giant",
      moons: 28,
      diameterKm: 50724,
      distanceFromSunAu: 19.19,
      orbitalPeriodDays: 30687,
    },
    {
      name: "Neptune",
      description: "The windiest planet, with supersonic storms and a deep blue color.",
      type: "ice giant",
      moons: 16,
      diameterKm: 49244,
      distanceFromSunAu: 30.07,
      orbitalPeriodDays: 60190,
    },
  ])
  .onConflictDoNothing({ target: planets.name });

await db.$client.end();
