import { initLogger } from "evlog";

// Every module that logs imports `log` from here, so the logger is initialised before anything logs,
// even env.ts rejecting the environment. Pretty in development, one JSON line per event in production
initLogger({ env: { service: "server" } });

export { log } from "evlog";
