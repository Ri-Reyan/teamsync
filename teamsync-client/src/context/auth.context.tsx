"use client";

import { api } from "@/lib/axios";
import { usePathname, useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthMode = "login" | "register";

export interface User {
  id: string;
  name?: string;
  email: string;
  role?: "ADMIN" | "USER";
  platformRole?: "ADMIN" | "USER";
  package: "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
}

interface AuthContextValue {
  isAuthModalOpen: boolean;
  authSession: number;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// একজন ইউজার ADMIN কিনা — role আর platformRole দুই ফিল্ডই সাপোর্ট করার জন্য একটা হেল্পার
function isAdmin(user: User | null) {
  return user?.platformRole === "ADMIN" || user?.role === "ADMIN";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authSession, setAuthSession] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ১) /auth/me শুধু একবার, mount হওয়ার সময় কল হবে — dependency array খালি
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data && res.data.success) {
          setUser(res.data.data || res.data.user || null);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []); // 👈 খালি — শুধু একবার রান হবে

  // ২) role অনুযায়ী redirect — user/pathname বদলালে রান হবে, কিন্তু loading শেষ না হওয়া পর্যন্ত কিছু করবে না
  useEffect(() => {
    if (loading || !isAuthenticated) return;

    const admin = isAdmin(user);

    // ADMIN ইউজার dashboard (non-admin area) এ থাকলে admin/dashboard-এ পাঠাও
    if (admin && pathname.startsWith("/dashboard")) {
      router.replace("/admin/dashboard");
      return;
    }

    // non-ADMIN ইউজার admin area-তে থাকলে dashboard-এ পাঠাও
    if (!admin && pathname.startsWith("/admin")) {
      router.replace("/dashboard");
      return;
    }
  }, [loading, isAuthenticated, user, pathname, router]);

  const value = useMemo(
    () => ({
      isAuthModalOpen,
      authSession,
      authMode,
      openAuthModal: (mode: AuthMode = "login") => {
        setAuthMode(mode);
        setAuthSession((session) => session + 1);
        setIsAuthModalOpen(true);
      },
      closeAuthModal: () => setIsAuthModalOpen(false),
      setAuthMode,
      user,
      setUser,
      loading,
      setLoading,
      isAuthenticated,
      setIsAuthenticated,
    }),
    [authMode, authSession, isAuthModalOpen, user, loading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthModal() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthModal must be used inside AuthProvider");
  }
  return context;
}
