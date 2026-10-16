// The API sends a `bigint` population as a string of digits; BigInt formats it without losing precision
export const formatPopulation = (population: string | null) =>
  population === null ? "unknown" : BigInt(population).toLocaleString("en-US");
