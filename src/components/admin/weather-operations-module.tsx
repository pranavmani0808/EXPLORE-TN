import React, { useState } from "react";
import { motion } from "motion/react";
import {
  CloudRain,
  Radio,
  AlertTriangle,
  Zap,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  ShieldAlert,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function WeatherOperationsModule() {
  const [alertsDispatched, setAlertsDispatched] = useState<string[]>([]);

  const handleDispatchAlert = (district: string) => {
    setAlertsDispatched((prev) => [...prev, district]);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <CloudRain className="size-4" /> LIVE WEATHER OPERATIONS CENTER
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
            <Radio className="size-3 animate-pulse" /> Telemetry Stream Online
          </span>
        </div>
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "MONSOON RAINFALL", val: "84 mm/h", sub: "Kolli Hills Plateau", icon: CloudRain, color: "text-rose-400" },
          { label: "FOG VISIBILITY", val: "15 meters", sub: "Batlagundu Hairpins", icon: Eye, color: "text-amber-400" },
          { label: "WIND VELOCITY", val: "42 km/h", sub: "Nilgiris Summit Pass", icon: Wind, color: "text-blue-400" },
          { label: "WATERFALL DISCHARGE", val: "1,450 cusecs", sub: "Agaya Gangai Basin", icon: Droplets, color: "text-emerald-400" },
        ].map((m) => (
          <div key={m.label} className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase">{m.label}</span>
              <m.icon className={`size-5 ${m.color}`} />
            </div>
            <p className="text-2xl font-black text-white">{m.val}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Alert Rule Dispatch Engine */}
      <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <AlertTriangle className="size-5 text-amber-400" /> Weather Alert Rule Triggers & Route Closures
        </h3>

        <div className="space-y-3">
          {[
            { district: "Kolli Hills", condition: "Rainfall > 80mm/h", action: "Auto-hide unsafe hairpin route & notify saved explorers" },
            { district: "Valparai Plateau", condition: "Heavy Mist & Visibility < 20m", action: "Broadcast low visibility fog alert" },
          ].map((rule) => (
            <div key={rule.district} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-white">{rule.district} • {rule.condition}</p>
                <p className="text-xs text-slate-400 mt-0.5">{rule.action}</p>
              </div>

              {alertsDispatched.includes(rule.district) ? (
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-4" /> Broadcast Sent
                </span>
              ) : (
                <button
                  onClick={() => handleDispatchAlert(rule.district)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-md"
                >
                  <Bell className="size-3.5" /> Dispatch Alert
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
