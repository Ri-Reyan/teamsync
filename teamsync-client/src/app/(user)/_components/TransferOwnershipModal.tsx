"use client";

import { useState } from "react";
import { ArrowLeftRight, X, AlertTriangle, Check } from "lucide-react";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

// Workspace Member Types
export interface WorkspaceMember {
  id: string; // Member Table ID
  role: "ADMIN" | "MEMBER" | "OWNER";
  createdAt?: string;
  user: {
    id: string;
    name?: string;
    email: string;
    role?: string;
  };
}

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
  isLoadingMembers?: boolean;
  onTransferConfirm: (selectedMemberId: string) => Promise<void>;
}

export const TransferOwnershipModal = ({
  isOpen,
  onClose,
  members,
  isLoadingMembers = false,
  onTransferConfirm,
}: TransferOwnershipModalProps) => {
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null,
  );
  const [confirmName, setConfirmName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Helper to safely resolve a member's display name
  const getDisplayName = (member: WorkspaceMember | null) => {
    if (!member) return "";
    return (
      member.user.name?.trim() || member.user.email?.split("@")[0] || "User"
    );
  };

  const selectedTargetName = getDisplayName(selectedMember);

  const isNameMatched =
    Boolean(selectedTargetName) &&
    confirmName.trim().toLowerCase() === selectedTargetName.toLowerCase();

  const handleTransfer = async () => {
    if (!selectedMember || !isNameMatched) return;

    try {
      setIsLoading(true);
      await onTransferConfirm(selectedMember.id);
      handleClose();
    } catch (error) {
      console.error("Failed to transfer ownership:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMember(null);
    setConfirmName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {/* Modal Box */}
      <div className="relative w-full max-w-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute right-4 top-4 border-2 border-black bg-[#FF6B6B] p-1 text-black transition-transform hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0 active:translate-y-0 disabled:opacity-50"
        >
          <X className="h-5 w-5 stroke-3" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="border-2 border-black bg-[#FFD93D] p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ArrowLeftRight className="h-6 w-6 stroke-3 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-wide">
              Transfer Ownership
            </h2>
            <p className="text-xs font-bold text-gray-600">
              Pass primary workspace control to another member
            </p>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="mb-6 flex gap-3 border-2 border-black bg-[#FFE6E6] p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <AlertTriangle className="h-5 w-5 shrink-0 stroke-[2.5] text-[#FF6B6B]" />
          <p className="text-xs font-bold leading-tight text-black">
            Warning: Once transferred, you will lose owner privileges and become
            an admin.
          </p>
        </div>

        {/* Step 1: Select Member */}
        <div className="mb-5 space-y-2">
          <label className="block text-xs font-black uppercase text-black">
            1. Select New Owner
          </label>

          <div className="max-h-48 divide-y-2 divide-black overflow-y-auto border-2 border-black bg-gray-50">
            {isLoadingMembers ? (
              <div className="flex items-center justify-center p-6 text-xs font-bold text-black">
                <HypotrochoidLoader size={16} className="mr-2" />
                Loading workspace members...
              </div>
            ) : members.length === 0 ? (
              <p className="p-4 text-center text-xs font-bold text-gray-500">
                No eligible members found in workspace.
              </p>
            ) : (
              members.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                const displayName = getDisplayName(member);
                const initial = displayName.charAt(0).toUpperCase() || "U";

                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      if (isLoading) return;
                      setSelectedMember(member);
                      setConfirmName("");
                    }}
                    className={`flex cursor-pointer items-center justify-between p-3 transition-colors ${
                      isSelected
                        ? "bg-[#4D96FF] text-white"
                        : "bg-white hover:bg-yellow-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#FFD93D] text-xs font-black uppercase text-black">
                        {initial}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-black ${
                            isSelected ? "text-white" : "text-black"
                          }`}
                        >
                          {displayName}
                        </p>
                        <p
                          className={`text-[10px] font-semibold ${
                            isSelected ? "text-blue-100" : "text-gray-600"
                          }`}
                        >
                          {member.user.name} • {member.user.role}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="border-2 border-black bg-white p-0.5 text-black">
                        <Check className="h-4 w-4 stroke-3" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Step 2: Safety Confirmation Input */}
        {selectedMember && (
          <div className="mb-6 space-y-2">
            <label className="block text-xs font-black uppercase text-black">
              2. Confirm Action
            </label>
            <p className="text-[11px] font-bold text-gray-700">
              Type{" "}
              <span className="underline decoration-2">
                {selectedTargetName}
              </span>{" "}
              to confirm ownership transfer:
            </p>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`Type "${selectedTargetName}"`}
              className="w-full border-2 border-black bg-white p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50 disabled:opacity-50 text-black"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="border-2 border-black bg-gray-200 px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0 active:translate-y-0 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleTransfer}
            disabled={!isNameMatched || isLoading}
            className={`flex items-center gap-2 border-2 border-black px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
              isNameMatched && !isLoading
                ? "bg-[#FFD93D] text-black hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0 active:translate-y-0"
                : "cursor-not-allowed bg-gray-300 text-gray-500 opacity-70"
            }`}
          >
            {isLoading && <HypotrochoidLoader size={14} />}
            {isLoading ? "Transferring..." : "Confirm Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
};
