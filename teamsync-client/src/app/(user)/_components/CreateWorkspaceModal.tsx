"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus } from "lucide-react";
import { isAxiosError } from "axios";
import {
  createWorkspaceSchema,
  CreateWorkspaceInput,
} from "@/schemas/workspace";
import { api } from "@/lib/axios";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";
import { showToast } from "@/lib/toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess,
}: ModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  if (!isOpen) return null;

  const handleModalClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data: CreateWorkspaceInput) => {
    setServerError(null);
    try {
      const res = await api.post("/user/workspace", data);

      if (res.data.success) {
        showToast.success("Workspace created successfully!");
        handleModalClose();
        onSuccess();
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to create workspace. Please try again.";
        setServerError(errorMessage);
        showToast.error(errorMessage);
      } else {
        setServerError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Create Workspace
          </h2>
          <button
            onClick={handleModalClose}
            type="button"
            className="border-2 border-black bg-[#FF6B6B] p-1 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-px hover:translate-y-px active:shadow-none"
          >
            <X className="h-5 w-5 stroke-3" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-4"
        >
          {serverError && (
            <div className="border-2 border-black bg-[#FF6B6B]/20 p-3 text-xs font-bold text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ⚠️ {serverError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-black uppercase">
              Workspace Name
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Acme Corp"
              className="w-full border-2 border-black bg-[#FFFDF5] p-3 font-bold outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:bg-white focus:border-black transition-colors"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs font-bold text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleModalClose}
              className="border-2 border-black bg-gray-200 px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 border-2 border-black bg-[#6BCB77] px-5 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-px hover:translate-y-px active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <HypotrochoidLoader />
              ) : (
                <>
                  <Plus className="h-4 w-4 stroke-3" /> Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
