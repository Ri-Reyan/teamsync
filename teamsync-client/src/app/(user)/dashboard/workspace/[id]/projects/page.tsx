"use client";

import {
  TransferOwnershipModal,
  WorkspaceMember,
} from "@/app/(user)/_components/TransferOwnershipModal";
import { CreateProjectModal } from "@/app/(user)/_components/CreateProjectModal";
import { UpdateProjectModal } from "@/app/(user)/_components/UpdateProjectModal";
import ConfirmModal from "@/global_components/confirmModal";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import { isAxiosError } from "axios";
import {
  LogOut,
  ArrowLeftRight,
  Plus,
  Trash2,
  Folder,
  Calendar,
  ArrowRight,
  MoreVertical,
  Edit3,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  createdAt: string;
  updatedAt: string;
}

const WorkspaceProjectsPage = () => {
  const router = useRouter();
  const { id: workspaceId } = useParams<{ id: string }>();

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Active Dropdown Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Update & Delete Project Modals State
  const [selectedProjectForEdit, setSelectedProjectForEdit] =
    useState<Project | null>(null);
  const [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(
    null,
  );

  // Leave/Delete Workspace Modal State
  const [actionDetail, setActionDetail] = useState<{
    title: string;
    id: string;
    message: string;
  }>({
    id: "",
    title: "",
    message: "",
  });

  // Transfer Ownership Modal States
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Create Project Modal State
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // ১. Fetch Projects List
  const fetchProjects = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setIsLoadingProjects(true);
      const res = await api.get(`/user/workspace/${workspaceId}/project`);
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to load projects",
        );
      }
    } finally {
      setIsLoadingProjects(false);
    }
  }, [workspaceId]);

  // ✅ FIXED: Effect calling pattern to prevent cascading render error
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!workspaceId) return;
      try {
        const res = await api.get(`/user/workspace/${workspaceId}/project`);
        if (res.data.success && isMounted) {
          setProjects(res.data.data);
        }
      } catch (error: unknown) {
        if (isAxiosError(error) && isMounted) {
          showToast.error(
            error.response?.data?.message || "Failed to load projects",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  // Outside clickhandler for dropdown menu
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // ২. Create Project Handler
  const handleCreateProjectSubmit = async (
    name: string,
    description?: string,
  ) => {
    try {
      const res = await api.post(`/user/workspace/${workspaceId}/project`, {
        name,
        description,
      });

      if (res.data.success) {
        showToast.success("Project created successfully!");
        fetchProjects();
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to create project",
        );
      }
      throw error;
    }
  };

  // ৩. Update Project Handler
  const handleUpdateProjectSubmit = async (
    id: string,
    name: string,
    description?: string,
  ) => {
    try {
      const res = await api.patch(
        `/user/workspace/${workspaceId}/project/${id}`,
        { name, description },
      );
      if (res.data.success) {
        showToast.success("Project updated successfully!");
        fetchProjects();
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to update project",
        );
      }
    }
  };

  // ৪. Delete Project Handler
  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await api.delete(
        `/user/workspace/${workspaceId}/project/${projectId}`,
      );
      if (res.data.success) {
        showToast.success("Project deleted successfully!");
        fetchProjects();
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to delete project",
        );
      }
    } finally {
      setProjectToDeleteId(null);
    }
  };

  // Leave Workspace Handler
  const handleLeaveWorkspace = async (targetWorkspaceId: string) => {
    try {
      const res = await api.delete(
        `/user/workspace/${targetWorkspaceId}/leave`,
      );
      if (res.data.success) {
        showToast.success(res.data.message || "Successfully left workspace");
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to leave workspace",
        );
      }
    }
  };

  // Delete Workspace Handler
  const handleDeleteWorkspace = async (targetWorkspaceId: string) => {
    try {
      await api.delete(`/user/workspace/${targetWorkspaceId}`);
      showToast.success("Workspace deleted successfully");
      router.push("/dashboard");
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to delete workspace",
        );
      }
    }
  };

  // Fetch Members for Transfer Modal
  const fetchWorkspaceMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const res = await api.get(`/user/workspace/${workspaceId}/members`);
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to load workspace members",
        );
      }
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleOpenTransferModal = async () => {
    setIsTransferOpen(true);
    await fetchWorkspaceMembers();
  };

  const handleTransferOwnershipSubmit = async (newOwnerId: string) => {
    try {
      const res = await api.patch(
        `/user/workspace/${workspaceId}/transfer-ownership`,
        {
          newOwnerId,
        },
      );

      if (res.data.success) {
        showToast.success(
          res.data.message || "Ownership transferred successfully!",
        );
        setIsTransferOpen(false);
        router.refresh();
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        showToast.error(
          error.response?.data?.message || "Failed to transfer ownership",
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 border-b-4 border-black pb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Projects
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <button
            onClick={() =>
              setActionDetail({
                title: "Delete",
                id: workspaceId,
                message: "Are you sure you want to delete this workspace?",
              })
            }
            className="flex items-center gap-2 border-2 border-black bg-[#FF6B6B] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none sm:px-4"
          >
            <Trash2 className="h-4 w-4 stroke-[2.5]" />
            <span>Delete Workspace</span>
          </button>

          <button
            onClick={() =>
              setActionDetail({
                id: workspaceId,
                title: "Leave",
                message: "Are you sure you want to leave from this workspace?",
              })
            }
            className="flex items-center gap-2 border-2 border-black bg-[#FF6B6B] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none sm:px-4"
          >
            <LogOut className="h-4 w-4 stroke-[2.5]" />
            <span>Leave Workspace</span>
          </button>

          <button
            onClick={handleOpenTransferModal}
            className="flex items-center gap-2 border-2 border-black bg-[#FFD93D] px-3 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none sm:px-4"
          >
            <ArrowLeftRight className="h-4 w-4 stroke-[2.5]" />
            <span>Transfer Ownership</span>
          </button>

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center gap-2 border-2 border-black bg-[#6BCB77] px-3 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none sm:px-4"
          >
            <Plus className="h-4 w-4 stroke-3" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      {isLoadingProjects ? (
        <div className="flex h-64 items-center justify-center border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 text-sm font-black uppercase text-black">
            <HypotrochoidLoader />
            Loading projects...
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-4 border-black bg-white p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-4 border-2 border-black bg-[#FFD93D] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Folder className="h-10 w-10 stroke-[2.5] text-black" />
          </div>
          <h3 className="text-lg font-black uppercase text-black">
            No Projects Found
          </h3>
          <p className="mt-1 max-w-sm text-xs font-bold text-gray-600">
            There are no projects in this workspace yet. Click below to create
            your first project!
          </p>
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="mt-4 flex items-center gap-2 border-2 border-black bg-[#6BCB77] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="h-4 w-4 stroke-3" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() =>
                router.push(
                  `/dashboard/workspace/${workspaceId}/projects/${project.id}/sprint`,
                )
              }
              className="group relative border-4 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="border-2 border-black bg-[#4D96FF] p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Folder className="h-5 w-5 stroke-[2.5] text-white" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-black text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>

                  {/* 🟢 Three Dots Menu Dropdown */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setActiveMenuId(
                          activeMenuId === project.id ? null : project.id,
                        )
                      }
                      className="border-2 border-black bg-gray-100 p-1 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-200"
                    >
                      <MoreVertical className="h-4 w-4 stroke-3" />
                    </button>

                    {activeMenuId === project.id && (
                      <div className="absolute right-0 top-8 z-20 w-32 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <button
                          onClick={() => {
                            setSelectedProjectForEdit(project);
                            setActiveMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 p-2 text-left text-xs font-black uppercase text-black hover:bg-yellow-200"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Update</span>
                        </button>
                        <button
                          onClick={() => {
                            setProjectToDeleteId(project.id);
                            setActiveMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 border-t-2 border-black p-2 text-left text-xs font-black uppercase text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="text-base font-black uppercase tracking-tight text-black group-hover:underline">
                {project.name}
              </h2>

              <p className="mt-2 line-clamp-2 min-h-9 text-xs font-bold text-gray-600">
                {project.description || "No description provided."}
              </p>

              <div className="mt-4 flex items-center justify-between border-t-2 border-black pt-3">
                <span className="text-[11px] font-black uppercase text-black">
                  View Board
                </span>
                <ArrowRight className="h-4 w-4 stroke-3 text-black transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leave/Delete Workspace Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(actionDetail.title)}
        title={actionDetail.title}
        message={actionDetail.message}
        onClose={() =>
          setActionDetail({
            id: "",
            title: "",
            message: "",
          })
        }
        onConfirm={async () => {
          if (Boolean(actionDetail.title) && actionDetail.title === "Leave") {
            await handleLeaveWorkspace(actionDetail.id);
          } else {
            await handleDeleteWorkspace(actionDetail.id);
          }
        }}
      />

      {/* Delete Single Project Modal */}
      <ConfirmModal
        isOpen={Boolean(projectToDeleteId)}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onClose={() => setProjectToDeleteId(null)}
        onConfirm={async () => {
          if (projectToDeleteId) {
            await handleDeleteProject(projectToDeleteId);
          }
        }}
      />

      {/* Transfer Ownership Modal */}
      <TransferOwnershipModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        members={members}
        isLoadingMembers={isLoadingMembers}
        onTransferConfirm={handleTransferOwnershipSubmit}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreateConfirm={handleCreateProjectSubmit}
      />

      {/* Update Project Modal */}
      <UpdateProjectModal
        isOpen={Boolean(selectedProjectForEdit)}
        onClose={() => setSelectedProjectForEdit(null)}
        project={selectedProjectForEdit}
        onUpdateConfirm={handleUpdateProjectSubmit}
      />
    </div>
  );
};

export default WorkspaceProjectsPage;
