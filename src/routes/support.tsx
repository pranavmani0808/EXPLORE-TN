import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, Search, LifeBuoy, MessageSquare, PhoneCall, ChevronRight, Check } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

const FAQS = [
  {
    q: "How does guest trip auto-saving work?",
    a: "When you build an itinerary as a guest, ExploreTN saves your draft to your browser's local storage and a 30-day session cookie. When you sign in or register, your guest trips are automatically merged into your account.",
  },
  {
    q: "Are forest department permits required for Western Ghats treks?",
    a: "Yes, certain high-altitude treks in Nilgiris, Valparai, and Agasthyamalai require forest checkpost permits. ExploreTN displays permit requirements directly on place cards.",
  },
  {
    q: "How do I download offline maps?",
    a: "Pro Adventurer members can click 'Save Offline' on any route map page. Tiles and OSRM route points will be cached locally on your device.",
  },
  {
    q: "Can I request a custom food or temple trail route?",
    a: "Yes! Use our AI Travel Planner on /ai-plan to enter custom start/end locations, dietary choices, and travel dates.",
  },
];

import { SupabaseDatabaseRepository } from "@/lib/supabase-database";
import { getCurrentAuthUser } from "@/lib/auth-rbac";

function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticket, setTicket] = useState({ subject: "", email: "", message: "", location: "Tamil Nadu" });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.email || !ticket.message) return;
    setIsSubmitting(true);
    try {
      const user = getCurrentAuthUser();
      const userName = user?.name || ticket.email.split("@")[0];

      await SupabaseDatabaseRepository.createUserQuery({
        userName,
        userEmail: ticket.email,
        queryType: "General Travel",
        locationContext: ticket.location || "Tamil Nadu",
        subject: ticket.subject || "Traveler Inquiry",
        message: ticket.message,
        aiSuggestedAnswer: `Automated response: We received your query regarding "${ticket.subject || ticket.location}". An ExplorerTN travel operations specialist will review and update you.`,
      });

      setTicketSubmitted(true);
      toast.success("Support ticket submitted directly to Admin Helpdesk! Ticket ID: #TN-" + Math.floor(100000 + Math.random() * 900000));
    } catch {
      toast.error("Failed to submit ticket. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-20 font-sans text-slate-100">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <LifeBuoy className="size-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Help Center & Traveler Support</h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Find quick answers, submit a support ticket, or access emergency helpline contacts for Tamil Nadu travelers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-12">
          <Search className="absolute left-4 top-3.5 size-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs, routes, permits, billing..."
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* FAQs */}
        <div className="space-y-4 mb-14">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="size-5 text-emerald-400" /> Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2">
                <h4 className="font-semibold text-sm text-white">{faq.q}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts Banner */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-6 mb-12 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
              <PhoneCall className="size-4" /> Tamil Nadu Traveler Emergency Helplines
            </h4>
            <p className="text-xs text-amber-200/80">
              State Tourist Helpline: **1800-425-3111** • Forest Department Emergency: **1926** • Police Assistance: **112**
            </p>
          </div>
        </div>

        {/* Support Ticket Submission Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
            <MessageSquare className="size-5 text-emerald-400" /> Submit a Support Ticket
          </h3>
          <p className="text-xs text-slate-400 mb-6">Our support team responds within 2 hours.</p>

          {ticketSubmitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <Check className="size-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white">Ticket Submitted Successfully!</h4>
              <p className="text-xs text-slate-300">We sent a confirmation email to {ticket.email}.</p>
              <Button onClick={() => { setTicket({ subject: "", email: "", message: "" }); setTicketSubmitted(false); }} size="sm" variant="outline" className="border-slate-700 text-xs">
                Submit Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={ticket.email}
                    onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticket.subject}
                    onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                    placeholder="e.g. Route recalculation issue"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Message Details (Max 2000 chars)</label>
                <textarea
                  rows={4}
                  required
                  maxLength={2000}
                  value={ticket.message}
                  onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 rounded-xl">
                Send Support Ticket →
              </Button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
