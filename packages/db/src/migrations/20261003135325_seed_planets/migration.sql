-- Example data for every database; the ids are literal, so they are the same everywhere
INSERT INTO "planets" ("id", "name", "description", "type", "moons", "diameter_km", "distance_from_sun_au", "orbital_period_days") VALUES
	('8usfnkwriaxc', 'Earth', 'The only known planet with liquid surface water and life.', 'terrestrial', 1, 12742, 1.0, 365.25),
	('ang8p92hog92', 'Mars', 'A cold desert world with the tallest volcano in the solar system, Olympus Mons.', 'terrestrial', 2, 6779, 1.52, 687),
	('o5nhsy4d69dq', 'Mercury', 'The smallest planet and closest to the Sun, with almost no atmosphere.', 'terrestrial', 0, 4879, 0.39, 88),
	('42vnoxaiconx', 'Venus', 'Shrouded in sulfuric acid clouds, it is the hottest planet in the solar system.', 'terrestrial', 0, 12104, 0.72, 224.7),
	('emwdydahzc5s', 'Jupiter', 'The largest planet, home to the Great Red Spot, a storm larger than Earth.', 'gas giant', 95, 139820, 5.2, 4333),
	('y9ys1o1ffrri', 'Saturn', 'Famous for its bright ring system made of ice and rock.', 'gas giant', 146, 116460, 9.54, 10759),
	('0fvtgoxzky0z', 'Uranus', 'An ice giant that rotates on its side, tilted about 98 degrees.', 'ice giant', 28, 50724, 19.19, 30687),
	('wtm4199gwlm0', 'Neptune', 'The windiest planet, with supersonic storms and a deep blue color.', 'ice giant', 16, 49244, 30.07, 60190);
