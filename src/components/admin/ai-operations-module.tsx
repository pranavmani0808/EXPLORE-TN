import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Cpu, Activity, DollarSign, Database, RefreshCcw, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AIOperationsModule() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <Sparkles className="size-4" /> GEMINI AI EXPEDITION CONTROL ROOM
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">Model Version: Gemini 1.5 Pro</span>
        </div>
      </div>

      {/* AI Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
          <p className="text-[10px] text-slate-400 font-bold uppercase">TODAY'S API COST</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">₹412.50</p>
          <p className="text-[10px] text-slate-400 mt-1">This Month: ₹8,912</p>
        </div>
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
          <p className="text-[10px] text-slate-400 font-bold uppercase">TOKEN CONSUMPTION</p>
          <p className="text-2xl font-black text-white mt-1">1.2M Tokens</p>
          <p className="text-[10px] text-emerald-400 mt-1">● 99.8% Prompt Success</p>
        </div>
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
          <p className="text-[10px] text-slate-400 font-bold uppercase">CACHE HIT RATE</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">73.4%</p>
          <p className="text-[10px] text-slate-400 mt-1">Redis Vector Cache</p>
        </div>
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
          <p className="text-[10px] text-slate-400 font-bold uppercase">AVG LATENCY</p>
          <p className="text-2xl font-black text-white mt-1">412 ms</p>
          <p className="text-[10px] text-slate-400 mt-1">FastAPI Uvicorn</p>
        </div>
      </div>

      {/* AI Prompt Management & Job Queue */}
      <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Cpu className="size-5 text-emerald-400" /> Active System Prompt Version & Job Queue
          </h3>
          <span className="text-xs font-mono text-slate-400">Prompt v12.4 Active</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-white">Trip Planner & Spatial Route Generator Prompt</span>
              <span className="text-emerald-400">v12.4 (Active)</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              System instruction enforces local Tamil Nadu ghat safety rules, monsoon water discharge limits, and hairpin climbing speeds.
            </p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Live Job Queue Execution</p>
              <p className="text-slate-400 text-[11px]">Generating itinerary for rider in Salem • ETA 4 sec</p>
            </div>
            <span className="text-emerald-400 font-bold animate-pulse">● Running (34%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
