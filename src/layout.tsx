// src/layout.tsx (partial) – add footer links and analytics integration
import { AnalyticsProvider } from "@vercel/analytics/react"
import Footer from "@/components/layout/Footer"

function App({ Component, pageProps }) {
  // Initialize Sentry (if DSN is provided)
  if (process.env.SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/react")
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [new (require("@sentry/react")).BrowserTracing()],
      tracesSampleRate: 1.0,
    })
  }
  // Track pageviews for analytics
  const router = require("@tanstack/react-router").useRouter()
  React.useEffect(() => {
    const logPageview = require("../lib/analytics").logPageview
    logPageview(router.state.location.pathname)
  }, [router.state.location.pathname])

  return (
    <AnalyticsProvider>
      <Component {...pageProps} />
      <Footer />
    </AnalyticsProvider>
  )
}
export default App
