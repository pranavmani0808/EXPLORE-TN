import { useEffect, useRef } from "react";
import type { ExplorerPlace } from "@/lib/data/canonical-places";

export function ExploreCatalogMap({
  places,
  selectedSlug,
  onSelect,
}: {
  places: ExplorerPlace[];
  selectedSlug?: string | null;
  onSelect: (place: ExplorerPlace) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const leafletModuleRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || leafletMapRef.current) return;
    let isMounted = true;

    async function initLeaflet() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (!isMounted || !mapContainerRef.current || leafletMapRef.current) return;

      leafletModuleRef.current = L;
      const map = L.map(mapContainerRef.current, {
        center: [11.1, 78.4],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletMapRef.current = map;
    }

    initLeaflet();
    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    places.forEach((place) => {
      const isSelected = selectedSlug === place.slug;
      const customIcon = L.divIcon({
        className: `explore-pin-${place.slug}`,
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            ${isSelected ? '<span style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(16,185,129,0.35);animation:ping 1.5s infinite;"></span>' : ""}
            <div style="
              background:${isSelected ? "#10b981" : "#0f172a"};
              border:2px solid ${isSelected ? "#6ee7b7" : "#38bdf8"};
              width:${isSelected ? "22px" : "14px"};
              height:${isSelected ? "22px" : "14px"};
              border-radius:50%;
              box-shadow:0 4px 14px rgba(0,0,0,0.45);
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([place.latitude, place.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(map);

      marker.bindTooltip(place.name, {
        permanent: isSelected,
        direction: "auto",
        offset: [0, -10],
        className: "custom-decluttered-map-tooltip",
      });

      marker.on("click", () => {
        onSelectRef.current(place);
        map.flyTo([place.latitude, place.longitude], 10, { animate: true, duration: 0.8 });
      });

      markersRef.current[place.slug] = marker;
    });

    if (selectedSlug) {
      const selected = places.find((p) => p.slug === selectedSlug);
      if (selected) {
        map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 9), {
          animate: true,
          duration: 0.7,
        });
      }
    }
  }, [places, selectedSlug]);

  return <div ref={mapContainerRef} className="absolute inset-0 size-full" />;
}
