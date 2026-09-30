CREATE TABLE `planets` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`description` text,
	`type` text NOT NULL,
	`moons` integer DEFAULT 0 NOT NULL,
	`diameterKm` integer NOT NULL,
	`distanceFromSunAu` real NOT NULL,
	`orbitalPeriodDays` real NOT NULL
);
