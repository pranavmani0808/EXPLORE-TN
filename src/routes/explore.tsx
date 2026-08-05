import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DedicatedMapModal } from "@/components/site/dedicated-map-modal";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Full Screen Map — ExplorerTN" },
      {
        name: "description",
        content:
          "Dedicated 100% full screen spatial map view of Tamil Nadu. Real geographic map tiles, mountain passes, waterfalls and trails.",
      },
    ],
  }),
  component: FullScreenExplorePage,
});

function FullScreenExplorePage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <DedicatedMapModal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        window.location.href = "/";
      }}
    />
  );
}
