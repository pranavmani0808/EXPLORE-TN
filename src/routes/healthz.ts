import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/healthz")({
  GET: async () => {
    return new Response(
      JSON.stringify({
        status: "Healthy",
        service: "ExplorerTN Core API",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  },
});
