import React, { useState, useEffect } from "react";
import { Plus, Tag, Trash2, Check, Sparkles, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAllCategories, addCustomCategory, deleteCustomCategory, CustomCategory } from "@/lib/data/taxonomy-categories";

export function CategoriesManagementModule() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newGroup, setNewGroup] = useState<"Nature & Outdoors" | "Culture & Heritage" | "Adventure & Sports" | "Custom">("Nature & Outdoors");

  const refresh = () => {
    setCategories(getAllCategories());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const added = addCustomCategory({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || `Explore curated ${newTitle.trim()} across Tamil Nadu`,
      sectionGroup: newGroup,
      placesCount: 0,
    });

    toast.success(`Category "${added.title}" created! It now reflects live on the user experience page (/explore).`);
    setNewTitle("");
    setNewSubtitle("");
    setShowAddModal(false);
    refresh();
  };

  const handleDelete = (id: string, title: string) => {
    deleteCustomCategory(id);
    toast.success(`Category "${title}" removed.`);
    refresh();
  };

  const groups: Array<"Nature & Outdoors" | "Culture & Heritage" | "Adventure & Sports" | "Custom"> = [
    "Nature & Outdoors",
    "Culture & Heritage",
    "Adventure & Sports",
    "Custom",
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-500"><Tag className="size-4" /></span>
            <h3 className="text-xl font-bold text-foreground font-serif">Categories & Taxonomy Hierarchy</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Categories defined here reflect live across user-facing pages including <strong>/explore</strong>.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-500" /> Create New Travel Category
          </h4>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-bold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wildlife & Bird Watching"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-muted-foreground font-bold mb-1">Classification Group</label>
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-emerald-500"
                >
                  <option value="Nature & Outdoors">Nature & Outdoors</option>
                  <option value="Culture & Heritage">Culture & Heritage</option>
                  <option value="Adventure & Sports">Adventure & Sports</option>
                  <option value="Custom">Custom Group</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground font-bold mb-1">Subtitle / User Blurb</label>
              <input
                type="text"
                placeholder="e.g. Sanctuaries, migratory lakes & forest safaris"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                Publish Category Live →
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of groups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((group) => {
          const items = categories.filter((c) => c.sectionGroup === group);
          if (items.length === 0 && group === "Custom") return null;

          return (
            <div key={group} className="rounded-xl border border-border p-4 bg-background space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="font-bold text-sm text-foreground">{group}</h4>
                <span className="text-[10px] font-mono text-muted-foreground">{items.length} categories</span>
              </div>

              <div className="space-y-2 text-xs">
                {items.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border hover:border-emerald-500/30 transition">
                    <div>
                      <span className="font-bold text-foreground">{cat.title}</span>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{cat.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {cat.isCustom && (
                        <button
                          onClick={() => handleDelete(cat.id, cat.title)}
                          className="p-1 hover:bg-rose-500/10 text-rose-400 rounded transition cursor-pointer"
                          title="Delete custom category"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
