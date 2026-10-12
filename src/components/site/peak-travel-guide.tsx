import { Link } from "@tanstack/react-router";
import { Calendar, Sun, CloudRain, Snowflake, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SeasonConfig {
  id: "summer-peak" | "monsoon-peak" | "winter-peak";
  season: string;
  monthsLabel: string;
  startMonth: number; // 1-indexed
  endMonth: number; // 1-indexed
  isCrossYear?: boolean; // for Oct-Mar (months 10..12 and 1..3)
  labelForOther: string;
  color: string;
  badgeColor: string;
  icon: typeof Snowflake;
  temp: string;
  tagline: string;
  destinations: { name: string; district: string; slug: string }[];
  highlights: string[];
}

export const PEAK_SEASONS_CONFIG: SeasonConfig[] = [
  {
    id: "summer-peak",
    season: "Summer Altitude Escapes",
    monthsLabel: "April — June",
    startMonth: 4,
    endMonth: 6,
    labelForOther: "Best for Summer Escapes",
    color: "from-sky-50 via-sky-100/50 to-white border-sky-200",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    icon: Sun,
    temp: "Hills: 12°C — 20°C",
    tagline: "Cloud forest ridge treks, 70-hairpin passes & cool tea estates",
    destinations: [
      { name: "Kodaikanal Lake & Sholas", district: "Dindigul", slug: "kodaikanal" },
      { name: "Ooty & Doddabetta Peak", district: "The Nilgiris", slug: "ooty" },
      { name: "Meghamalai Tea Estates", district: "Theni", slug: "theni" },
      { name: "Piranmalai Summit", district: "Sivaganga", slug: "piranmalai" },
    ],
    highlights: ["Shola forest shade", "Mountain cycling", "Highland fruit harvests"],
  },
  {
    id: "monsoon-peak",
    season: "Monsoon Cascade Peak",
    monthsLabel: "July — September",
    startMonth: 7,
    endMonth: 9,
    labelForOther: "Best for Monsoons",
    color: "from-sky-100/70 via-blue-50 to-white border-sky-200",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    icon: CloudRain,
    temp: "Ghats: 18°C — 26°C",
    tagline: "Roaring Western Ghats cascades & lush rubber estate rain trails",
    destinations: [
      { name: "Suruli Waterfalls", district: "Theni", slug: "theni" },
      { name: "Valli Chunai Falls", district: "Kanyakumari", slug: "valli-chunai-falls" },
      { name: "Perunchilambu Stream", district: "Kanyakumari", slug: "perunchilambu-stream-falls" },
      { name: "Mathoor Aqueduct", district: "Kanyakumari", slug: "mathoor-aqueduct" },
    ],
    highlights: ["Full river discharge", "Coracle boat rides", "Mist-covered tea slopes"],
  },
  {
    id: "winter-peak",
    season: "Winter & Heritage Peak",
    monthsLabel: "October — March",
    startMonth: 10,
    endMonth: 3,
    isCrossYear: true,
    labelForOther: "Best for Winter & Heritage",
    color: "from-blue-50 via-sky-50 to-white border-sky-200",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Snowflake,
    temp: "Plains & Coast: 16°C — 28°C",
    tagline: "Cool mornings, clear coastal waters & pleasant temple walks",
    destinations: [
      { name: "Meenakshi Temple", district: "Madurai", slug: "meenakshi-amman-temple" },
      { name: "Mahabalipuram Monuments", district: "Chengalpattu", slug: "mahabalipuram" },
      { name: "Tiruvannamalai Temple", district: "Tiruvannamalai", slug: "tiruvannamalai-temple" },
      { name: "Vedanthangal Sanctuary", district: "Chengalpattu", slug: "vedanthangal-bird-sanctuary" },
    ],
    highlights: ["Migratory bird arrival", "Heritage temple walks", "Giri Pradakshina Walks"],
  },
];

export function PeakTravelGuide() {
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="rounded-4xl bg-white border border-sky-100 p-6 sm:p-10 shadow-xl space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 mb-2">
              <Calendar className="size-3.5" /> PEAK TRAVEL CALENDAR
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900">
              Peak Travel Seasons in Tamil Nadu
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Plan your travel around real-time seasonal peaks — from monsoon waterfalls to winter cloud forests.
            </p>
          </div>

          <Link
            to="/explore"
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
          >
            <span>Explore All Seasonal Destinations</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 3 Seasonal Peak Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PEAK_SEASONS_CONFIG.map((season) => {
            const Icon = season.icon;
            let isCurrentSeason = false;
            if (season.isCrossYear) {
              isCurrentSeason = currentMonth >= season.startMonth || currentMonth <= season.endMonth;
            } else {
              isCurrentSeason = currentMonth >= season.startMonth && currentMonth <= season.endMonth;
            }

            const badgeText = isCurrentSeason ? "🔥 Current Season" : season.labelForOther;

            return (
              <div
                key={season.id}
                className={`rounded-3xl border bg-gradient-to-b ${season.color} p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${season.badgeColor}`}>
                      {badgeText}
                    </span>
                    <span className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1">
                      <Icon className="size-3.5" /> {season.temp}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-slate-900">{season.season}</h3>
                  <p className="text-xs font-semibold text-sky-600 mt-0.5">{season.monthsLabel}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{season.tagline}</p>

                  {/* Highlights List */}
                  <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-200/60">
                    <p className="text-xs font-mono font-bold text-slate-500">Seasonal Highlights:</p>
                    {season.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                        <Sparkles className="size-3 text-sky-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Spots */}
                <div className="pt-4 border-t border-slate-200/60 space-y-2">
                  <p className="text-xs font-mono font-bold text-slate-500">Top Destinations:</p>
                  <div className="space-y-1">
                    {season.destinations.map((spot) => (
                      <Link
                        key={spot.name}
                        to="/place/$slug"
                        params={{ slug: spot.slug }}
                        className="flex items-center justify-between text-xs font-semibold hover:text-sky-600 transition py-2 px-2.5 rounded-xl hover:bg-sky-50 border border-transparent hover:border-sky-200 min-h-[36px]"
                      >
                        <span className="leading-tight flex-1 text-left font-medium text-slate-800">{spot.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono shrink-0 ml-2">
                          {spot.district}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
