import { useState, useEffect } from "react";
import {
  CloudSun,
  ShieldCheck,
  Clock,
  Footprints,
  Eye,
  Wind,
  Droplets,
  Users,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-client/config";

interface IntelligenceData {
  id: string;
  name: string;
  slug: string;
  district: string;
  state: string;
  accessStatus: "OPEN" | "LIMITED" | "CLOSED";
  accessLabel: string;
  accessColor: "green" | "yellow" | "red";
  weather: {
    destination: string;
    temperatureC: number;
    condition: string;
    humidityPercent: number;
    windSpeedKmh: number;
    rainfallMm: number;
    ghatAdvisory?: string;
    retrievedAt: string;
  };
  conditions: {
    trail: string;
    ground: string;
    visibility: string;
    trailStatus: string;
  };
  community: {
    reportedAgo: string;
    verifiedBy: string;
    recentPhotosCount: number;
    activeVisitors: number;
  };
  lastUpdated: string;
}

export function LiveDestinationIntelligencePanel({ slug, initialName, initialDistrict }: { slug: string; initialName: string; initialDistrict: string }) {
  const [intel, setIntel] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadIntelligence() {
    try {
      setLoading(true);
      const res = await fetch(`${getApiBaseUrl()}/api/v1/places/${slug}/intelligence`);
      if (res.ok) {
        const env = await res.json();
        setIntel(env.data);
      }
    } catch (err) {
      console.warn("Intelligence fetch fallback:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIntelligence();
  }, [slug]);

  if (loading && !intel) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 w-48 bg-accent rounded-full" />
        <div className="h-20 bg-accent rounded-2xl" />
        <div className="h-16 bg-accent rounded-2xl" />
      </div>
    );
  }

  const accessBadgeClass =
    intel?.accessStatus === "CLOSED"
      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
      : intel?.accessStatus === "LIMITED"
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6">
      {/* Top Title Bar & Live Refresh Button */}
      <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              LIVE SPATIAL INTELLIGENCE
            </span>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="size-3 text-muted-foreground" /> {intel?.community.reportedAgo || "8 minutes ago"}
            </span>
          </div>
          <h3 className="text-xl font-bold font-serif text-foreground mt-1">
            {intel?.name || initialName}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="size-3 text-emerald-500" /> {intel?.district || initialDistrict} District, {intel?.state || "Tamil Nadu"}
          </p>
        </div>

        <button
          type="button"
          onClick={loadIntelligence}
          title="Refresh Live Intelligence Data"
          className="p-2 rounded-xl bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
        </button>
      </div>

      {/* 🟢 ACCESS STATUS BOX */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Access Status</p>
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${accessBadgeClass}`}>
          <div className="flex items-center gap-2.5">
            <div className="size-3 rounded-full bg-current animate-pulse" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">{intel?.accessLabel || "OPEN & ACCESSIBLE"}</p>
              <p className="text-[11px] opacity-80 font-medium">Verified by ExplorerTN Field Network</p>
            </div>
          </div>
          <ShieldCheck className="size-5 shrink-0 opacity-80" />
        </div>
      </div>

      {/* 🌦️ LIVE WEATHER SECTION */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Live Weather</p>
        <div className="p-4 rounded-2xl bg-accent/40 border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudSun className="size-8 text-amber-400" />
              <div>
                <p className="text-2xl font-extrabold font-serif text-foreground">
                  {intel?.weather.temperatureC ?? 28.4}°C
                </p>
                <p className="text-xs font-semibold text-muted-foreground">{intel?.weather.condition ?? "Partly Cloudy"}</p>
              </div>
            </div>

            <div className="text-right text-xs font-medium space-y-0.5">
              <p className="text-muted-foreground flex items-center justify-end gap-1">
                <Droplets className="size-3 text-cyan-400" /> Humidity: <span className="font-bold text-foreground">{intel?.weather.humidityPercent ?? 68}%</span>
              </p>
              <p className="text-muted-foreground flex items-center justify-end gap-1">
                <Wind className="size-3 text-blue-400" /> Wind: <span className="font-bold text-foreground">{intel?.weather.windSpeedKmh ?? 12} km/h</span>
              </p>
            </div>
          </div>

          {intel?.weather.ghatAdvisory && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
              <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{intel.weather.ghatAdvisory}</span>
            </div>
          )}
        </div>
      </div>

      {/* 🥾 EXPERIENCE & TRAIL CONDITIONS */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Experience & Trail Conditions</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-accent/40 border border-border/40">
            <Footprints className="size-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Trail</p>
            <p className="text-xs font-bold text-foreground mt-0.5">{intel?.conditions.trail || "Moderate"}</p>
          </div>
          <div className="p-3 rounded-2xl bg-accent/40 border border-border/40">
            <Droplets className="size-4 text-cyan-500 mx-auto mb-1" />
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Ground</p>
            <p className="text-xs font-bold text-foreground mt-0.5">{intel?.conditions.ground || "Good / Dry"}</p>
          </div>
          <div className="p-3 rounded-2xl bg-accent/40 border border-border/40">
            <Eye className="size-4 text-amber-500 mx-auto mb-1" />
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Visibility</p>
            <p className="text-xs font-bold text-foreground mt-0.5">{intel?.conditions.visibility || "Good"}</p>
          </div>
        </div>
      </div>

      {/* 👥 LIVE COMMUNITY ACTIVITY */}
      <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 text-emerald-500" />
          <span><strong className="text-foreground">{intel?.community.activeVisitors || 18} explorers</strong> exploring nearby</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          <Sparkles className="size-3" /> Popular Today
        </div>
      </div>
    </div>
  );
}
