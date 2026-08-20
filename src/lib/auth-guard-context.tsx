import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentAuthUser, subscribeToAuthChanges, clearAuthSession, UserProfile } from "./auth-rbac";
import { AuthModal } from "@/components/site/auth-modal";
import { toast } from "sonner";

interface AuthGuardContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  requireAuth: (action: () => void | Promise<void>, promptMessage?: string) => void;
  openAuthModal: (promptMessage?: string) => void;
  closeAuthModal: () => void;
  logout: () => void;
}

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(undefined);

export function AuthGuardProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    setUser(getCurrentAuthUser());
    const unsubscribe = subscribeToAuthChanges((updatedUser) => {
      setUser(updatedUser);
    });
    return () => unsubscribe();
  }, []);

  const requireAuth = (action: () => void | Promise<void>, customPromptMessage?: string) => {
    const currentUser = getCurrentAuthUser();
    if (currentUser) {
      // User is already authenticated -> execute action immediately
      Promise.resolve(action()).catch((err) => {
        console.error("[AuthGuard] Action execution error:", err);
      });
    } else {
      // User is unauthenticated -> preserve action and open modal
      setPendingAction(() => action);
      setPromptMessage(customPromptMessage || "Sign in to save this item to your account.");
      setIsModalOpen(true);
    }
  };

  const openAuthModal = (customPromptMessage?: string) => {
    setPromptMessage(customPromptMessage);
    setIsModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  const handleAuthSuccess = async () => {
    const updatedUser = getCurrentAuthUser();
    setUser(updatedUser);

    if (pendingAction) {
      try {
        await pendingAction();
        toast.success("Action completed successfully ✓");
      } catch (err) {
        console.error("[AuthGuard] Failed to complete pending action:", err);
      } finally {
        setPendingAction(null);
      }
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    toast.info("Signed out of ExplorerTN");
  };

  return (
    <AuthGuardContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        requireAuth,
        openAuthModal,
        closeAuthModal,
        logout,
      }}
    >
      {children}
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
        promptMessage={promptMessage}
      />
    </AuthGuardContext.Provider>
  );
}

export function useAuthGuard(): AuthGuardContextType {
  const context = useContext(AuthGuardContext);
  if (!context) {
    throw new Error("useAuthGuard must be used within an AuthGuardProvider");
  }
  return context;
}
