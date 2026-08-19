import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FullscreenRouteMap } from "@/components/site/fullscreen-route-map";

export const Route = createFileRoute("/routes")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      origin: (search.origin as string) || undefined,
      destination: (search.destination as string) || undefined,
      mode: (search.mode as "driving" | "motorcycle" | "walking" | "cycling") || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Immersive Fullscreen Route Explorer — ExplorerTN" },
      {
        name: "description",
        content:
          "Map-first spatial route planner for Tamil Nadu: Client-aware origin resolution, live GPS detection, real road network geometry, distance & ETA calculations.",
      },
      { property: "og:title", content: "Fullscreen Route Explorer — ExplorerTN" },
      {
        property: "og:description",
        content: "Dynamic road network routing across Tamil Nadu, Karnataka, and South India.",
      },
    ],
  }),
  component: RoutesPage,
});

export function RoutesPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  return (
    <FullscreenRouteMap
      isOpen={true}
      onClose={() => navigate({ to: "/explore" })}
      initialOriginPlaceId={search.origin}
      initialDestinationPlaceId={search.destination}
      initialTravelMode={search.mode}
    />
  );
}
