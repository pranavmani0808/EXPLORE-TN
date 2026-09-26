import { useEffect, useState, useRef, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export function GsapGlobalProvider({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
  }, []);

  // Smooth Route Change Transition (Post-Hydration Only)
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const raf = requestAnimationFrame(() => {
      try {
        ScrollTrigger.refresh();
      } catch (e) {
        // Safe fallback
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname, mounted]);

  // Global ScrollTrigger Animations (Scoped & Post-Hydration)
  useGSAP(
    () => {
      if (!mounted || typeof window === "undefined") return;

      try {
        // Section Entrance Reveal (Play once, unbind scroll listener for maximum FPS)
        const sections = gsap.utils.toArray<HTMLElement>(".gsap-section");
        sections.forEach((sec) => {
          gsap.from(sec, {
            scrollTrigger: {
              trigger: sec,
              start: "top 90%",
              once: true,
            },
            opacity: 0,
            y: 20,
            duration: 0.45,
            ease: "power2.out",
          });
        });

        // Cards Batch Reveal
        ScrollTrigger.batch(".gsap-card, .gsap-stagger-card", {
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                stagger: 0.06,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto",
              }
            );
          },
          start: "top 92%",
          once: true,
        });
      } catch (err) {
        console.warn("GSAP ScrollTrigger notice:", err);
      }
    },
    { scope: containerRef, dependencies: [pathname, mounted] }
  );

  return (
    <div ref={containerRef} className="gsap-global-root w-full">
      {children}
    </div>
  );
}
