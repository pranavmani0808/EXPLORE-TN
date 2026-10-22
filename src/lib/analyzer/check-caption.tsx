// src/lib/analyzer/check-caption.tsx
import { useEffect } from "react"
import { useRouter } from "@tanstack/react-router"

/**
 * Simple helper that checks if any image in the current React component tree
 * is missing an alt attribute. If so, it logs a warning to the console
 * and records a metric via an optional analytics hook.
 */
export function useAltCheck() {
  const router = useRouter()

  useEffect(() => {
    const images = document.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      console.warn(`✓ ${images.length} image(s) without alt text on ${window.location.pathname}`)
      // If you have an analytics function you can call here
      // exampleAnalytics('missing_alt', { count: images.length })
    }
    const unsubscribe = router.subscribe(() => {
      const imgs = document.querySelectorAll('img:not([alt])')
      if (imgs.length > 0) {
        console.warn(`✓ ${imgs.length} image(s) without alt text on ${window.location.pathname}`)
      }
    })
    return unsubscribe
  }, [router])
}
