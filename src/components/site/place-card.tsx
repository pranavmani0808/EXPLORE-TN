import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import type { Place } from "@/data/places";
import { cn } from "@/lib/utils";

import { SafeImage } from "@/components/ui/safe-image";

export function PlaceCard({ place, size = "md" }: { place: Place; size?: "md" | "lg" }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-elevate"
    >
      <Link to="/place/$slug" params={{ slug: place.slug }} className="block">
        <div className={cn("relative overflow-hidden", size === "lg" ? "h-80" : "h-56")}>
          <SafeImage
            src={place.image}
            category={place.category}
            alt={place.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
          <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium capitalize">
            {place.category}
          </span>
          <span className="glass absolute right-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-gold">
            <Star className="size-3 fill-current" aria-hidden /> {place.rating}
          </span>
        </div>
        <div className="relative -mt-10 space-y-1.5 p-5">
          <h3 className="font-display text-lg font-semibold leading-tight">{place.name}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" aria-hidden /> {place.district} · {place.distanceFromChennai} from Chennai
          </p>
          <p className="line-clamp-2 pt-1 text-sm text-muted-foreground">{place.tagline}</p>
          <span className="inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
            Explore <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
