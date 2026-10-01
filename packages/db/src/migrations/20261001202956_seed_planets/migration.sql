-- Earth and Mars come first so they get ids 1 and 2 from the oRPC getting started example
INSERT INTO "planets" ("name", "description", "type", "moons", "diameterKm", "distanceFromSunAu", "orbitalPeriodDays") VALUES
	('Earth', 'The only known planet with liquid surface water and life.', 'terrestrial', 1, 12742, 1.0, 365.25),
	('Mars', 'A cold desert world with the tallest volcano in the solar system, Olympus Mons.', 'terrestrial', 2, 6779, 1.52, 687),
	('Mercury', 'The smallest planet and closest to the Sun, with almost no atmosphere.', 'terrestrial', 0, 4879, 0.39, 88),
	('Venus', 'Shrouded in sulfuric acid clouds, it is the hottest planet in the solar system.', 'terrestrial', 0, 12104, 0.72, 224.7),
	('Jupiter', 'The largest planet, home to the Great Red Spot, a storm larger than Earth.', 'gas giant', 95, 139820, 5.2, 4333),
	('Saturn', 'Famous for its bright ring system made of ice and rock.', 'gas giant', 146, 116460, 9.54, 10759),
	('Uranus', 'An ice giant that rotates on its side, tilted about 98 degrees.', 'ice giant', 28, 50724, 19.19, 30687),
	('Neptune', 'The windiest planet, with supersonic storms and a deep blue color.', 'ice giant', 16, 49244, 30.07, 60190);
