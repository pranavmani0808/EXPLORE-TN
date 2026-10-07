import React, { useEffect, useRef } from "react";
import { ExploreTNEvent } from "@/lib/types/events";
import { getGoogleTileUrl } from "@/lib/google-maps-loader";
import { Link } from "@tanstack/react-router";
import { MapPin, CalendarDays, ExternalLink, ArrowRight } from "lucide-react";

interface EventDiscoveryMapProps {
  events: ExploreTNEvent[];
  selectedEventId?: string;
  onSelectEvent?: (event: ExploreTNEvent) => void;
  className?: string;
}

export const EventDiscoveryMap: React.FC<EventDiscoveryMapProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (leafletMapRef.current) return;

      const L = await import("leaflet");
      if (!isMounted || !mapContainerRef.current) return;

      // Fix Leaflet icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Default Tamil Nadu center: [10.8505, 78.7047] (Trichy)
      const map = L.map(mapContainerRef.current, {
        center: [10.8505, 78.7047],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      // Google Maps Roadmap tiles
      const tileUrl = getGoogleTileUrl("roadmap");
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      leafletMapRef.current = map;

      renderMarkers(L, map, markersGroup);
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update markers when events or selection changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    import("leaflet").then((L) => {
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        renderMarkers(L, leafletMapRef.current, markersLayerRef.current);
      }
    });
  }, [events, selectedEventId]);

  const renderMarkers = (L: any, map: any, group: any) => {
    events.forEach((event) => {
      if (!event.latitude || !event.longitude) return;

      const isSelected = selectedEventId === event.id;

      // Custom marker icon with category emoji
      const customIcon = L.divIcon({
        className: "custom-event-marker",
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? "44px" : "36px"};
            height: ${isSelected ? "44px" : "36px"};
            border-radius: 50%;
            background: ${isSelected ? "#10b981" : "#09090b"};
            border: 2px solid ${isSelected ? "#ffffff" : "#10b981"};
            box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 12px ${isSelected ? "rgba(16,185,129,0.8)" : "rgba(16,185,129,0.3)"};
            font-size: ${isSelected ? "20px" : "16px"};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span>${event.categoryIcon}</span>
          </div>
        `,
        iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
        iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
      });

      const marker = L.marker([event.latitude, event.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="
          background: #09090b;
          color: #f4f4f5;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(16,185,129,0.4);
          font-family: system-ui, sans-serif;
          max-width: 240px;
        ">
          <div style="font-size: 10px; font-weight: 700; color: #34d399; margin-bottom: 4px; text-transform: uppercase;">
            ${event.categoryLabel}
          </div>
          <div style="font-weight: 800; font-size: 13px; line-height: 1.3; margin-bottom: 6px; color: #ffffff;">
            ${event.title}
          </div>
          <div style="font-size: 11px; color: #a1a1aa; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            📍 ${event.locationName}, ${event.district}
          </div>
          <div style="font-size: 11px; color: #d4d4d8; font-weight: 600; margin-bottom: 8px;">
            📅 ${event.startDate} • ${event.priceDisplay}
          </div>
          <a href="/events/${event.slug}" style="
            display: block;
            text-align: center;
            background: #10b981;
            color: #09090b;
            font-weight: 800;
            font-size: 11px;
            padding: 6px 10px;
            border-radius: 8px;
            text-decoration: none;
          ">
            Explore Experience →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: "dark-custom-leaflet-popup",
      });

      marker.on("click", () => {
        if (onSelectEvent) onSelectEvent(event);
      });

      marker.addTo(group);
    });
  };

  return (
    <div className={`relative w-full h-[500px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Map Header Floating Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
          <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white font-display">
            {events.length} Tamil Nadu Events Plotted on GIS Map
          </span>
        </div>
      </div>
    </div>
  );
};
