import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

export function RouteLoadingBar() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" || s.isLoading });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(15);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);
    } else {
      setProgress(100);
      timer = setTimeout(() => {
        setProgress(0);
      }, 300);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-1 bg-zinc-950/20 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
