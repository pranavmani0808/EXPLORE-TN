import { defineEventHandler, getQuery } from "h3";
import placesHandler from "./index.get";

export default defineEventHandler((event) => {
  return placesHandler(event);
});
