import { planetContract } from "./planet";

// For the web forms, which validate with the same schemas as the API
export { newPlanetSchema, planetTypes } from "./planet";

export const appContract = {
  planet: planetContract,
};
