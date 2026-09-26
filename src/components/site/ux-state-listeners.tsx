import { useState, useEffect } from "react";
import { WifiOff, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function UxStateListeners() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Back online! Your connection has been restored.", {
        icon: <CheckCircle2 className="size-4 text-emerald-400" />,
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error("You are currently offline. ExploreTN will use cached map routes.", {
        icon: <WifiOff className="size-4 text-amber-400" />,
        duration: 8000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="size-4 animate-pulse" />
      <span>Offline Mode Active — Map routes and saved trips are loaded from local cache.</span>
    </div>
  );
}
