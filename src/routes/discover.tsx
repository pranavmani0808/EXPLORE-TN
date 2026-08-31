import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DedicatedMapModal } from "@/components/site/dedicated-map-modal";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Explore Full Screen Spatial Map — ExplorerTN" },
      {
        name: "description",
        content:
          "Dedicated 100% full screen spatial map view of Tamil Nadu. Real geographic map tiles, mountain passes, waterfalls and trails.",
      },
    ],
  }),
  component: FullScreenDiscoverPage,
});

function FullScreenDiscoverPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DedicatedMapModal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        window.location.href = "/explore";
      }}
    />
  );
}
