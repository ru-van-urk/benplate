import { createFileRoute } from "@tanstack/react-router";

import { NewPlanetPage } from "~/features/planets/new-planet-page";

export const Route = createFileRoute("/_app/planets/new")({
  component: NewPlanetPage,
});
