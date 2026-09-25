"use client";
import { AlertTriangle } from "lucide-react";
import HypotrochoidLoader from "./HypotrochoidLoader";
interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      {" "}
      <div className="relative w-full max-w-sm border-4 border-black bg-[#FFFDF5] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {" "}
        {/* Header Icon & Title */}{" "}
        <div className="flex items-center gap-3 border-b-4 border-black pb-4">
          {" "}
          <div className="border-2 border-black bg-[#FFD93D] p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {" "}
            <AlertTriangle className="h-6 w-6 text-black stroke-[2.5]" />{" "}
          </div>{" "}
          <h2 className="text-xl font-black uppercase tracking-tight">
            {" "}
            {title}{" "}
          </h2>{" "}
        </div>{" "}
        {/* Message */}{" "}
        <p className="mt-4 font-bold text-gray-800 text-sm">{message}</p>{" "}
        {/* Action Buttons */}{" "}
        <div className="mt-6 flex gap-3">
          {" "}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-1/2 border-3 border-black bg-white py-2 font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {" "}
            Cancel{" "}
          </button>{" "}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex w-1/2 items-center justify-center gap-2 border-3 border-black bg-[#FF6B6B] py-2 font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-70"
          >
            {" "}
            {loading ? <HypotrochoidLoader /> : "Confirm"}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
