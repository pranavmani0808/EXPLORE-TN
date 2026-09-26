/**
 * Google Maps API Loader & Tile Provider Utility for ExploreTN.
 * Loads Google Maps JavaScript SDK and provides official Google Maps Tile Layers
 * (Roadmap, Satellite, Terrain, Hybrid) using VITE_GOOGLE_MAPS_API_KEY or explicit key.
 */

export interface GoogleMapsConfig {
  apiKey?: string;
  libraries?: string[];
}

let isScriptLoading = false;
let isScriptLoaded = false;

export function getGoogleMapsApiKey(overrideKey?: string): string {
  if (overrideKey && overrideKey.trim()) return overrideKey.trim();
  if (typeof window !== "undefined") {
    const windowKey = (window as any).GOOGLE_MAPS_API_KEY;
    if (windowKey) return windowKey;
  }
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
}

/**
 * Dynamically loads the official Google Maps JavaScript API script tag into <head>.
 */
export function loadGoogleMapsScript(apiKey?: string, libraries: string[] = ["places", "geometry"]): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve(null);

    if ((window as any).google && (window as any).google.maps) {
      isScriptLoaded = true;
      return resolve((window as any).google.maps);
    }

    const key = getGoogleMapsApiKey(apiKey);
    if (!key) {
      console.warn("[Google Maps Engine] VITE_GOOGLE_MAPS_API_KEY not configured. Falling back to OpenStreetMap tile layers.");
      return resolve(null);
    }

    if (isScriptLoaded) return resolve((window as any).google.maps);

    if (isScriptLoading) {
      const interval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(interval);
          resolve((window as any).google.maps);
        }
      }, 100);
      return;
    }

    isScriptLoading = true;
    const script = document.createElement("script");
    const libsParam = libraries.join(",");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=${libsParam}&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoading = false;
      isScriptLoaded = true;
      console.log("✅ Google Maps JS API successfully initialized.");
      resolve((window as any).google.maps);
    };

    script.onerror = (err) => {
      isScriptLoading = false;
      console.error("❌ Failed to load Google Maps JS API script:", err);
      reject(err);
    };

    document.head.appendChild(script);
  });
}

/**
 * Returns official Google Maps vector & raster tile URLs.
 * Styles:
 * - 'roadmap' / 'm': Standard Google Maps Road Vector Tiles
 * - 'satellite' / 's': Google High-Res Satellite Imagery
 * - 'terrain' / 'p': Google Physical Terrain & Topography
 * - 'hybrid' / 'y': Satellite + Road Labels Overlay
 */
export function getGoogleTileUrl(
  style: "roadmap" | "satellite" | "terrain" | "hybrid" = "roadmap",
  apiKey?: string
): string {
  const key = getGoogleMapsApiKey(apiKey);
  
  let lyrs = "m"; // default roadmap
  if (style === "satellite") lyrs = "s";
  else if (style === "terrain") lyrs = "p,r"; // physical relief + roads
  else if (style === "hybrid") lyrs = "y"; // satellite + road labels

  if (key) {
    return `https://mt1.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}&key=${encodeURIComponent(key)}`;
  }
  
  // Fallback to high-resolution Google Maps public raster tiles
  return `https://mt1.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`;
}
