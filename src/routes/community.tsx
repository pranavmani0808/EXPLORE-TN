import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, MessageCircle, Bookmark, Trophy } from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { places } from "@/data/places";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community feed — ExplorerTN" },
      {
        name: "description",
        content: "Travel journals, photo dumps, collections and community picks from explorers riding across Tamil Nadu.",
      },
      { property: "og:title", content: "Community feed — ExplorerTN" },
      { property: "og:description", content: "Journals, photo grids and community picks from Tamil Nadu explorers." },
    ],
  }),
  component: CommunityPage,
});

const authors = ["Arun K.", "Divya S.", "Prakash M.", "Meera R.", "Vishnu T.", "Lakshmi N."];

function CommunityPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Community"
        title="Stories from the road"
        description="Journals, photo dumps and the places explorers keep going back to."
      />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_0.45fr]">
        <div className="space-y-6">
          {places.slice(0, 5).map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              className="overflow-hidden rounded-4xl border border-border bg-card shadow-elevate"
            >
              <div className="flex items-center gap-3 p-4">
                <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-forest to-ocean text-sm font-semibold text-forest-foreground">
                  {authors[i % authors.length]!.slice(0, 2)}
                </span>
                <div>
                  <p className="font-display text-sm font-semibold">{authors[i % authors.length]}</p>
                  <p className="text-xs text-muted-foreground">Level 7 Explorer · {p.district}</p>
                </div>
              </div>
              <img src={p.image} alt={p.name} loading="lazy" className="h-96 w-full object-cover" />
              <div className="space-y-3 p-5">
                <h2 className="font-display text-lg font-semibold">{p.name}</h2>
                <p className="text-sm text-muted-foreground">{p.story.slice(0, 160)}…</p>
                <div className="flex items-center gap-5 pt-1 text-sm text-muted-foreground">
                  <button className="flex min-h-11 items-center gap-2 hover:text-sunset">
                    <Heart className="size-4" aria-hidden /> {320 + i * 47}
                  </button>
                  <button className="flex min-h-11 items-center gap-2 hover:text-foreground">
                    <MessageCircle className="size-4" aria-hidden /> {18 + i * 3}
                  </button>
                  <button className="ml-auto flex min-h-11 items-center gap-2 hover:text-primary">
                    <Bookmark className="size-4" aria-hidden /> Save
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
          <div className="glass rounded-3xl p-5">
            <p className="font-display text-sm font-semibold">Top explorers</p>
            <ul className="mt-3 space-y-3">
              {authors.slice(0, 4).map((a, i) => (
                <li key={a} className="flex items-center gap-3 text-sm">
                  <span className="grid size-9 place-items-center rounded-xl bg-secondary text-xs font-semibold">
                    {a.slice(0, 2)}
                  </span>
                  <span>{a}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-gold">
                    <Trophy className="size-3.5" aria-hidden /> {180 - i * 22}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="font-display text-sm font-semibold">Collections</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {places.slice(0, 4).map((p) => (
                <img key={p.slug} src={p.image} alt="" loading="lazy" className="h-20 w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
