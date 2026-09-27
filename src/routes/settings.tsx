import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/site/app-shell";
import { ExplorerSettingsModal } from "@/components/site/explorer-settings-modal";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Explorer Account Settings — ExploreTN" },
      {
        name: "description",
        content: "Manage your ExploreTN profile, AI trip planner preferences, saved collections, map styles, and ghat safety alert subscriptions.",
      },
    ],
  }),
  component: SettingsPageRoute,
});

function SettingsPageRoute() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="min-h-screen bg-[#09090b] py-12 px-4">
        <ExplorerSettingsModal
          isOpen={true}
          onClose={() => navigate({ to: "/" })}
          defaultTab="profile"
        />
      </div>
    </AppShell>
  );
}
