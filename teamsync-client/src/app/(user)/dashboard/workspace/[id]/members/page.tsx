"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";
import ConfirmModal from "@/global_components/confirmModal";

interface MemberUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Member {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  user: MemberUser;
}

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await api.get(`/user/workspace/${workspaceId}/members`);
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch members:", error);
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Could not load workspace members.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMembers();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchMembers]);

  const handleRemoveMember = async (memberId: string) => {
    setDeletingId(memberId);
    try {
      const res = await api.delete(
        `/user/workspace/${workspaceId}/members/${memberId}`,
      );

      if (res.data.success) {
        showToast.success("Member removed successfully.");
        setMembers((prev) => prev.filter((member) => member.id !== memberId));
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to remove member.",
        );
      }
    } finally {
      setDeletingId(null);
      setSelectedMember(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-[#FF6B6B] text-white";
      case "ADMIN":
        return "bg-[#FFD93D] text-black";
      default:
        return "bg-[#4D96FF] text-white";
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
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b-4 border-black pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black uppercase tracking-tight sm:text-4xl">
                Workspace Members
              </h1>
              <span className="border-2 border-black bg-[#4D96FF] px-2.5 py-0.5 text-xs font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {members.length} Active
              </span>
            </div>
            <p className="font-bold text-gray-700 text-sm sm:text-base mt-1">
              Manage existing workspace team members and their roles.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchMembers();
            }}
            className="flex items-center justify-center gap-2 border-3 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Members Grid/List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-black uppercase tracking-wide">
              Team Roster
            </h2>
          </div>

          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-4 border-black bg-white p-10 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="border-3 border-black bg-[#FFD93D] p-3 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black uppercase">No Members Found</h3>
              <p className="text-sm font-bold text-gray-600 max-w-sm">
                There are no members in this workspace currently.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex min-w-0 items-center justify-between gap-3 border-3 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  {/* User Info */}
                  <div className="flex min-w-0 items-center gap-3 truncate">
                    <div className="truncate space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-black truncate max-w-36 sm:max-w-44">
                          {member.user.name}
                        </span>
                        <span
                          className={`border border-black px-1.5 py-0.2 text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getRoleBadgeColor(
                            member.role,
                          )}`}
                        >
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-500 truncate">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {member.role !== "OWNER" && (
                    <button
                      onClick={() =>
                        setSelectedMember({
                          id: member.id,
                          name: member.user.name,
                        })
                      }
                      disabled={deletingId === member.id}
                      className="ml-2 border-2 border-black bg-[#FF6B6B] p-2 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                      title="Remove Member"
                    >
                      {deletingId === member.id ? (
                        <HypotrochoidLoader />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}

                  {member.role === "OWNER" && (
                    <div
                      className="ml-2 p-2 border-2 border-black bg-[#6BCB77] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      title="Workspace Creator"
                    >
                      <ShieldCheck className="h-4 w-4 stroke-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!selectedMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${selectedMember?.name} from this workspace?`}
        loading={deletingId === selectedMember?.id}
        onClose={() => setSelectedMember(null)}
        onConfirm={async () => {
          if (selectedMember) {
            await handleRemoveMember(selectedMember.id);
          }
        }}
      />
    </div>
  );
}
