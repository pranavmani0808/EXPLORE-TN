import React from "react";

export function KolamDivider({ className = "my-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center w-full opacity-40 select-none pointer-events-none ${className}`}>
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="absolute px-4 bg-[#09090b] flex items-center gap-2 text-amber-500/60">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <path d="M5.636 5.636l2.122 2.122M16.243 16.243l2.121 2.121M5.636 18.364l2.122-2.122M16.243 7.757l2.121-2.121" />
        </svg>
        <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400/70">❖ ❖ ❖</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <path d="M5.636 5.636l2.122 2.122M16.243 16.243l2.121 2.121M5.636 18.364l2.122-2.122M16.243 7.757l2.121-2.121" />
        </svg>
      </div>
    </div>
  );
}
