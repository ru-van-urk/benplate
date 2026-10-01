import { os } from "../orpc";
import { planetRouter } from "./planet";

export const appRouter = os.router({
  planet: planetRouter,
});
