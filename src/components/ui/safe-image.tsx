import React, { useState } from "react";

const knownFailedUrls = new Set<string>();

const FALLBACK_BY_CATEGORY: Record<string, string> = {
  beaches: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  coastal: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  temples: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
  temple: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
  waterfalls: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
  waterfall: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
  hills: "https://images.unsplash.com/photo-1589705298607-4e9640426b38?auto=format&fit=crop&w=1000&q=80",
  mountain: "https://images.unsplash.com/photo-1589705298607-4e9640426b38?auto=format&fit=crop&w=1000&q=80",
  heritage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
  fort: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
  palace: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
  food: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80",
  restaurant: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80",
  default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
};

export function getCategoryFallback(category?: string): string {
  if (!category) return FALLBACK_BY_CATEGORY.default;
  const catKey = category.toLowerCase().trim();
  return FALLBACK_BY_CATEGORY[catKey] || FALLBACK_BY_CATEGORY.default;
}

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  category?: string;
  fallbackSrc?: string;
}

export function SafeImage({ src, category, fallbackSrc, alt = "", className, ...props }: SafeImageProps) {
  const defaultFallback = fallbackSrc || getCategoryFallback(category);
  const initialSrc = (src && !knownFailedUrls.has(src)) ? src : defaultFallback;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (src) {
      knownFailedUrls.add(src);
    }
    if (imgSrc !== defaultFallback) {
      setImgSrc(defaultFallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
