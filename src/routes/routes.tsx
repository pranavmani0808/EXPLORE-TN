import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FullscreenRouteMap } from "@/components/site/fullscreen-route-map";

const ALLOWED_TRAVEL_MODES = ["driving", "flight", "train", "bus", "motorcycle", "walking", "cycling"] as const;
type TravelMode = (typeof ALLOWED_TRAVEL_MODES)[number];

export const Route = createFileRoute("/routes")({
  validateSearch: (search: Record<string, unknown>) => {
    const rawMode = typeof search.mode === "string" ? search.mode.toLowerCase() : undefined;
    const validatedMode: TravelMode | undefined =
      rawMode && (ALLOWED_TRAVEL_MODES as readonly string[]).includes(rawMode)
        ? (rawMode as TravelMode)
        : undefined;

    return {
      origin: typeof search.origin === "string" && search.origin.trim().length > 0 ? search.origin.trim() : undefined,
      destination:
        typeof search.destination === "string" && search.destination.trim().length > 0
          ? search.destination.trim()
          : undefined,
      mode: validatedMode,
      area: typeof search.area === "string" && search.area.trim().length > 0 ? search.area.trim() : undefined,
      place: typeof search.place === "string" && search.place.trim().length > 0 ? search.place.trim() : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Immersive Fullscreen Route & Map Explorer — ExploreTN" },
      {
        name: "description",
        content:
          "Geospatial area & route explorer for Tamil Nadu: City & district boundaries, POI discovery, live GPS detection, real road network geometry, distance & ETA calculations.",
      },
      { property: "og:title", content: "Fullscreen Route & Map Explorer — ExploreTN" },
      {
        property: "og:description",
        content: "Geospatial area exploration and dynamic road network routing across Tamil Nadu.",
      },
      {
        property: "og:image",
        content: "https://explore-tn-ochre.vercel.app/assets/madurai-hero-temple.jpg",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:image",
        content: "https://explore-tn-ochre.vercel.app/assets/madurai-hero-temple.jpg",
      },
    ],
  }),
  component: RoutesPage,
});

function RoutesPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  return (
    <FullscreenRouteMap
      isOpen={true}
      onClose={() => navigate({ to: "/explore" })}
      initialOriginPlaceId={search.origin}
      initialDestinationPlaceId={search.destination}
      initialTravelMode={search.mode}
      initialArea={search.area}
      initialPlaceId={search.place}
    />
  );
}
