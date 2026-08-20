import { defineEventHandler, readBody } from "h3";
import { resolvePlace } from "../../../../../src/lib/data/canonical-places";

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const q = body.query || body.q || "Madurai";
  const resolved = resolvePlace(q) || {
    id: `p-${q.toLowerCase().replace(/\s+/g, "-")}`,
    name: q,
    display_name: `${q}, Tamil Nadu`,
    district: q,
    latitude: 9.9252,
    longitude: 78.1198,
    category: "city"
  };

  return {
    data: resolved,
    meta: { traceId: `tr-${Date.now()}`, timestamp: new Date().toISOString() }
  };
});
