import { Landmark, CloudRain, Mountain, Waves, Trees, Utensils, Footprints, Sun, Sparkles, Flame, Compass } from "lucide-react";

export interface CustomCategory {
  id: string;
  title: string;
  subtitle: string;
  iconName?: string;
  color?: string;
  bgGradient?: string;
  badgeColor?: string;
  placesCount?: number;
  sectionGroup: "Nature & Outdoors" | "Culture & Heritage" | "Adventure & Sports" | "Custom";
  isCustom?: boolean;
}

export const BASE_CATEGORIES: CustomCategory[] = [
  // Nature & Outdoors
  { id: "waterfall", title: "Waterfalls & Falls", subtitle: "Cascades, pools & herbal falls", sectionGroup: "Nature & Outdoors", placesCount: 42, iconName: "CloudRain", color: "text-cyan-400" },
  { id: "hills", title: "Hills & Mountains", subtitle: "Nilgiris, Western Ghats & view passes", sectionGroup: "Nature & Outdoors", placesCount: 38, iconName: "Mountain", color: "text-emerald-400" },
  { id: "beaches", title: "Beaches & Coastline", subtitle: "Bay of Bengal & surfing points", sectionGroup: "Nature & Outdoors", placesCount: 24, iconName: "Waves", color: "text-blue-400" },
  { id: "nature", title: "Nature & Forests", subtitle: "Mangroves, reserves & wildlife", sectionGroup: "Nature & Outdoors", placesCount: 29, iconName: "Trees", color: "text-green-400" },
  { id: "lake", title: "Lakes & Dams", subtitle: "Reservoirs, lagoons & backwaters", sectionGroup: "Nature & Outdoors", placesCount: 19, iconName: "Waves", color: "text-sky-400" },

  // Culture & Heritage
  { id: "temple", title: "Temples & Shrines", subtitle: "Pancha Bhoota & Chola architectural marvels", sectionGroup: "Culture & Heritage", placesCount: 86, iconName: "Landmark", color: "text-orange-400" },
  { id: "heritage", title: "Heritage & Historical", subtitle: "UNESCO stone monuments, forts & aqueducts", sectionGroup: "Culture & Heritage", placesCount: 34, iconName: "Landmark", color: "text-purple-400" },
  { id: "food", title: "Food & Local Experiences", subtitle: "Madurai street food, Jigarthanda & Halwa", sectionGroup: "Culture & Heritage", placesCount: 45, iconName: "Utensils", color: "text-amber-300" },
  { id: "rural", title: "Villages & Rural", subtitle: "Agrarian countryside, paddy fields & ponds", sectionGroup: "Culture & Heritage", placesCount: 16, iconName: "Trees", color: "text-lime-400" },

  // Adventure & Sports
  { id: "trekking", title: "Trekking & Hiking", subtitle: "Craggy peaks, trails & hill forts", sectionGroup: "Adventure & Sports", placesCount: 28, iconName: "Mountain", color: "text-amber-400" },
  { id: "adventure", title: "Adventure Activities", subtitle: "Coracle rides, dune surfing & cable cars", sectionGroup: "Adventure & Sports", placesCount: 18, iconName: "Footprints", color: "text-rose-400" },
  { id: "viewpoint", title: "Viewpoints & Sunsets", subtitle: "High elevation ridge points & confluences", sectionGroup: "Adventure & Sports", placesCount: 22, iconName: "Sun", color: "text-yellow-400" },
  { id: "hidden", title: "Hidden & Offbeat", subtitle: "Lesser-known cascades & quiet spots", sectionGroup: "Adventure & Sports", placesCount: 31, iconName: "Sparkles", color: "text-teal-400" },
];

const STORAGE_KEY = "etn_custom_taxonomy_categories_v1";

export function getAllCategories(): CustomCategory[] {
  if (typeof window === "undefined") return BASE_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return BASE_CATEGORIES;
    const customList: CustomCategory[] = JSON.parse(raw);
    const map = new Map<string, CustomCategory>();
    BASE_CATEGORIES.forEach((c) => map.set(c.id, c));
    customList.forEach((c) => map.set(c.id, c));
    return Array.from(map.values());
  } catch {
    return BASE_CATEGORIES;
  }
}

export function addCustomCategory(cat: Omit<CustomCategory, "id"> & { id?: string }): CustomCategory {
  const slug = (cat.id || cat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) || `cat-${Date.now()}`;
  const newCat: CustomCategory = {
    ...cat,
    id: slug,
    placesCount: cat.placesCount ?? 0,
    isCustom: true,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: CustomCategory[] = raw ? JSON.parse(raw) : [];
      const updated = [newCat, ...list.filter((c) => c.id !== slug)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return newCat;
}

export function deleteCustomCategory(id: string): boolean {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: CustomCategory[] = JSON.parse(raw);
        const filtered = list.filter((c) => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
      }
    } catch {}
  }
  return false;
}
