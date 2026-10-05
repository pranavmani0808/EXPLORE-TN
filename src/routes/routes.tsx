import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FullscreenRouteMap } from "@/components/site/fullscreen-route-map";

export const Route = createFileRoute("/routes")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      origin: (search.origin as string) || undefined,
      destination: (search.destination as string) || undefined,
      mode: (search.mode as "driving" | "flight" | "train" | "bus" | "motorcycle" | "walking" | "cycling") || undefined,
      area: (search.area as string) || undefined,
      place: (search.place as string) || undefined,
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
