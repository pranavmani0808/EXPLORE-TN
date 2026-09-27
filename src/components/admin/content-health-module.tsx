import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Image as ImageIcon,
  CloudRain,
  Route as RouteIcon,
  Clock,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { SupabaseDatabaseRepository, SupabasePlaceRecord } from "@/lib/supabase-database";

export interface DistrictHealth {
  district: string;
  totalPlaces: number;
  verifiedPlaces: number;
  missingMedia: number;
  coveragePercent: number;
}

export function ContentHealthModule() {
  const [places, setPlaces] = useState<SupabasePlaceRecord[]>([]);
  const [districtHealthList, setDistrictHealthList] = useState<DistrictHealth[]>([]);

  useEffect(() => {
    async function loadHealth() {
      const allPlaces = await SupabaseDatabaseRepository.getPublicPlaces();
      setPlaces(allPlaces);

      // Group places by district dynamically
      const groupMap = new Map<string, { total: number; verified: number; missingMedia: number }>();

      allPlaces.forEach((p) => {
        const dist = p.district || "Madurai";
        const current = groupMap.get(dist) || { total: 0, verified: 0, missingMedia: 0 };
        current.total += 1;
        if (p.is_verified) current.verified += 1;
        if (!p.image_url) current.missingMedia += 1;
        groupMap.set(dist, current);
      });

      const list: DistrictHealth[] = Array.from(groupMap.entries()).map(([district, stats]) => ({
        district,
        totalPlaces: stats.total,
        verifiedPlaces: stats.verified,
        missingMedia: stats.missingMedia,
        coveragePercent: Math.round((stats.verified / stats.total) * 100),
      }));

      setDistrictHealthList(list);
    }
    loadHealth();
  }, []);

  const totalPlaces = places.length;
  const verifiedCount = places.filter((p) => p.is_verified).length;
  const missingMediaCount = places.filter((p) => !p.image_url).length;
  const coverageRate = totalPlaces > 0 ? Math.round((verifiedCount / totalPlaces) * 100) : 100;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <Activity className="size-4" /> TAMIL NADU CONTENT HEALTH & DATA PIPELINE
          </span>
          <span className="text-xs font-mono text-slate-400">Primary Database Telemetry Probe</span>
        </div>
      </div>

      {/* District Coverage Metric Bar */}
      <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-white">Database Verification Coverage</span>
          <span className="text-emerald-400 font-bold">
            {verifiedCount} / {totalPlaces} Places Verified ({coverageRate}%)
          </span>
        </div>

        <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15">
          <div
            className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40 transition-all duration-500"
            style={{ width: `${coverageRate}%` }}
          />
        </div>
      </div>

      {/* Content Health Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl text-white">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[9px] font-mono font-bold uppercase truncate">TOTAL PLACES</span>
            <MapPin className="size-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalPlaces}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Primary Supabase DB</p>
        </div>

        <div className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl text-white">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[9px] font-mono font-bold uppercase truncate">VERIFIED NODES</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{verifiedCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Publicly visible</p>
        </div>

        <div className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl text-white">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[9px] font-mono font-bold uppercase truncate">MISSING IMAGES</span>
            <ImageIcon className="size-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400">{missingMediaCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Needs image upload</p>
        </div>

        <div className="bg-[#121821] border border-white/15 rounded-2xl p-4 shadow-xl text-white">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[9px] font-mono font-bold uppercase truncate">DISTRICT COUNT</span>
            <Compass className="size-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{districtHealthList.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active in database</p>
        </div>
      </div>

      {/* District Content Health Audit Table */}
      <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Compass className="size-5 text-emerald-400" /> District Data Health Breakdown
          </h3>
          <span className="text-xs font-mono text-slate-400">{districtHealthList.length} Districts Audited</span>
        </div>

        <div className="overflow-x-auto border border-white/10 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-400">
                <th className="p-4">DISTRICT</th>
                <th className="p-4">TOTAL PLACES</th>
                <th className="p-4">VERIFIED NODES</th>
                <th className="p-4">MISSING MEDIA</th>
                <th className="p-4">COVERAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {districtHealthList.map((d) => (
                <tr key={d.district} className="hover:bg-white/5 transition">
                  <td className="p-4 font-bold text-white">{d.district}</td>
                  <td className="p-4 text-slate-300">{d.totalPlaces}</td>
                  <td className="p-4 text-emerald-400 font-bold">{d.verifiedPlaces}</td>
                  <td className="p-4 text-purple-400">{d.missingMedia}</td>
                  <td className="p-4 text-emerald-400 font-bold">{d.coveragePercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
