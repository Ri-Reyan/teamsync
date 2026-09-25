"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Folder,
  Crown,
  Sparkles,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import CreateWorkspaceModal from "../_components/CreateWorkspaceModal";
import { useAuthModal } from "@/context/auth.context";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";
import { showToast } from "@/lib/toast";

interface Workspace {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const router = useRouter();
  const { user, setUser, setIsAuthenticated } = useAuthModal();

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await api.get("/user/workspace");
      if (res.data.success) {
        setWorkspaces(res.data.data);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch workspaces:", error);
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to load workspaces.",
        );
      }
    }
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      await fetchWorkspaces();
      setLoading(false);
    };
    initialFetch();
  }, [fetchWorkspaces]);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );
    if (!sessionId) return;

    const confirmPayment = async () => {
      try {
        const response = await api.post("/user/payment/confirm", {
          sessionId,
        });
        const confirmedUser = response.data?.data;

        setUser((currentUser) =>
          currentUser && confirmedUser
            ? {
                ...currentUser,
                package: confirmedUser.package,
                isPremium: confirmedUser.isPremium,
              }
            : currentUser,
        );
        showToast.success("Payment completed. Your plan is now active.");
        router.replace("/dashboard");
      } catch (error: unknown) {
        showToast.error(
          isAxiosError(error)
            ? error.response?.data?.message || "Payment confirmation failed."
            : "Payment confirmation failed.",
        );
      }
    };

    confirmPayment();
  }, [router, setUser]);

  const handleSuccess = () => {
    fetchWorkspaces();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(error.response?.data?.message || "Failed to log out.");
      } else {
        showToast.error("Failed to log out.");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF5]">
        <HypotrochoidLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] p-4 sm:p-10 font-sans text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b-4 border-black pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={"/"}
                className="text-2xl font-black uppercase tracking-tight sm:text-4xl"
              >
                Dashboard
              </Link>
              <span className="border-2 border-black bg-[#4D96FF] px-2 py-0.5 text-xs font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {workspaces.length} Workspaces
              </span>
            </div>
            <p className="font-bold text-gray-700 text-sm sm:text-base mt-1">
              Select or manage your workspaces
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 border-3 border-black bg-[#FF6B6B] px-5 py-2.5 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <LogOut className="h-5 w-5 stroke-3" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>

            {user?.package !== "ENTERPRISE" && (
              <Link
                href="/dashboard/pricing"
                className="flex items-center gap-2 border-3 border-black bg-[#FFD93D] px-4 py-2.5 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <Crown className="h-5 w-5 fill-black" />
                <span>Upgrade Plan</span>
              </Link>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 border-3 border-black bg-[#FF6B6B] px-5 py-2.5 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Plus className="h-5 w-5 stroke-3" />
              <span>Add Workspace</span>
            </button>
          </div>
        </div>

        {/* Subscription Upgrade Promo Banner */}
        {user?.package === "STARTER" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-3 border-black bg-[#6BCB77] p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black uppercase text-black">
                <Sparkles className="h-5 w-5 fill-black" />
                <span>Unlock Unlimited Power</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-black/90">
                Need more workspaces and advanced AI capabilities? Upgrade your
                team account today.
              </p>
            </div>

            <Link
              href="/dashboard/pricing"
              className="shrink-0 border-2 border-black bg-white px-4 py-2 font-black text-xs uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all"
            >
              Explore Plans →
            </Link>
          </div>
        )}

        {/* Workspace List or Empty State */}
        <div>
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-4 border-black bg-white p-10 sm:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="border-3 border-black bg-[#FFD93D] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Folder className="h-12 w-12 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase">
                  No Workspaces Found
                </h2>
                <p className="font-bold text-gray-600 text-sm mt-1">
                  Create your first workspace to start collaborating with your
                  team.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="border-3 border-black bg-[#FF6B6B] px-6 py-3 font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Create One Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/dashboard/workspace/${ws.id}/projects`}
                  className="group relative flex flex-col justify-between border-3 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="border-2 border-black bg-[#4D96FF] p-3 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Folder className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-black uppercase tracking-tight group-hover:underline line-clamp-1">
                      {ws.name}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 mt-1">
                      Click to open projects →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
