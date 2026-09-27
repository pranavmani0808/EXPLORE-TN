import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  User,
  Search,
  Filter,
  AlertCircle,
  Check,
  Tag,
  MapPin,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupabaseDatabaseRepository } from "@/lib/supabase-database";
import { toast } from "sonner";

export interface UserQueryItem {
  id: string;
  userName: string;
  userEmail: string;
  queryType: "Route Condition" | "Missing Spot" | "Temple Timings" | "Safety & Weather" | "General Travel";
  locationContext: string;
  subject: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved";
  submittedAt: string;
  aiSuggestedAnswer?: string;
  adminReply?: string;
  resolvedBy?: string;
}

export function UserQueriesSupportModule() {
  const [queries, setQueries] = useState<UserQueryItem[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<UserQueryItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // New query modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newQueryType, setNewQueryType] = useState<"Route Condition" | "Missing Spot" | "Temple Timings" | "Safety & Weather" | "General Travel">("Route Condition");

  const loadQueries = async () => {
    setIsLoading(true);
    const data = await SupabaseDatabaseRepository.getUserQueries();
    setQueries(data);
    if (data.length > 0 && !selectedQuery) {
      setSelectedQuery(data[0]);
      setReplyText(data[0].adminReply || data[0].aiSuggestedAnswer || "");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const filteredQueries = queries.filter((q) => {
    const matchesStatus = filterStatus === "All" || q.status === filterStatus;
    const matchesSearch =
      q.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.locationContext.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSelectQuery = (q: UserQueryItem) => {
    setSelectedQuery(q);
    setReplyText(q.adminReply || q.aiSuggestedAnswer || "");
  };

  const handleUseAISuggestion = () => {
    if (selectedQuery?.aiSuggestedAnswer) {
      setReplyText(selectedQuery.aiSuggestedAnswer);
      toast.success("AI suggested response applied to composer!");
    }
  };

  const handleSendReply = async () => {
    if (!selectedQuery || !replyText.trim()) return;

    await SupabaseDatabaseRepository.resolveUserQuery(selectedQuery.id, replyText, "Pranav (SUPER_ADMIN)");

    setQueries((prev) =>
      prev.map((q) =>
        q.id === selectedQuery.id
          ? {
              ...q,
              status: "Resolved",
              adminReply: replyText,
              resolvedBy: "Pranav (SUPER_ADMIN)",
            }
          : q
      )
    );

    setSelectedQuery((prev) =>
      prev
        ? {
            ...prev,
            status: "Resolved",
            adminReply: replyText,
            resolvedBy: "Pranav (SUPER_ADMIN)",
          }
        : null
    );

    toast.success(`User query resolved & response saved to Supabase DB for ${selectedQuery.userEmail}`);
  };

  const handleCreateNewQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newSubject.trim() || !newMessage.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const created = await SupabaseDatabaseRepository.createUserQuery({
      userName: newUserName,
      userEmail: newUserEmail || "explorer@exploretn.com",
      queryType: newQueryType,
      locationContext: newLocation || "Tamil Nadu",
      subject: newSubject,
      message: newMessage,
    });

    setQueries((prev) => [created, ...prev]);
    setSelectedQuery(created);
    setReplyText(created.aiSuggestedAnswer || "");
    setShowNewModal(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewLocation("");
    setNewSubject("");
    setNewMessage("");
    toast.success("New User Query submitted and synchronized with Supabase DB!");
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="size-5 text-emerald-400" />
            Travel Helpdesk & User Queries
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time visitor inquiries & support resolution powered by Supabase DB</p>
        </div>

        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="size-4" /> Submit Real Query
        </Button>
      </div>

      {/* Header Stat Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#09090b]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>TOTAL USER QUERIES</span>
            <HelpCircle className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{queries.length}</div>
          <div className="mt-1 text-[11px] text-zinc-400">Live database tickets</div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
            <span>OPEN / PENDING</span>
            <Clock className="size-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-300">
            {queries.filter((q) => q.status === "Open").length}
          </div>
          <div className="mt-1 text-[11px] text-amber-400/80">Requires admin response</div>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-sky-400">
            <span>IN PROGRESS</span>
            <RefreshCw className="size-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-sky-300">
            {queries.filter((q) => q.status === "In Progress").length}
          </div>
          <div className="mt-1 text-[11px] text-sky-400/80">Under verification</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
            <span>RESOLVED & NOTIFIED</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">
            {queries.filter((q) => q.status === "Resolved").length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/80">
            {queries.length > 0
              ? `${Math.round((queries.filter((q) => q.status === "Resolved").length / queries.length) * 100)}% resolution rate`
              : "0 tickets in queue"}
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Query Inbox */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search user queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1 text-xs">
              {["All", "Open", "Resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    filterStatus === st
                      ? "bg-emerald-500 text-zinc-950"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredQueries.length > 0 ? (
              filteredQueries.map((q) => {
                const isSelected = selectedQuery?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectQuery(q)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
                        : "border-zinc-800 bg-[#09090b]/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-white">
                        <User className="size-3.5 text-emerald-400" />
                        {q.userName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                          q.status === "Open"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : q.status === "In Progress"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-bold text-zinc-200 line-clamp-1">{q.subject}</div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-mono">
                        <MapPin className="size-3" />
                        {q.locationContext}
                      </span>
                      <span>{q.submittedAt}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-3xl bg-[#09090b]/60">
                <HelpCircle className="size-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-300">No user queries in database</p>
                <p className="text-[11px] text-zinc-500 mt-1 mb-4">Click "Submit Real Query" above to test support ticketing.</p>
                <Button
                  onClick={() => setShowNewModal(true)}
                  variant="outline"
                  className="text-xs border-zinc-700 text-zinc-300 hover:text-white"
                >
                  <Plus className="size-3.5 mr-1" /> Add Real Support Ticket
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Query Inspector & AI Resolver */}
        <div className="lg:col-span-7">
          {selectedQuery ? (
            <div className="space-y-4 rounded-3xl border border-zinc-800 bg-[#09090b]/95 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                      {selectedQuery.queryType}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">ID: {selectedQuery.id}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">{selectedQuery.subject}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                    <span>From: <strong className="text-white">{selectedQuery.userName}</strong> ({selectedQuery.userEmail})</span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">{selectedQuery.locationContext}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      selectedQuery.status === "Open"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {selectedQuery.status === "Open" ? <AlertCircle className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                    {selectedQuery.status}
                  </span>
                </div>
              </div>

              {/* User Message Box */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  User Inquiry Detail
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed">{selectedQuery.message}</p>
              </div>

              {/* AI Suggested Instant Answer */}
              {selectedQuery.aiSuggestedAnswer && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                      <Sparkles className="size-4" />
                      AI Travel Copilot Instant Suggestion
                    </span>
                    <button
                      onClick={handleUseAISuggestion}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Use as Response →
                    </button>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
                    {selectedQuery.aiSuggestedAnswer}
                  </p>
                </div>
              )}

              {/* Admin Response Composer */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>ADMIN RESPONSE COMPOSER</span>
                  {selectedQuery.resolvedBy && (
                    <span className="text-emerald-400 font-bold">Resolved by: {selectedQuery.resolvedBy}</span>
                  )}
                </div>

                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official admin response to user inquiry..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleUseAISuggestion}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition"
                  >
                    <Sparkles className="size-3.5 text-emerald-400" />
                    Auto-Fill AI Answer
                  </button>

                  <Button
                    onClick={handleSendReply}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="size-3.5" />
                    Dispatch Answer & Resolve Query
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-zinc-800 bg-[#09090b]/80 text-zinc-500 text-xs">
              Select a user query from the inbox to inspect and respond.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New User Query */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#09090b] p-6 text-white shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="size-5 text-emerald-400" />
                Submit New Support Query
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateNewQuery} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">User Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">User Email</label>
                  <input
                    type="email"
                    placeholder="ramesh@gmail.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Query Type</label>
                  <select
                    value={newQueryType}
                    onChange={(e) => setNewQueryType(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Route Condition">Route Condition</option>
                    <option value="Missing Spot">Missing Spot</option>
                    <option value="Temple Timings">Temple Timings</option>
                    <option value="Safety & Weather">Safety & Weather</option>
                    <option value="General Travel">General Travel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Location Context</label>
                <input
                  type="text"
                  placeholder="e.g. Valparai Ghat Road / Ooty Lake"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of travel question..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Message Detail *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed traveler inquiry..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNewModal(false)} className="border-zinc-800 text-zinc-400">Cancel</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold">Submit Query to Supabase</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
