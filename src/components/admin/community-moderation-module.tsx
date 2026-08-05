import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Search,
  Filter,
  Shield,
  UserX,
  UserCheck,
  Check,
  X,
  MessageSquare,
  Sparkles,
  MapPin,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReviewQueueItem {
  id: string;
  userName: string;
  userBadge: string;
  placeName: string;
  rating: number;
  comment: string;
  aiRiskScore: number; // e.g. 12%
  gpsValid: boolean;
  duplicateScore: number;
  submittedAt: string;
}

export interface ReportItem {
  id: string;
  reportedBy: string;
  targetItem: string;
  reason: "Wrong Coordinates" | "Closed Road" | "Dangerous Route" | "Fake Review";
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Assigned" | "Resolved";
  submittedAt: string;
}

const initialReviews: ReviewQueueItem[] = [
  {
    id: "rev-1",
    userName: "TrailSeeker_TN",
    userBadge: "Level 14 Ghat Explorer",
    placeName: "Kolli Hills 70 Hairpin Pass",
    rating: 5,
    comment: "Road section between Hairpin 22 and 26 has loose gravel after morning rain. Stay in low gear!",
    aiRiskScore: 4,
    gpsValid: true,
    duplicateScore: 2,
    submittedAt: "12 mins ago",
  },
  {
    id: "rev-2",
    userName: "AnonymousRider",
    userBadge: "New Explorer",
    placeName: "Suruli Secret Waterfalls",
    rating: 1,
    comment: "Closed entry ticket counter, go around the fence.",
    aiRiskScore: 78,
    gpsValid: false,
    duplicateScore: 64,
    submittedAt: "35 mins ago",
  },
];

const initialReports: ReportItem[] = [
  {
    id: "rep-1",
    reportedBy: "Karthik Raja",
    targetItem: "Batlagundu Ghat Pass Hairpin 14",
    reason: "Closed Road",
    priority: "Critical",
    status: "Open",
    submittedAt: "08:15 AM",
  },
  {
    id: "rep-2",
    reportedBy: "Deepa Sundaram",
    targetItem: "Agaya Gangai Basin GPS Pin",
    reason: "Wrong Coordinates",
    priority: "High",
    status: "Open",
    submittedAt: "Yesterday",
  },
];

export function CommunityModerationModule() {
  const [reviewList, setReviewList] = useState<ReviewQueueItem[]>(initialReviews);
  const [reportList, setReportList] = useState<ReportItem[]>(initialReports);
  const [activeTab, setActiveTab] = useState<"reviews" | "reports" | "users">("reviews");

  const handleApproveReview = (id: string) => {
    setReviewList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResolveReport = (id: string) => {
    setReportList((prev) => prev.map((rp) => (rp.id === id ? { ...rp, status: "Resolved" } : rp)));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Moderation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
            <ShieldAlert className="size-4" /> COMMUNITY & MODERATION PLATFORM
          </span>

          <div className="flex gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === "reviews" ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-300"
              }`}
            >
              Review Moderation Queue ({reviewList.length})
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === "reports" ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-300"
              }`}
            >
              User Reports Queue ({reportList.filter((r) => r.status === "Open").length})
            </button>
          </div>
        </div>
      </div>

      {/* REVIEW MODERATION QUEUE */}
      {activeTab === "reviews" && (
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="size-5 text-emerald-400" /> Pending Review Moderation
            </h3>
            <span className="text-xs font-mono text-emerald-400">AI Risk Scanning Active</span>
          </div>

          <div className="space-y-3">
            {reviewList.map((rev) => (
              <div key={rev.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-white">{rev.userName}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-slate-300">{rev.userBadge}</span>
                    <span className="text-slate-400">• {rev.submittedAt}</span>
                  </div>

                  {/* AI Safety Metrics */}
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold ${
                        rev.aiRiskScore > 40 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      AI Risk Score: {rev.aiRiskScore}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${rev.gpsValid ? "text-emerald-400" : "text-amber-400"}`}>
                      {rev.gpsValid ? "GPS Validated" : "No GPS EXIF"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-amber-400">Target Spot: {rev.placeName} • ★ {rev.rating}/5</p>
                  <p className="text-xs text-slate-200">{rev.comment}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleApproveReview(rev.id)}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <Check className="size-3.5" /> Approve & Publish
                  </button>
                  <button
                    onClick={() => handleApproveReview(rev.id)}
                    className="px-3.5 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <X className="size-3.5" /> Reject Review
                  </button>
                </div>
              </div>
            ))}

            {reviewList.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-8 font-mono">✓ Review queue is clear! All reviews moderated.</p>
            )}
          </div>
        </div>
      )}

      {/* USER REPORTS QUEUE */}
      {activeTab === "reports" && (
        <div className="bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-400" /> Operational User Reports Queue
            </h3>
            <span className="text-xs font-mono text-amber-400">Open Action Items</span>
          </div>

          <div className="space-y-3">
            {reportList.map((rp) => (
              <div key={rp.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-white">{rp.targetItem}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        rp.priority === "Critical" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {rp.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">Reason: <span className="font-bold text-white">{rp.reason}</span> • Reported by {rp.reportedBy}</p>
                </div>

                <div className="flex items-center gap-2">
                  {rp.status === "Open" ? (
                    <button
                      onClick={() => handleResolveReport(rp.id)}
                      className="px-3.5 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-xl"
                    >
                      Resolve & Update Node
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 font-bold">✓ Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
