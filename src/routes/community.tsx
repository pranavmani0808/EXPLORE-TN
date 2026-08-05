import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, MessageCircle, Bookmark, Plus, Compass, Sparkles, Image, MessageSquare } from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { Button } from "@/components/ui/button";
import { places } from "@/data/places";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Feed — ExplorerTN" },
      {
        name: "description",
        content: "Travel journals, photo dumps, collections and community picks from explorers riding across Tamil Nadu.",
      },
      { property: "og:title", content: "Community Feed — ExplorerTN" },
      { property: "og:description", content: "Journals, photo grids and community picks from Tamil Nadu explorers." },
    ],
  }),
  component: CommunityPage,
});

export interface CommunityPost {
  id: string;
  authorName: string;
  authorLocation: string;
  placeName: string;
  image: string;
  story: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
}

function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newPost, setNewPost] = useState({
    authorName: "",
    placeName: "",
    story: "",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.story.trim()) return;

    const created: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: newPost.authorName || "Explorer",
      authorLocation: "Tamil Nadu",
      placeName: newPost.placeName || "Ghat Trail",
      image: newPost.image,
      story: newPost.story,
      likes: 1,
      commentsCount: 0,
      timeAgo: "Just now",
    };

    setPosts([created, ...posts]);
    setNewPost({ authorName: "", placeName: "", story: "", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" });
    setShowShareModal(false);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Community"
        title="Stories & Travel Journals"
        description="Share your photo dumps, ridge-top sunrises, and hidden trail logs with explorers across Tamil Nadu."
      />

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {/* Action Header */}
        <div className="flex items-center justify-between gap-4 mb-8 bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
          <div>
            <h2 className="text-base font-bold text-white font-sans">Explorer Community Hub</h2>
            <p className="text-xs text-slate-400 font-mono">Real-time user journals & verified trail photo logs</p>
          </div>
          <Button
            onClick={() => setShowShareModal(true)}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="size-4 mr-1" /> Share Story / Photo Dump
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main Feed */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-[#121821] border border-white/15 rounded-3xl p-10 text-center text-white space-y-4 shadow-2xl">
                <div className="inline-flex size-14 place-items-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <Sparkles className="size-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-sans">Be the First Explorer to Share a Story!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-mono">
                    No posts yet. Share your secret waterfall finds, hairpins, and travel logs with the Tamil Nadu community.
                  </p>
                </div>
                <Button
                  onClick={() => setShowShareModal(true)}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer mt-2"
                >
                  <Plus className="size-4 mr-1" /> Create First Community Post
                </Button>
              </div>
            ) : (
              posts.map((p) => (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-3xl border border-white/15 bg-[#121821] shadow-2xl text-white font-sans"
                >
                  <div className="flex items-center gap-3 p-4 border-b border-white/10">
                    <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500 text-black font-black text-sm">
                      {p.authorName.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-white">{p.authorName}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.authorLocation} • {p.timeAgo}</p>
                    </div>
                  </div>
                  <img src={p.image} alt={p.placeName} loading="lazy" className="h-80 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <h3 className="font-extrabold text-base text-white">{p.placeName}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{p.story}</p>
                    <div className="flex items-center gap-5 pt-2 text-xs text-slate-400 font-mono border-t border-white/10">
                      <button className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                        <Heart className="size-4 text-emerald-400" /> {p.likes} Likes
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-white transition">
                        <MessageCircle className="size-4 text-slate-400" /> {p.commentsCount} Comments
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))
            )}
          </div>

          {/* Right Sidebar: Curated Regional Collections */}
          <aside className="space-y-4">
            <div className="bg-[#121821] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-3">
              <h4 className="font-bold text-sm text-white font-sans flex items-center gap-2">
                <Compass className="size-4 text-emerald-400" /> Verified Trail Collections
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {places.slice(0, 4).map((p) => (
                  <div key={p.slug} className="group relative rounded-xl overflow-hidden h-24 border border-white/10">
                    <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex items-end">
                      <span className="text-[10px] font-bold text-white truncate font-sans">{p.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Share Story Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
          <div className="relative w-full max-w-lg bg-[#121821] border border-white/15 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="size-5 text-emerald-400" /> Share Story / Photo Log
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={newPost.authorName}
                  onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                  placeholder="e.g. Karthik Rider"
                  className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Place / Trail Name</label>
                <input
                  type="text"
                  required
                  value={newPost.placeName}
                  onChange={(e) => setNewPost({ ...newPost, placeName: e.target.value })}
                  placeholder="e.g. Kolli Hills Hairpin Pass #42"
                  className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Your Trail Journal / Review</label>
                <textarea
                  rows={4}
                  required
                  value={newPost.story}
                  onChange={(e) => setNewPost({ ...newPost, story: e.target.value })}
                  placeholder="Describe road conditions, fog level, waterfalls flow, and tips..."
                  className="w-full bg-[#0B0F14] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl"
                >
                  Publish Story →
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
