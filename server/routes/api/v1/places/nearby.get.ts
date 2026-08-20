import { defineEventHandler, getQuery } from "h3";
import placesHandler from "./index.get";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const lat = parseFloat(query.lat as string || "9.9252");
  const lng = parseFloat(query.lng as string || "78.1198");
  const radius = parseFloat(query.radius as string || "50.0");

  const res: any = placesHandler(event);
  const places = res.data || [];

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const nearby = places.filter((p: any) => haversine(lat, lng, p.latitude, p.longitude) <= radius);

  return {
    data: nearby,
    count: nearby.length,
    meta: { traceId: `tr-${Date.now()}`, timestamp: new Date().toISOString() }
  };
});
