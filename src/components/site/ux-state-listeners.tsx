import { useState, useEffect } from "react";
import { WifiOff, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ExplorerOnboardingModal } from "@/components/site/explorer-onboarding-modal";

export function UxStateListeners() {
  const [isOffline, setIsOffline] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

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

    const handleOpenOnboarding = () => {
      setOnboardingOpen(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("etn_open_onboarding", handleOpenOnboarding);

    // Initial check for offline
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    // Auto-trigger onboarding modal pop-up on first visit if not completed
    const completed = localStorage.getItem("etn_onboarding_completed");
    if (!completed) {
      const timer = setTimeout(() => {
        setOnboardingOpen(true);
      }, 1000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("etn_open_onboarding", handleOpenOnboarding);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("etn_open_onboarding", handleOpenOnboarding);
    };
  }, []);

  return (
    <>
      <ExplorerOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-center gap-2 shadow-md font-sans">
          <WifiOff className="size-4 animate-pulse" />
          <span>Offline Mode Active — Map routes and saved trips are loaded from local cache.</span>
        </div>
      )}
    </>
  );
}
