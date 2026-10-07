import { customAlphabet } from "nanoid";

const randomPart = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

// The id clients see (`/planets/pl_k3m9x0q2a7zd`), next to the private integer `id` that joins and foreign keys
// use. The prefix names the resource (`publicIdPrefixes` in @benplate/contract), and the `_` keeps a
// double-click selecting the whole id. 36^12 ≈ 4.7e18 values per prefix: at a million rows the chance of any
// collision is about 1 in 10 million, and a collision fails the insert on `<table>_public_id_unique` with a 500
export function newPublicId(prefix: string) {
  return `${prefix}_${randomPart()}`;
}
