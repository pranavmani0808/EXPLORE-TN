import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Image,
  CloudRain,
  Route as RouteIcon,
  Clock,
  ShieldCheck,
  Compass,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DistrictHealth {
  district: string;
  totalPlaces: number;
  verifiedPlaces: number;
  missingMedia: number;
  brokenRoutes: number;
  coveragePercent: number;
}

const initialDistrictHealth: DistrictHealth[] = [
  { district: "Theni", totalPlaces: 42, verifiedPlaces: 40, missingMedia: 2, brokenRoutes: 0, coveragePercent: 95 },
  { district: "Namakkal", totalPlaces: 38, verifiedPlaces: 35, missingMedia: 3, brokenRoutes: 1, coveragePercent: 92 },
  { district: "Nilgiris", totalPlaces: 64, verifiedPlaces: 58, missingMedia: 6, brokenRoutes: 2, coveragePercent: 90 },
  { district: "Coimbatore", totalPlaces: 52, verifiedPlaces: 46, missingMedia: 4, brokenRoutes: 0, coveragePercent: 88 },
  { district: "Dindigul", totalPlaces: 45, verifiedPlaces: 39, missingMedia: 5, brokenRoutes: 1, coveragePercent: 86 },
  { district: "Ramanathapuram", totalPlaces: 31, verifiedPlaces: 25, missingMedia: 6, brokenRoutes: 1, coveragePercent: 80 },
];

export function ContentHealthModule() {
  const [districts] = useState<DistrictHealth[]>(initialDistrictHealth);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <Activity className="size-4" /> TAMIL NADU CONTENT HEALTH & DATA PIPELINE
          </span>
          <span className="text-xs font-mono text-slate-400">Target: 1,000 Verified Nodes across 38 Districts</span>
        </div>
      </div>

      {/* Tamil Nadu 38 District Coverage Progress Bar */}
      <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-white">38 Districts Coverage Metric</span>
          <span className="text-emerald-400 font-bold">842 / 1,000 Places Verified (84.2%)</span>
        </div>

        <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15">
          <div className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40 w-[84%]" />
        </div>
      </div>

      {/* Content Health Actionable Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        {[
          { label: "VERIFIED PLACES", val: "842", sub: "+18 this week", color: "text-emerald-400", icon: CheckCircle2 },
          { label: "NEEDS REVIEW", val: "41", sub: "Pending manager QA", color: "text-amber-400", icon: Clock },
          { label: "MISSING IMAGES", val: "93", sub: "Needs HD photos", color: "text-purple-400", icon: Image },
          { label: "OUTDATED WEATHER", val: "12", sub: "Stale telemetry", color: "text-blue-400", icon: CloudRain },
          { label: "BROKEN ROUTES", val: "5", sub: "Needs GPX audit", color: "text-rose-400", icon: RouteIcon },
          { label: "PENDING APPROVAL", val: "17", sub: "Queued for publish", color: "text-teal-400", icon: ShieldCheck },
        ].map((c) => (
          <div key={c.label} className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl text-white">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[9px] font-mono font-bold uppercase truncate">{c.label}</span>
              <c.icon className={`size-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-black text-white">{c.val}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* District Content Health Audit Table */}
      <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Compass className="size-5 text-emerald-400" /> District Data Health Breakdown
          </h3>
          <span className="text-xs font-mono text-slate-400">38 Districts Audited</span>
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-mono">
                <th className="p-4">DISTRICT</th>
                <th className="p-4">TOTAL PLACES</th>
                <th className="p-4">VERIFIED NODES</th>
                <th className="p-4">MISSING MEDIA</th>
                <th className="p-4">BROKEN ROUTES</th>
                <th className="p-4">HEALTH SCORE</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {districts.map((d) => (
                <tr key={d.district} className="hover:bg-white/5 transition">
                  <td className="p-4 font-bold text-white font-sans">{d.district}</td>
                  <td className="p-4 text-slate-300">{d.totalPlaces} Places</td>
                  <td className="p-4 text-emerald-400 font-bold">{d.verifiedPlaces} Verified</td>
                  <td className="p-4 text-purple-300">{d.missingMedia} Files</td>
                  <td className="p-4 text-rose-400 font-bold">{d.brokenRoutes} Issues</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded-full text-[10px]">
                      {d.coveragePercent}%
                    </span>
                  </td>
                  <td className="p-4 text-right font-sans">
                    <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1 ml-auto">
                      Audit District <ArrowRight className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
