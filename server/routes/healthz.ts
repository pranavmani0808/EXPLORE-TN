import { defineEventHandler } from "h3";

export default defineEventHandler((event) => {
  return {
    status: "Healthy",
    service: "ExplorerTN Core API",
    timestamp: new Date().toISOString()
  };
});
