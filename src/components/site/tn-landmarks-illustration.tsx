import React from "react";

interface TNLandmarkProps {
  landmark?: "kanyakumari" | "madurai" | "rameswaram" | "ooty" | "kodaikanal" | "default";
  className?: string;
}

export const TNLandmarksIllustration: React.FC<TNLandmarkProps> = ({
  landmark = "kanyakumari",
  className = "w-full h-auto"
}) => {
  if (landmark === "kanyakumari") {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-cyan-950 via-slate-900 to-emerald-950 p-4 border border-cyan-500/30 shadow-xl text-white ${className}`}>
        <svg viewBox="0 0 400 140" className="w-full h-28 opacity-95" fill="none">
          {/* Sunset Sun */}
          <circle cx="200" cy="80" r="32" fill="url(#sun-grad)" opacity="0.95" />
          
          {/* Coast Waves & Rock Outcrops */}
          <path d="M0,105 Q80,85 160,105 T320,100 T400,115 L400,140 L0,140 Z" fill="#0f2b26" opacity="0.9" />
          <path d="M0,120 Q100,105 200,115 T400,120 L400,140 L0,140 Z" fill="#061d19" />

          {/* Vivekananda Rock Memorial */}
          <g transform="translate(130, 50) scale(0.65)">
            <path d="M10,60 Q40,50 80,55 T150,60 L160,80 L0,80 Z" fill="#1e293b" />
            <path d="M60,55 L60,35 Q80,20 100,35 L100,55 Z" fill="#e2e8f0" opacity="0.95" />
            <circle cx="80" cy="22" r="5" fill="#fbbf24" />
          </g>

          {/* Thiruvalluvar Statue */}
          <g transform="translate(250, 35) scale(0.55)">
            <path d="M20,80 L20,30 Q30,10 40,30 L40,80 Z" fill="#334155" />
            <circle cx="30" cy="18" r="8" fill="#e2e8f0" />
          </g>

          <defs>
            <linearGradient id="sun-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
          <span>🗿 Vivekananda Rock & Thiruvalluvar Statue</span>
        </div>
      </div>
    );
  }

  if (landmark === "madurai") {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-950 via-slate-900 to-emerald-950 p-4 border border-amber-500/30 shadow-xl text-white ${className}`}>
        <svg viewBox="0 0 400 140" className="w-full h-28 opacity-95" fill="none">
          <g transform="translate(150, 5) scale(0.75)">
            <path d="M20,140 L35,20 L65,20 L80,140 Z" fill="#d97706" opacity="0.9" />
            <line x1="30" y1="40" x2="70" y2="40" stroke="#fef3c7" strokeWidth="3" />
            <line x1="28" y1="65" x2="72" y2="65" stroke="#fef3c7" strokeWidth="3" />
            <line x1="25" y1="90" x2="75" y2="90" stroke="#fef3c7" strokeWidth="3" />
            <line x1="22" y1="115" x2="78" y2="115" stroke="#fef3c7" strokeWidth="3" />
            <circle cx="50" cy="12" r="5" fill="#fbbf24" />
          </g>
        </svg>

        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
          <span>🛕 Meenakshi Temple Gopuram</span>
        </div>
      </div>
    );
  }

  if (landmark === "rameswaram") {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-teal-950 via-slate-900 to-cyan-950 p-4 border border-teal-500/30 shadow-xl text-white ${className}`}>
        <svg viewBox="0 0 400 140" className="w-full h-28 opacity-95" fill="none">
          {/* Pamban Bridge Pillars */}
          <path d="M0,100 L400,100" stroke="#38bdf8" strokeWidth="4" />
          <line x1="50" y1="100" x2="50" y2="130" stroke="#0284c7" strokeWidth="6" />
          <line x1="120" y1="100" x2="120" y2="130" stroke="#0284c7" strokeWidth="6" />
          <line x1="190" y1="100" x2="190" y2="130" stroke="#0284c7" strokeWidth="6" />
          <line x1="260" y1="100" x2="260" y2="130" stroke="#0284c7" strokeWidth="6" />
          <line x1="330" y1="100" x2="330" y2="130" stroke="#0284c7" strokeWidth="6" />
        </svg>

        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-extrabold text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30 backdrop-blur-md">
          <span>🌉 Pamban Sea Bridge & Ocean Corridor</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-4 border border-emerald-500/30 shadow-xl text-white ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Tamil Nadu Discovery</span>
          <h4 className="font-bold text-sm text-white">Southern Coastal & Heritage Corridor</h4>
        </div>
        <span className="text-2xl">🌴</span>
      </div>
    </div>
  );
};
