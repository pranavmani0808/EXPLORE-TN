import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MapPin, Star } from "lucide-react";
import { places, type Place } from "@/data/places";
import { cn } from "@/lib/utils";

/**
 * Stylized, animated Tamil Nadu map. Pure SVG + absolutely positioned markers,
 * so it stays fast, themable and SSR-safe.
 */
const TN_PATH =
  "M139,8 C160,18 176,34 181,56 C186,78 178,96 172,116 C166,136 168,152 160,172 C152,192 150,214 138,238 C126,262 118,286 104,308 C92,327 82,344 70,352 C58,360 46,352 44,336 C42,320 50,306 48,290 C46,272 34,262 28,246 C22,230 26,212 22,194 C18,176 6,164 8,146 C10,128 26,120 34,104 C42,88 40,70 52,54 C64,38 84,32 100,22 C114,13 126,2 139,8 Z";

export function TamilNaduMap({
  activeCategories,
  className,
  compact = false,
}: {
  activeCategories?: string[];
  className?: string;
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState<Place | null>(null);
  const visible = places.filter(
    (p) => !activeCategories?.length || activeCategories.includes(p.category),
  );

  return (
    <div className={cn("relative aspect-[3/4] w-full select-none", className)}>
      <svg viewBox="0 0 200 380" className="size-full overflow-visible" role="img" aria-label="Map of Tamil Nadu">
        <defs>
          <linearGradient id="tn-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--ocean)" stopOpacity="0.45" />
            <stop offset="55%" stopColor="var(--forest)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--sunset)" stopOpacity="0.32" />
          </linearGradient>
        </defs>
        <motion.path
          d={TN_PATH}
          fill="url(#tn-fill)"
          stroke="var(--emerald-glow)"
          strokeWidth="1.4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />
        <motion.path
          d={TN_PATH}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="0.6"
          strokeDasharray="6 10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.6, duration: 1 }}
        />
      </svg>

      {visible.map((p, i) => (
        <div
          key={p.slug}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          onMouseEnter={() => setHovered(p)}
          onMouseLeave={() => setHovered(null)}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 + i * 0.09, type: "spring", stiffness: 260, damping: 18 }}
          >
            <Link
              to="/place/$slug"
              params={{ slug: p.slug }}
              className="relative grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-2 focus-visible:outline-ring"
              aria-label={p.name}
            >
              <span className="absolute inset-0 animate-marker-pulse rounded-full bg-primary/60" aria-hidden />
              <MapPin className="relative size-4" aria-hidden />
            </Link>
          </motion.div>
        </div>
      ))}

      {hovered && !compact && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong pointer-events-none absolute z-20 w-56 overflow-hidden rounded-2xl shadow-elevate"
          style={{
            left: `min(${hovered.x}%, 60%)`,
            top: `calc(${hovered.y}% + 20px)`,
          }}
        >
          <img src={hovered.image} alt="" className="h-24 w-full object-cover" loading="lazy" />
          <div className="p-3">
            <p className="font-display text-sm font-semibold">{hovered.name}</p>
            <p className="text-xs text-muted-foreground">{hovered.district}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-gold">
              <Star className="size-3 fill-current" aria-hidden /> {hovered.rating} · {hovered.reviews} reviews
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
