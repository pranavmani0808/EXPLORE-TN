import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Send, Sparkles, Wallet, Fuel, CloudSun, Backpack, Download, Share2, Compass, AlertCircle, Loader2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { PlannerApiRepository, PlannerChatResponseDTO } from "@/lib/api-client/planner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Trip Planner — ExplorerTN" },
      {
        name: "description",
        content:
          "Describe your weekend and get a Tamil Nadu itinerary with timeline, budget, fuel estimate, weather and a packing checklist.",
      },
      { property: "og:title", content: "AI Trip Planner — ExplorerTN" },
      {
        property: "og:description",
        content: "Itinerary, budget, fuel and packing list for your next Tamil Nadu ride.",
      },
    ],
  }),
  component: PlannerPage,
});

const defaultPacking = [
  "Rain shell",
  "Grip gloves",
  "Headlamp",
  "2L water",
  "Power bank",
  "Cash ₹2,000",
  "Tyre inflator",
];

function PlannerPage() {
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hi! I am your ExplorerTN Trip Copilot. Tell me where you want to start, your budget, or interests (e.g. 'one-day bike trip from Chennai with hills').",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Planner Results State
  const [timeline, setTimeline] = useState<Array<{ time: string; name: string; description: string }>>([
    {
      time: "06:00 AM",
      name: "Start Location",
      description: "Enter your starting city to generate a verified Tamil Nadu itinerary.",
    },
  ]);
  const [budgetDisplay, setBudgetDisplay] = useState("₹3,000");
  const [fuelEstimate, setFuelEstimate] = useState("₹720");
  const [weatherDisplay, setWeatherDisplay] = useState("18–28°C");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setErrorMsg(null);
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res: PlannerChatResponseDTO = await PlannerApiRepository.sendChatMessage(userText, conversationId);
      setConversationId(res.conversationId);
      
      setMessages((prev) => [...prev, { role: "assistant", text: res.message }]);

      // Update Dynamic Planner UI
      if (res.timeline && res.timeline.length > 0) {
        setTimeline(res.timeline);
      }
      if (res.plannerState?.budget) {
        setBudgetDisplay(`₹${res.plannerState.budget.toLocaleString("en-IN")}`);
      }
      if (res.costEstimate?.fuelCost) {
        setFuelEstimate(res.costEstimate.fuelCost);
      }
      if (res.weather?.tempRange) {
        setWeatherDisplay(res.weather.tempRange);
      }
    } catch (err: any) {
      const msg = err?.message || "Trip Copilot is temporarily unavailable.";
      setErrorMsg(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Trip Copilot encountered an issue connecting to the backend. Please verify details and retry.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Planner"
        title="Plan the whole ride in one conversation"
        description="Tell it where you are, how long you have and what you love. It returns a timeline, a budget, fuel maths, weather and a packing list."
      />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <div className="glass flex h-[560px] flex-col rounded-4xl p-5 shadow-elevate">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Compass className="size-4" aria-hidden />
            </span>
            Trip copilot
          </p>

          {errorMsg && (
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : ""}
              >
                {m.role === "user" ? (
                  <p className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">{m.text}</p>
                ) : (
                  <p className="max-w-[92%] text-sm leading-relaxed text-foreground">{m.text}</p>
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span>Trip Copilot is querying PostGIS & computing route math...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background/50 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a stop, change the budget, ask about weather…"
              aria-label="Message the trip planner"
              disabled={loading}
              className="min-h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-xl" aria-label="Send">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-4xl p-5 shadow-elevate">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-gold" aria-hidden /> Generated itinerary
            </p>
            <ol className="mt-4 space-y-3 border-l border-border pl-5">
              {timeline.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative rounded-2xl border border-border bg-card p-3"
                >
                  <span className="absolute -left-[27px] top-4 size-3 rounded-full bg-primary ring-4 ring-background" />
                  <p className="font-display text-sm font-semibold">{s.time} · {s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [Wallet, "Budget", budgetDisplay],
              [Fuel, "Fuel", fuelEstimate],
              [CloudSun, "Weather", weatherDisplay],
            ].map(([Icon, label, value]) => {
              const I = Icon as typeof Wallet;
              return (
                <div key={label as string} className="rounded-3xl border border-border bg-card p-4">
                  <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <I className="size-3.5 text-primary" aria-hidden /> {label as string}
                  </p>
                  <p className="mt-2 font-display text-lg font-semibold">{value as string}</p>
                </div>
              );
            })}
          </div>

          <div className="glass rounded-4xl p-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Backpack className="size-4 text-sunset" aria-hidden /> Packing checklist
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {defaultPacking.map((p) => (
                <span key={p} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl">
              <Download className="size-4" /> Download itinerary
            </Button>
            <Button variant="outline" className="rounded-xl">
              <Share2 className="size-4" /> Share
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
