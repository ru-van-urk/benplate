import { customAlphabet } from "nanoid";

// The id of every row and the id in every URL (`/planets/k3m9x0q2a7zd`). 36^12 ≈ 4.7e18 values: at a million
// rows the chance of any collision is about 1 in 10 million, and a collision fails the insert with a 500.
// Ids are random, not time-ordered: sort by `createdAt`
export const newId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);
