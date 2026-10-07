import { os } from "../orpc";
import { personRouter } from "./person";
import { planetRouter } from "./planet";

export const appRouter = os.router({
  person: personRouter,
  planet: planetRouter,
});
