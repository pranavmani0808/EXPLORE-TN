import React, { useEffect, useRef } from "react";

export interface PlaceCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapCanvasPlace {
  id: string;
  name: string;
  coordinates: PlaceCoordinates;
  district?: string;
  category?: string;
  tagline?: string;
  image?: string;
  [key: string]: any;
}

export interface MapCanvasProps {
  apiKey?: string;
  places: MapCanvasPlace[];
  selectedPlace?: MapCanvasPlace | null;
  onSelectPlace?: (place: MapCanvasPlace) => void;
  onBoundsChange?: (bounds: { minLon: number; minLat: number; maxLon: number; maxLat: number }) => void;
  className?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  apiKey,
  places = [],
  selectedPlace,
  onSelectPlace,
  onBoundsChange,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});

  useEffect(() => {
    // If google maps API key is provided, initialize Google Map instance
    const googleApiKey = apiKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) return;

    const loadGoogleMaps = () => {
      if ((window as any).google && (window as any).google.maps) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || googleMapRef.current) return;

      const darkMapStyle = [
        { elementType: "geometry", stylers: [{ color: "#0B0F14" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0B0F14" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8a9ba8" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#10b981" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#121821" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#032030" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#0284c7" }] },
      ];

      const tamilNaduCenter = { lat: 11.1085, lng: 78.3379 };

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: tamilNaduCenter,
        zoom: 9,
        styles: darkMapStyle,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
      });

      googleMapRef.current = map;

      map.addListener("idle", () => {
        const bounds = map.getBounds();
        if (bounds && onBoundsChange) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          onBoundsChange({
            minLon: sw.lng(),
            minLat: sw.lat(),
            maxLon: ne.lng(),
            maxLat: ne.lat(),
          });
        }
      });
    };

    loadGoogleMaps();
  }, [apiKey, onBoundsChange]);

  useEffect(() => {
    if (!googleMapRef.current || !(window as any).google) return;

    const map = googleMapRef.current;

    Object.values(markersRef.current).forEach((marker: any) => marker.setMap(null));
    markersRef.current = {};

    places.forEach((place) => {
      if (!place.coordinates) return;
      const position = { lat: place.coordinates.latitude, lng: place.coordinates.longitude };

      const marker = new (window as any).google.maps.Marker({
        position,
        map,
        title: place.name,
        animation: (window as any).google.maps.Animation.DROP,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: selectedPlace?.id === place.id ? 10 : 7,
          fillColor: selectedPlace?.id === place.id ? "#10b981" : "#f59e0b",
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      });

      marker.addListener("click", () => {
        onSelectPlace?.(place);
        map.panTo(position);
      });

      markersRef.current[place.id] = marker;
    });
  }, [places, selectedPlace, onSelectPlace]);

  useEffect(() => {
    if (selectedPlace && selectedPlace.coordinates && googleMapRef.current && (window as any).google) {
      const pos = { lat: selectedPlace.coordinates.latitude, lng: selectedPlace.coordinates.longitude };
      googleMapRef.current.panTo(pos);
      googleMapRef.current.setZoom(13);
    }
  }, [selectedPlace]);

  return (
    <div className={`relative w-full h-full bg-[#0B0F14] overflow-hidden flex items-center justify-center rounded-3xl ${className || ""}`}>
      {/* Live Google Map Canvas Container */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Fallback Animated Vector Spatial Canvas */}
      {(!apiKey && !(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY) && (
        <>
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#0284c7 1px, #0B0F14 1px)`,
              backgroundSize: "40px 40px",
              backgroundPosition: "0 0, 20px 20px",
            }}
          />

          <div className="absolute top-4 left-4 text-[10px] text-emerald-400/80 uppercase tracking-widest font-mono select-none pointer-events-none z-10 bg-slate-900/80 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
            Vector Spatial Canvas • WGS 84 • Tamil Nadu [11.1085° N, 78.3379° E]
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {places.map((place, index) => {
              const isSelected = selectedPlace?.id === place.id;
              const offsets = [
                { x: -140, y: -70 },
                { x: 160, y: -100 },
                { x: 90, y: 120 },
                { x: -180, y: 130 },
              ];
              const pos = offsets[index % offsets.length];

              return (
                <div
                  key={place.id || index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlace?.(place);
                  }}
                  style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                  className="absolute pointer-events-auto cursor-pointer group animate-bounce-slow"
                >
                  <div className="relative flex flex-col items-center">
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
                    )}

                    <div
                      className={`px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xl border flex items-center gap-1.5 transition-all duration-300 ${
                        isSelected
                          ? "bg-emerald-500 text-black border-emerald-400 scale-110"
                          : "bg-[#121821] text-white border-white/20 group-hover:scale-105 group-hover:border-emerald-400"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {place.name}
                    </div>

                    <div className="w-0.5 h-3 bg-emerald-500/60" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
