"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Mail, Shield } from "lucide-react";
import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import { inviteSchema } from "@/schemas/workspace";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

type InviteFormData = z.infer<typeof inviteSchema>;

interface SendInvitationModalProps {
  isOpen: boolean;
  workspaceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendInvitationModal({
  isOpen,
  workspaceId,
  onClose,
  onSuccess,
}: SendInvitationModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      member_email: "", // email -> member_email
      role: "MEMBER",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    try {
      const res = await api.post(`/user/workspace/${workspaceId}/invite`, data);

      if (res.data.success) {
        showToast.success("Invitation sent successfully!");
        reset();
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Failed to send invitation.";
        showToast.error(errorMessage);
      } else {
        showToast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md border-4 border-black bg-[#FFFDF5] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Invite Team Member
          </h2>
          <button
            onClick={onClose}
            className="border-2 border-black bg-[#FF6B6B] p-1 font-black text-white hover:bg-black transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Email Input */}
          <div>
            <label className="mb-1 block text-xs font-black uppercase">
              User Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                {...register("member_email")}
                type="email"
                placeholder="colleague@company.com"
                className="w-full border-3 border-black bg-white py-2.5 pl-10 pr-3 font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0"
              />
            </div>
            {errors.member_email && (
              <p className="mt-1 text-xs font-black text-[#FF6B6B]">
                {errors.member_email.message}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="mb-1 block text-xs font-black uppercase">
              Assign Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <select
                {...register("role")}
                className="w-full appearance-none border-3 border-black bg-white py-2.5 pl-10 pr-3 font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0"
              >
                <option value="MEMBER">
                  Member (Can access assigned projects)
                </option>
                <option value="ADMIN">Admin (Full workspace access)</option>
              </select>
            </div>
            {errors.role && (
              <p className="mt-1 text-xs font-black text-[#FF6B6B]">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 border-3 border-black bg-white py-2.5 font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex w-1/2 items-center justify-center gap-2 border-3 border-black bg-[#4D96FF] py-2.5 font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-70"
            >
              {loading ? <HypotrochoidLoader size={20} /> : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
