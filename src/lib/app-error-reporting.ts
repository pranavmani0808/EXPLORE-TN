/**
 * ExploreTN Application Error Logger
 * Handles runtime uncaught exceptions and logs diagnostic information.
 */

export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[ExploreTN Error]", error, context);
}
