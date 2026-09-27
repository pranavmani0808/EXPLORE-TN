import React, { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  Globe,
  Radio,
  Clock,
  ArrowUpRight,
  Flame,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WeeklyDigestModule() {
  const [digestTitle, setDigestTitle] = useState("ExploreTN Weekly Highlights — Sep 21 - Sep 27");
  const [digestContent, setDigestContent] = useState(
    "12 new waterfall & hill stations added this week! Kolli Hills 70 Hairpin Pass and Suruli Waterfalls trending #1 among explorers."
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcastDigest = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      toast.success("Weekly Digest broadcasted to user homepage & mobile app feed!");
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Weekly Top Performance Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#09090b]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>WEEKLY ACTIVE USERS</span>
            <Users className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">4,820</span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center">
              <TrendingUp className="size-3" /> +18.4%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">vs previous 7 days</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#09090b]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>NEW SPOTS THIS WEEK</span>
            <MapPin className="size-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">14</span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center">
              <TrendingUp className="size-3" /> +6 New
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">Hills, Waterfalls & Heritage</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#09090b]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>TRIP PLANS GENERATED</span>
            <Sparkles className="size-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-400">1,480</span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center">
              <TrendingUp className="size-3" /> +24%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">AI Planner queries executed</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#09090b]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>WEEKLY QUERY RESOLUTION</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">99.2%</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">Support tickets resolved</div>
        </div>
      </div>

      {/* Main Split: Weekly Trending & Broadcast Composer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Top Weekly Trending Districts & Places */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-zinc-800 bg-[#09090b]/90 p-6 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              <Flame className="size-4 text-amber-400" />
              Weekly Top Trending Spots & Districts
            </span>
            <span className="text-xs font-mono text-zinc-400">Week 39 • 2026</span>
          </div>

          <div className="space-y-3">
            {[
              { rank: 1, name: "Kolli Hills 70 Hairpin Pass", district: "Namakkal", category: "hills", views: "14.2k views", growth: "+42%" },
              { rank: 2, name: "Meenakshi Amman Temple", district: "Madurai", category: "temples", views: "11.8k views", growth: "+18%" },
              { rank: 3, name: "Suruli Secret Cascades", district: "Theni", category: "waterfalls", views: "8.9k views", growth: "+65%" },
              { rank: 4, name: "Pamban Sea Bridge Viewpoint", district: "Rameswaram", category: "coastal", views: "7.4k views", growth: "+22%" },
              { rank: 5, name: "Valparai Loop Bends", district: "Coimbatore", category: "hills", views: "6.1k views", growth: "+31%" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-xl bg-amber-500/15 text-amber-400 font-mono font-bold text-xs">
                    #{item.rank}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-zinc-400">
                      {item.district} • <span className="text-emerald-400 capitalize">{item.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white">{item.views}</div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">{item.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weekly Broadcast Composer */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-zinc-800 bg-[#09090b]/90 p-6 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              <Radio className="size-4 text-emerald-400" />
              Weekly Product Digest Broadcaster
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
              Live Banner
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1">
                DIGEST TITLE
              </label>
              <input
                type="text"
                value={digestTitle}
                onChange={(e) => setDigestTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1">
                DIGEST BULLETIN CONTENT
              </label>
              <textarea
                rows={4}
                value={digestContent}
                onChange={(e) => setDigestContent(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-1">
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                PREVIEW BANNER ON USER HOMEPAGE:
              </div>
              <div className="text-xs font-bold text-white">{digestTitle}</div>
              <div className="text-xs text-emerald-200/90">{digestContent}</div>
            </div>

            <Button
              onClick={handleBroadcastDigest}
              disabled={isBroadcasting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-extrabold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Send className="size-4" />
              {isBroadcasting ? "Broadcasting Digest..." : "Broadcast Weekly Digest to Public App"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
