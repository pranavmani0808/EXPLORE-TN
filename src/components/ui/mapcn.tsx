import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Layers,
  Maximize2,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types & Interfaces
export interface LatLng {
  latitude: number;
  longitude: number;
}

export type MapStyle = "dark" | "outdoors" | "satellite";

export interface MapContextType {
  center: [number, number];
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setCenter: (center: [number, number]) => void;
  style: MapStyle;
  setStyle: (style: MapStyle) => void;
  selectedMarkerId: string | null;
  setSelectedMarkerId: (id: string | null) => void;
  hoveredMarkerId: string | null;
  setHoveredMarkerId: (id: string | null) => void;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextType | null>(null);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("Map components must be rendered within a <Map> container.");
  }
  return context;
}

interface MarkerContextType {
  latitude: number;
  longitude: number;
  markerId: string;
  isSelected: boolean;
  isHovered: boolean;
}

const MarkerContext = createContext<MarkerContextType | null>(null);

export function useMarker() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker child components must be rendered within a <MapMarker>.");
  }
  return context;
}

// 1. Root <Map> Component
export interface MapProps {
  center?: [number, number];
  zoom?: number;
  style?: MapStyle;
  className?: string;
  children?: ReactNode;
  interactive?: boolean;
}

export function Map({
  center: initialCenter = [10.8, 78.7], // Default Tamil Nadu center
  zoom: initialZoom = 7,
  style: initialStyle = "dark",
  className,
  children,
  interactive = true,
}: MapProps) {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [style, setStyle] = useState<MapStyle>(initialStyle);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <MapContext.Provider
      value={{
        center,
        zoom,
        setZoom,
        setCenter,
        style,
        setStyle,
        selectedMarkerId,
        setSelectedMarkerId,
        hoveredMarkerId,
        setHoveredMarkerId,
        isLoaded,
      }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-elevate select-none",
          style === "dark" && "bg-slate-950 text-slate-100",
          style === "satellite" && "bg-slate-900 text-slate-50",
          style === "outdoors" && "bg-slate-100 text-slate-900",
          className,
        )}
      >
        {/* Background Grid & Stylized Canvas */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Child Layers & Map Elements */}
        {children}
      </div>
    </MapContext.Provider>
  );
}

// 2. <MapMarker> Component
export interface MapMarkerProps {
  latitude: number;
  longitude: number;
  id?: string;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}

export function MapMarker({
  latitude,
  longitude,
  id: customId,
  onClick,
  children,
  className,
}: MapMarkerProps) {
  const generatedId = useId();
  const markerId = customId || generatedId;
  const { center, zoom, selectedMarkerId, setSelectedMarkerId, hoveredMarkerId, setHoveredMarkerId } =
    useMap();

  // Convert lat/lng to percentage offset relative to center & zoom
  const latDiff = latitude - center[0];
  const lngDiff = longitude - center[1];
  const scale = Math.pow(2, zoom - 7);

  const leftPct = 50 + lngDiff * 15 * scale;
  const topPct = 50 - latDiff * 25 * scale;

  const isSelected = selectedMarkerId === markerId;
  const isHovered = hoveredMarkerId === markerId;

  // Don't render markers off-screen
  if (leftPct < -10 || leftPct > 110 || topPct < -10 || topPct > 110) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMarkerId(isSelected ? null : markerId);
    onClick?.();
  };

  return (
    <MarkerContext.Provider value={{ latitude, longitude, markerId, isSelected, isHovered }}>
      <div
        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
        className={cn("absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer", className)}
        onClick={handleClick}
        onMouseEnter={() => setHoveredMarkerId(markerId)}
        onMouseLeave={() => setHoveredMarkerId(null)}
      >
        {children}
      </div>
    </MarkerContext.Provider>
  );
}

// 3. <MarkerContent> Component
export interface MarkerContentProps {
  children?: ReactNode;
  className?: string;
}

export function MarkerContent({ children, className }: MarkerContentProps) {
  const { isSelected, isHovered } = useMarker();

  return (
    <motion.div
      whileHover={{ scale: 1.15 }}
      animate={{ scale: isSelected ? 1.25 : 1 }}
      className={cn("relative flex items-center justify-center", className)}
    >
      {children || (
        <span className="relative flex size-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/30" />
        </span>
      )}
    </motion.div>
  );
}

// 4. <MarkerLabel> Component
export interface MarkerLabelProps {
  children: ReactNode;
  className?: string;
}

export function MarkerLabel({ children, className }: MarkerLabelProps) {
  return (
    <span
      className={cn(
        "mt-1 block whitespace-nowrap rounded-md border border-border/50 bg-background/80 px-2 py-0.5 font-display text-[11px] font-medium tracking-wide shadow-sm backdrop-blur-md",
        className,
      )}
    >
      {children}
    </span>
  );
}

// 5. <MarkerPopup> Component
export interface MarkerPopupProps {
  children?: ReactNode;
  title?: string;
  rating?: number;
  className?: string;
}

export function MarkerPopup({ children, title, rating, className }: MarkerPopupProps) {
  const { isSelected, markerId } = useMarker();
  const { setSelectedMarkerId } = useMap();

  if (!isSelected) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        className={cn(
          "absolute bottom-full left-1/2 mb-3 -translate-x-1/2 z-30 w-56 rounded-2xl border border-border bg-card/95 p-3.5 shadow-elevate backdrop-blur-xl",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setSelectedMarkerId(null)}
          className="absolute right-2.5 top-2.5 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close popup"
        >
          <X className="size-3.5" />
        </button>

        {title && (
          <div className="mb-1.5 flex items-center justify-between pr-4">
            <h4 className="font-display text-xs font-semibold text-foreground">{title}</h4>
            {rating && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                <Star className="size-3 fill-amber-500" /> {rating}
              </span>
            )}
          </div>
        )}

        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// 6. <MarkerTooltip> Component
export interface MarkerTooltipProps {
  children: ReactNode;
  className?: string;
}

export function MarkerTooltip({ children, className }: MarkerTooltipProps) {
  const { isHovered, isSelected } = useMarker();

  if (!isHovered || isSelected) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover/90 px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

// 7. Standalone <MapPopup> Component
export interface MapPopupProps {
  latitude: number;
  longitude: number;
  children: ReactNode;
  className?: string;
}

export function MapPopup({ latitude, longitude, children, className }: MapPopupProps) {
  const { center, zoom } = useMap();
  const latDiff = latitude - center[0];
  const lngDiff = longitude - center[1];
  const scale = Math.pow(2, zoom - 7);

  const leftPct = 50 + lngDiff * 15 * scale;
  const topPct = 50 - latDiff * 25 * scale;

  if (leftPct < -10 || leftPct > 110 || topPct < -10 || topPct > 110) {
    return null;
  }

  return (
    <div
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-full z-25 mb-2 rounded-2xl border border-border bg-card/95 p-3 shadow-elevate backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

// 8. <MapControls> Component
export interface MapControlsProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

export function MapControls({ position = "top-right", className }: MapControlsProps) {
  const { setZoom, setCenter, style, setStyle } = useMap();

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div className={cn("absolute z-30 flex flex-col gap-2", positionClasses[position], className)}>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/80 shadow-md backdrop-blur-md">
        <button
          onClick={() => setZoom((z) => Math.min(z + 1, 14))}
          className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          onClick={() => setZoom((z) => Math.max(z - 1, 4))}
          className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          onClick={() => {
            setCenter([10.8, 78.7]);
            setZoom(7);
          }}
          className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Reset map view"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <div className="flex overflow-hidden rounded-2xl border border-border bg-card/80 p-0.5 shadow-md backdrop-blur-md">
        {(["dark", "outdoors", "satellite"] as MapStyle[]).map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={cn(
              "rounded-xl px-2 py-1 text-[10px] font-semibold capitalize transition-all",
              style === s
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// 9. <MapRoute> Component
export interface MapRouteProps {
  coordinates: Array<[number, number]>;
  color?: string;
  weight?: number;
  animated?: boolean;
  className?: string;
}

export function MapRoute({
  coordinates,
  color = "#10b981",
  weight = 3,
  animated = false,
  className,
}: MapRouteProps) {
  const { center, zoom } = useMap();
  const scale = Math.pow(2, zoom - 7);

  if (!coordinates || coordinates.length < 2) return null;

  const pointsString = coordinates
    .map(([lat, lng]) => {
      const x = 50 + (lng - center[1]) * 15 * scale;
      const y = 50 - (lat - center[0]) * 25 * scale;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className={cn("absolute inset-0 size-full pointer-events-none z-10", className)} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={pointsString}
        fill="none"
        stroke={color}
        strokeWidth={weight * 0.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={animated ? "4 4" : undefined}
        className={animated ? "animate-pulse" : undefined}
      />
    </svg>
  );
}

// 10. <MapArc> Component
export interface MapArcProps {
  data: Array<{ start: [number, number]; end: [number, number]; color?: string }>;
  className?: string;
}

export function MapArc({ data, className }: MapArcProps) {
  const { center, zoom } = useMap();
  const scale = Math.pow(2, zoom - 7);

  if (!data || data.length === 0) return null;

  return (
    <svg className={cn("absolute inset-0 size-full pointer-events-none z-10", className)} viewBox="0 0 100 100" preserveAspectRatio="none">
      {data.map((arc, i) => {
        const x1 = 50 + (arc.start[1] - center[1]) * 15 * scale;
        const y1 = 50 - (arc.start[0] - center[0]) * 25 * scale;
        const x2 = 50 + (arc.end[1] - center[1]) * 15 * scale;
        const y2 = 50 - (arc.end[0] - center[0]) * 25 * scale;

        const controlX = (x1 + x2) / 2;
        const controlY = Math.min(y1, y2) - 15;

        const pathD = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;

        return (
          <g key={i}>
            <path
              d={pathD}
              fill="none"
              stroke={arc.color || "#f59e0b"}
              strokeWidth="0.8"
              strokeDasharray="2 3"
            />
            <circle cx={x1} cy={y1} r="0.8" fill={arc.color || "#f59e0b"} />
            <circle cx={x2} cy={y2} r="0.8" fill={arc.color || "#f59e0b"} />
          </g>
        );
      })}
    </svg>
  );
}

// 11. <MapGeoJSON> Component
export interface MapGeoJSONProps {
  data: any;
  fillColor?: string;
  strokeColor?: string;
  className?: string;
}

export function MapGeoJSON({
  data,
  fillColor = "rgba(16, 185, 129, 0.12)",
  strokeColor = "#10b981",
  className,
}: MapGeoJSONProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none z-5 opacity-80", className)}>
      {/* GeoJSON layer fallback container */}
    </div>
  );
}

// 12. <MapClusterLayer> Component
export interface MapClusterLayerProps {
  data: Array<{ latitude: number; longitude: number; [key: string]: any }>;
  radius?: number;
  className?: string;
}

export function MapClusterLayer({ data, radius = 40, className }: MapClusterLayerProps) {
  const { zoom } = useMap();

  if (!data || data.length === 0) return null;

  // Simple zoom-based marker aggregator
  const isClustered = zoom < 7;

  if (!isClustered) {
    return (
      <>
        {data.map((item, idx) => (
          <MapMarker key={idx} latitude={item.latitude} longitude={item.longitude}>
            <MarkerContent>
              <span className="size-3 rounded-full bg-emerald-500" />
            </MarkerContent>
          </MapMarker>
        ))}
      </>
    );
  }

  return (
    <MapMarker latitude={data[0].latitude} longitude={data[0].longitude}>
      <MarkerContent>
        <div className="flex size-7 items-center justify-center rounded-full bg-emerald-600 font-display text-xs font-bold text-white shadow-lg ring-4 ring-emerald-500/30">
          {data.length}
        </div>
      </MarkerContent>
    </MapMarker>
  );
}
