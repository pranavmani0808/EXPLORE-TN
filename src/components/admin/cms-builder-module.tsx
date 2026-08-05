import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Sparkles,
  Layout,
  Clock,
  Globe,
  GripVertical,
  Check,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CMSBlock {
  id: string;
  type: "hero" | "trending" | "categories" | "featured_routes" | "story";
  title: string;
  enabled: boolean;
}

const initialBlocks: CMSBlock[] = [
  { id: "b-1", type: "hero", title: "Hero Spotlight — Western Ghats Expedition", enabled: true },
  { id: "b-2", type: "trending", title: "🔥 Trending Explorer Destinations", enabled: true },
  { id: "b-3", type: "categories", title: "District & Activity Categories", enabled: true },
  { id: "b-4", type: "featured_routes", title: "🛣️ Featured Hairpin Ghat Routes", enabled: true },
  { id: "b-5", type: "story", title: "Rider Story: Suruli Secret Basin Run", enabled: true },
];

export function CMSBuilderModule() {
  const [blocks, setBlocks] = useState<CMSBlock[]>(initialBlocks);
  const [activeTab, setActiveTab] = useState<"homepage" | "stories">("homepage");

  const toggleBlock = (id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* CMS Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <Layout className="size-4" /> VISUAL CMS & HOMEPAGE BUILDER
          </span>
          <div className="flex gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab("homepage")}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === "homepage" ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-300"
              }`}
            >
              Homepage Layout Blocks
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === "stories" ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-300"
              }`}
            >
              Travel Stories & Guides
            </button>
          </div>
        </div>

        <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20">
          <Plus className="size-4 mr-1" /> Add New Visual Block
        </Button>
      </div>

      {/* Homepage Blocks Editor */}
      {activeTab === "homepage" && (
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Layers className="size-5 text-emerald-400" /> Active Homepage Block Ordering
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">● Published Layout v3.4</span>
          </div>

          <div className="space-y-3">
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="size-5 text-slate-400 cursor-grab" />
                  <span className="size-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-white">{block.title}</p>
                    <p className="text-xs text-slate-400 font-mono">Block Type: {block.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleBlock(block.id)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                      block.enabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {block.enabled ? "ACTIVE" : "HIDDEN"}
                  </button>
                  <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 font-bold text-xs rounded-xl">
                    Configure Block →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stories List Editor */}
      {activeTab === "stories" && (
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Monsoon Waterfalls Run: Kolli Hills to Suruli", author: "Arun Kumar", status: "Published", date: "Aug 02, 2026" },
              { title: "Riding 40 Hairpins to Sholayar Dam", author: "Deepa Sundaram", status: "Scheduled (Aug 10)", date: "Scheduled" },
            ].map((story) => (
              <div key={story.title} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded-full">
                    {story.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{story.date}</span>
                </div>
                <p className="font-bold text-sm text-white">{story.title}</p>
                <p className="text-xs text-slate-400 font-mono">By {story.author}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
