// src/lib/analytics.ts
/**
 * Very small analytics helper – replace with Plausible, Google Analytics, or
 * any other provider you prefer.
 */
export function logPageview(page: string) {
  if (!process.env.VITE_PLAUSIBLE_DOMAIN) return
  // Plausible uses a global `plausible` function; if not present do nothing.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  typeof plausible === "function" && plausible(page)
}

export function logError(error: Error | string, details?) {
  // Integrate with your chosen Sentry/Bugsnag SDK in a client‑side effect.
  /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  if (typeof Sentry !== "undefined") {
    Sentry.captureException(error, { extra: details })
  }
  // Fallback to console log
  console.error("Analytics‑error", error)
}
