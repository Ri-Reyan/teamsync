"use client";

import { useState } from "react";
import { FolderPlus, X } from "lucide-react";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConfirm: (name: string, description?: string) => Promise<void>;
}

export const CreateProjectModal = ({
  isOpen,
  onClose,
  onCreateConfirm,
}: CreateProjectModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await onCreateConfirm(name.trim(), description.trim());
      handleClose();
    } catch (err: unknown) {
      console.error("Failed to create project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
          <div className="border-2 border-black bg-[#6BCB77] p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <FolderPlus className="h-6 w-6 stroke-3 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-wide text-black">
              Create Project
            </h2>
            <p className="text-xs font-bold text-gray-600">
              Add a new project to your workspace
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border-2 border-black bg-[#FFE6E6] p-2 text-xs font-bold text-[#FF6B6B]">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-black">
              Project Name <span className="text-[#FF6B6B]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. E-Commerce Backend"
              className="w-full border-2 border-black bg-white p-2.5 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-black">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about this project..."
              className="w-full resize-none border-2 border-black bg-white p-2.5 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
              disabled={isLoading}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="border-2 border-black bg-gray-200 px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0 active:translate-y-0 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className={`flex items-center gap-2 border-2 border-black px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                name.trim() && !isLoading
                  ? "bg-[#6BCB77] text-black hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0 active:translate-y-0"
                  : "cursor-not-allowed bg-gray-300 text-gray-500 opacity-70"
              }`}
            >
              {isLoading && <HypotrochoidLoader size={16} />}
              {isLoading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
