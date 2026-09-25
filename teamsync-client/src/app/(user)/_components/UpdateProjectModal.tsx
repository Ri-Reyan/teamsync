"use client";

import { useState } from "react";
import { Edit3, X } from "lucide-react";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

interface UpdateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: { id: string; name: string; description?: string } | null;
  onUpdateConfirm: (
    id: string,
    name: string,
    description?: string,
  ) => Promise<void>;
}

const ProjectForm = ({
  project,
  onClose,
  onUpdateConfirm,
}: {
  project: { id: string; name: string; description?: string };
  onClose: () => void;
  onUpdateConfirm: (
    id: string,
    name: string,
    description?: string,
  ) => Promise<void>;
}) => {
  const [name, setName] = useState(project.name || "");
  const [description, setDescription] = useState(project.description || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      await onUpdateConfirm(project.id, name.trim(), description.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 border-2 border-black bg-[#FF6B6B] p-1 text-black transition-transform hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0 active:translate-y-0 disabled:opacity-50"
        >
          <X className="h-5 w-5 stroke-3" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="border-2 border-black bg-[#FFD93D] p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Edit3 className="h-6 w-6 stroke-3 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-wide text-black">
              Update Project
            </h2>
            <p className="text-xs font-bold text-gray-600">
              Modify project details
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-black">
              Project Name <span className="text-[#FF6B6B]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-black bg-white p-2.5 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-black">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none border-2 border-black bg-white p-2.5 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="border-2 border-black bg-gray-200 px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex items-center gap-2 border-2 border-black bg-[#FFD93D] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {isLoading && <HypotrochoidLoader size={16} />}
              {isLoading ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UpdateProjectModal = ({
  isOpen,
  onClose,
  project,
  onUpdateConfirm,
}: UpdateProjectModalProps) => {
  if (!isOpen || !project) return null;

  return (
    <ProjectForm
      key={project.id}
      project={project}
      onClose={onClose}
      onUpdateConfirm={onUpdateConfirm}
    />
  );
};
