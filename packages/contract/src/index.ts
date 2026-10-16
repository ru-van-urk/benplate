import { personContract } from "./person";
import { planetContract } from "./planet";

// For the web forms, which validate with the same schemas as the API
export { newPersonSchema } from "./person";
export { climates, newPlanetSchema } from "./planet";

export const appContract = {
  person: personContract,
  planet: planetContract,
};
