import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 250,
  gradientColor = "#3b82f620",
  gradientOpacity = 0.8,
  gradientFrom = "#10b981",
  gradientTo = "#3b82f6",
  ...props
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!cardRef.current) return;
      const { left, top } = cardRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      cardRef.current.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    },
    []
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.addEventListener("mousemove", handleMouseMove);
    return () => card.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div
      ref={cardRef}
      style={
        {
          "--gradient-size": `${gradientSize}px`,
          "--gradient-color": gradientColor,
          "--gradient-opacity": gradientOpacity,
          "--gradient-from": gradientFrom,
          "--gradient-to": gradientTo,
        } as React.CSSProperties
      }
      className={cn(
        "group relative flex size-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 p-6 text-slate-100 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10",
        className
      )}
      {...props}
    >
      <div className="relative z-10 w-full">{children}</div>
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(var(--gradient-size) circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--gradient-color), transparent 80%)`,
        }}
      />
    </div>
  );
}
