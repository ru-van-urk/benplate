-- Example data for every database, after SWAPI (swapi.dev); the public ids are literal, so they are the same
-- everywhere. People find their homeworld by its public id, as the API does
INSERT INTO "planets" ("public_id", "name", "description", "climate", "terrain", "diameter_km", "rotation_period_hours", "orbital_period_days", "population") VALUES
	('pl_u4apge8ke3bq', 'Tatooine', 'A harsh desert world orbiting twin suns, far from the bright center of the galaxy.', 'arid', 'desert', 10465, 23, 304, 200000),
	('pl_55r1wm3cuzq2', 'Alderaan', 'A peaceful world of grasslands and mountains, home of the Organa family.', 'temperate', 'grasslands, mountains', 12500, 24, 364, 2000000000),
	('pl_c7yj2h14p18g', 'Yavin IV', 'A jungle moon whose ancient temples hid the Rebel Alliance''s main base.', 'tropical', 'jungle, rainforests', 10200, 24, 4818, 1000),
	('pl_83j73ab9hgf6', 'Hoth', 'An ice planet where the Rebels hid in Echo Base, until the Empire found them.', 'frozen', 'tundra, ice caves, mountain ranges', 7200, 23, 549, NULL),
	('pl_tvw7lszq9ao5', 'Dagobah', 'A swamp world strong with the Force, where Yoda lived in exile.', 'murky', 'swamp, jungles', 8900, 23, 341, NULL),
	('pl_fjb88bph7v2u', 'Bespin', 'A gas giant whose Cloud City mines tibanna gas.', 'temperate', 'gas giant', 118000, 12, 5110, 6000000),
	('pl_sk57w00l3tc9', 'Endor', 'A forest moon, home of the Ewoks and the second Death Star''s shield generator.', 'temperate', 'forests, mountains, lakes', 4900, 18, 402, 30000000),
	('pl_4zg6u3mu52g2', 'Naboo', 'A lush world of rolling hills, with Gungan cities under its lakes.', 'temperate', 'grassy hills, swamps, forests, mountains', 12120, 26, 312, 4500000000),
	('pl_z68gtg0im8t6', 'Coruscant', 'A planet-wide city and the seat of galactic government.', 'temperate', 'cityscape, mountains', 12240, 24, 368, 1000000000000),
	('pl_tikfv3m35rk8', 'Kamino', 'An ocean world beyond the Outer Rim, where the clone army was grown.', 'temperate', 'ocean', 19720, 27, 463, 1000000000),
	('pl_4ezmopz1z5hf', 'Mustafar', 'A volcanic world of lava rivers, where Anakin Skywalker fell.', 'hot', 'volcanoes, lava rivers, mountains, caves', 4200, 36, 412, 20000),
	('pl_n2hfzrmufiet', 'Kashyyyk', 'A forest world of giant wroshyr trees, home of the Wookiees.', 'tropical', 'jungle, forests, lakes, rivers', 12765, 26, 381, 45000000),
	('pl_h9zmjnzjvjdr', 'Corellia', 'A shipbuilding world famous for its pilots and smugglers.', 'temperate', 'plains, urban, hills, forests', 11000, 25, 329, 3000000000);
--> statement-breakpoint
INSERT INTO "people" ("public_id", "homeworld_id", "name", "birth_year", "height_cm", "mass_kg")
SELECT person."public_id", planet."id", person."name", person."birth_year", person."height_cm", person."mass_kg"
FROM (VALUES
	('ppl_0gxh0i5njsoz', 'Luke Skywalker', '19BBY', 172, 77, 'pl_u4apge8ke3bq'),
	('ppl_aadbyr061pud', 'C-3PO', '112BBY', 167, 75, 'pl_u4apge8ke3bq'),
	('ppl_islo3mkrz4wy', 'R2-D2', '33BBY', 96, 32, 'pl_4zg6u3mu52g2'),
	('ppl_x9gwwdokwcfe', 'Darth Vader', '41.9BBY', 202, 136, 'pl_u4apge8ke3bq'),
	('ppl_7gb7j3d3v3vf', 'Leia Organa', '19BBY', 150, 49, 'pl_55r1wm3cuzq2'),
	('ppl_9qodffq5m04z', 'Owen Lars', '52BBY', 178, 120, 'pl_u4apge8ke3bq'),
	('ppl_3ccndfu37j3i', 'Han Solo', '29BBY', 180, 80, 'pl_h9zmjnzjvjdr'),
	('ppl_pf1i0sdaj68p', 'Chewbacca', '200BBY', 228, 112, 'pl_n2hfzrmufiet'),
	('ppl_qryy8bse96nq', 'Padmé Amidala', '46BBY', 165, 45, 'pl_4zg6u3mu52g2'),
	('ppl_9pjozmc0572g', 'Palpatine', '82BBY', 170, 75, 'pl_4zg6u3mu52g2'),
	('ppl_6vqakk2phonu', 'Boba Fett', '31.5BBY', 183, 78, 'pl_tikfv3m35rk8'),
	('ppl_zms5zy5ti49h', 'Wicket W. Warrick', '8BBY', 88, 20, 'pl_sk57w00l3tc9'),
	('ppl_5hltpcrwfqoa', 'Lobot', '37BBY', 175, 79, 'pl_fjb88bph7v2u')
) AS person ("public_id", "name", "birth_year", "height_cm", "mass_kg", "homeworld")
JOIN "planets" AS planet ON planet."public_id" = person."homeworld";
