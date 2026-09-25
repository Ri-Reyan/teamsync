"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { UserPlus, Mail, Clock, Trash2, RefreshCw } from "lucide-react";
import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import SendInvitationModal from "@/app/(user)/_components/SendInvitationModal";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

interface PendingInvitation {
  id: string;
  member_email: string;
  role: string;
  createdAt: string;
}

export default function InvitationsPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await api.get(`/user/workspace/${workspaceId}/invite`);
      if (res.data.success) {
        setInvitations(res.data.data);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch invitations:", error);
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Could not load invitations",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInvitations();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchInvitations]);

  const handleCancelInvite = async (inviteId: string) => {
    setCancelingId(inviteId);
    try {
      const res = await api.delete(`/user/workspace/${workspaceId}/invite`, {
        data: {
          inviteId,
        },
      });
      if (res.data.success) {
        showToast.success("Invitation canceled successfully.");
        setInvitations((prev) => prev.filter((item) => item.id !== inviteId));
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to cancel invitation.",
        );
      }
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF5]">
        <HypotrochoidLoader size={40} color="#000000" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] p-4 sm:p-10 font-sans text-black">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b-4 border-black pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black uppercase tracking-tight sm:text-4xl">
                Team Invitations
              </h1>
              <span className="border-2 border-black bg-[#FFD93D] px-2 py-0.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {invitations.length} Pending
              </span>
            </div>
            <p className="font-bold text-gray-700 text-sm sm:text-base mt-1">
              Invite new members and manage pending workspace access requests.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 border-3 border-black bg-[#6BCB77] px-5 py-2.5 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <UserPlus className="h-5 w-5 stroke-[2.5]" />
            <span>Send Invitation</span>
          </button>
        </div>

        {/* Pending Invitations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-wide flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Pending Invitations</span>
            </h2>
            <button
              onClick={() => {
                setLoading(true);
                fetchInvitations();
              }}
              className="flex items-center gap-1 border-2 border-black bg-white px-2.5 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-4 border-black bg-white p-10 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="border-3 border-black bg-[#4D96FF] p-3 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black uppercase">
                No Pending Invitations
              </h3>
              <p className="text-sm font-bold text-gray-600 max-w-sm">
                There are no active invites sent for this workspace. Click the
                button above to invite your team.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex min-w-0 items-center justify-between gap-3 border-3 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="min-w-0 max-w-full truncate font-black text-sm text-black sm:max-w-55">
                        {invite.member_email}
                      </span>
                      <span className="border border-black bg-[#FFD93D] px-1.5 py-0.2 text-[10px] font-black uppercase">
                        {invite.role}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500">
                      Sent on {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCancelInvite(invite.id as string)}
                    disabled={cancelingId === invite.id}
                    className="border-2 border-black bg-[#FF6B6B] p-2 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                    title="Cancel Invitation"
                  >
                    {cancelingId === invite.id ? (
                      <HypotrochoidLoader size={16} />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SendInvitationModal
        isOpen={isModalOpen}
        workspaceId={workspaceId}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInvitations}
      />
    </div>
  );
}
