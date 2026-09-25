"use client";

import { useState, useEffect, useCallback } from "react";
import { isAxiosError } from "axios";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  ChevronDown,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Layers,
  User as UserIcon,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  GripVertical,
} from "lucide-react";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/axios";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";
import ConfirmModal from "@/global_components/confirmModal";
import { subscribeToSprint } from "@/lib/socket";
import ProjectAIAssistant from "@/app/(user)/_components/ProjectAIAssistant";

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  assignee?: {
    name: string;
  };
}

interface TaskApiResponse extends Omit<Task, "status" | "priority"> {
  task_status: Task["status"];
  priority?: Task["priority"];
}

interface TaskMovedPayload {
  sprintId: string | number;
  taskId: string | number;
  status: Task["status"];
}

interface TaskCreatedPayload {
  sprintId: string | number;
  task: Task;
}

interface TaskUpdatedPayload {
  sprintId: string | number;
  task: Task;
}

interface TaskDeletedPayload {
  sprintId: string | number;
  taskId: string | number;
}

export interface Sprint {
  id: number;
  project_id: string;
  name: string;
  task_count: number;
  sprint_progress: number;
  startDate: string;
  endDate: string;
  tasks?: Task[];
}

const STATUS_COLUMNS: { label: string; key: Task["status"]; color: string }[] =
  [
    { label: "Todo", key: "TODO", color: "bg-[#FFD93D]" },
    { label: "In Progress", key: "IN_PROGRESS", color: "bg-[#4D96FF]" },
    { label: "Review", key: "REVIEW", color: "bg-[#FF6B6B]" },
    { label: "Done", key: "DONE", color: "bg-[#6BCB77]" },
  ];

export default function SprintBoardPage() {
  const params = useParams();

  const workspaceId = params?.id as string;
  const projectId = params?.projectId as string;

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Loading & Error States
  const [isLoadingSprints, setIsLoadingSprints] = useState<boolean>(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Modal States for Sprint CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

  // Modal States for Task CRUD
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] =
    useState<boolean>(false);
  const [isUpdateTaskModalOpen, setIsUpdateTaskModalOpen] =
    useState<boolean>(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<Task | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "sprint" } | { type: "task"; taskId: string | number } | null
  >(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields - Sprint
  const [sprintName, setSprintName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Form Fields - Task
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<Task["status"]>("TODO");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("MEDIUM");

  // Fetch Sprints
  const fetchSprints = useCallback(async () => {
    if (!workspaceId || !projectId) {
      setIsLoadingSprints(false);
      return;
    }

    try {
      setIsLoadingSprints(true);
      setError(null);

      const response = await api.get<{ success: boolean; data: Sprint[] }>(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint`,
      );

      const fetchedSprints = response.data?.data || [];
      setSprints(fetchedSprints);

      if (fetchedSprints.length > 0) {
        setSelectedSprint((prev) => {
          if (!prev) return fetchedSprints[0];
          const exists = fetchedSprints.find((s) => s.id === prev.id);
          return exists || fetchedSprints[0];
        });
      } else {
        setSelectedSprint(null);
        setTasks([]);
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message || "Failed to load sprints";
        setError(msg);
        showToast.error(msg);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoadingSprints(false);
    }
  }, [workspaceId, projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSprints();
  }, [fetchSprints]);

  // Fetch Tasks
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchTasks = useCallback(async () => {
    if (!selectedSprint?.id || !workspaceId || !projectId) {
      setTasks([]);
      return;
    }

    try {
      setIsLoadingTasks(true);
      const response = await api.get<{
        success: boolean;
        data: TaskApiResponse[];
      }>(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint/${selectedSprint.id}/tasks`,
      );
      const fetchedTasks = response.data?.data || [];
      setTasks(
        fetchedTasks.map(({ task_status, priority, ...task }) => ({
          ...task,
          status: task_status,
          priority: priority || "MEDIUM",
        })),
      );
    } catch (err: unknown) {
      console.error("Failed to fetch tasks:", err);
      showToast.error("Failed to fetch tasks for this sprint");
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [selectedSprint?.id, workspaceId, projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    console.log("🔥 Pusher effect fired");
    console.log("selectedSprint:", selectedSprint);
    console.log("selectedSprint ID:", selectedSprint?.id);

    const currentSprintId = selectedSprint?.id;

    if (!currentSprintId) {
      console.log("❌ No sprint ID, skipping Pusher");
      return;
    }
    let cancelled = false;
    let unsubscribe = () => {};

    const isCurrentSprint = (sprintId: string | number) =>
      String(sprintId) === String(currentSprintId);

    const handleTaskMoved = (data: TaskMovedPayload) => {
      if (!isCurrentSprint(data.sprintId)) return;

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          String(task.id) === String(data.taskId)
            ? { ...task, status: data.status }
            : task,
        ),
      );
      fetchSprints();
    };

    const handleTaskCreated = (data: TaskCreatedPayload) => {
      if (!isCurrentSprint(data.sprintId)) return;

      setTasks((previousTasks) => [data.task, ...previousTasks]);
      fetchSprints();
    };

    const handleTaskUpdated = (data: TaskUpdatedPayload) => {
      if (!isCurrentSprint(data.sprintId)) return;

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          String(task.id) === String(data.task.id) ? data.task : task,
        ),
      );
      fetchSprints();
    };

    const handleTaskDeleted = (data: TaskDeletedPayload) => {
      if (!isCurrentSprint(data.sprintId)) return;

      setTasks((previousTasks) =>
        previousTasks.filter((task) => String(task.id) !== String(data.taskId)),
      );
      fetchSprints();
    };

    subscribeToSprint(currentSprintId, {
      task_moved: handleTaskMoved,
      task_created: handleTaskCreated,
      task_updated: handleTaskUpdated,
      task_deleted: handleTaskDeleted,
    }).then((cleanup) => {
      if (cancelled) cleanup();
      else unsubscribe = cleanup;
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [selectedSprint?.id, fetchSprints, selectedSprint]);

  // --- DRAG AND DROP HANDLER ---
  const handleOnDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // ১. ড্রপ যদি কোনো ড্রপজোনের বাইরে হয়, কিছুই করব না
    if (!destination) return;

    // ২. যদি একই কলামের একই পজিশনে ছেড়ে দেয়
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Task["status"];
    const previousTasks = [...tasks];

    // ৩. Optimistic UI Update (ইউজার অভিজ্ঞতা দ্রুত রাখার জন্য)
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        String(t.id) === String(draggableId) ? { ...t, status: newStatus } : t,
      ),
    );

    // ৪. Backend API Call to Update Task Status
    try {
      await api.patch(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint/${selectedSprint?.id}/tasks/${draggableId}`,
        { status: newStatus },
      );
      showToast.success(`Moved to ${newStatus.replace("_", " ")}`);
      fetchSprints(); // Progress bar আপডেট করার জন্য
    } catch (err: unknown) {
      // API ব্যর্থ হলে আগের অবস্থায় ফিরিয়ে নেওয়া
      setTasks(previousTasks);
      if (isAxiosError(err)) {
        showToast.error(
          err.response?.data?.message || "Failed to update task status",
        );
      } else {
        showToast.error("Failed to update task status");
      }
    }
  };

  // --- CRUD Handlers for Sprint ---
  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !projectId || !sprintName || !startDate || !endDate)
      return;

    try {
      setIsSubmitting(true);
      await api.post(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint`,
        { name: sprintName, startDate, endDate },
      );
      showToast.success("Sprint created successfully");
      setIsCreateModalOpen(false);
      setSprintName("");
      setStartDate("");
      setEndDate("");
      fetchSprints();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToast.error(
          err.response?.data?.message || "Failed to create sprint",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdateModal = () => {
    if (!selectedSprint) return;
    setSprintName(selectedSprint.name);
    setStartDate(
      selectedSprint.startDate ? selectedSprint.startDate.split("T")[0] : "",
    );
    setEndDate(
      selectedSprint.endDate ? selectedSprint.endDate.split("T")[0] : "",
    );
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint || !sprintName || !startDate || !endDate) return;

    try {
      setIsSubmitting(true);
      await api.put(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint/${selectedSprint.id}`,
        { name: sprintName, startDate, endDate },
      );
      showToast.success("Sprint updated successfully");
      setIsUpdateModalOpen(false);
      fetchSprints();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToast.error(
          err.response?.data?.message || "Failed to update sprint",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSprint = async () => {
    if (!selectedSprint) return;
    setDeleteTarget({ type: "sprint" });
  };

  const deleteSprint = async () => {
    if (!selectedSprint) return;

    try {
      setIsDeleting(true);
      await api.delete(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint/${selectedSprint.id}`,
      );
      showToast.success("Sprint deleted successfully");
      setSelectedSprint(null);
      fetchSprints();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToast.error(
          err.response?.data?.message || "Failed to delete sprint",
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // --- CRUD Handlers for Task ---
  const openCreateTaskModal = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("TODO");
    setTaskPriority("MEDIUM");
    setIsCreateTaskModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint || !taskTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await api.post<{ data: TaskApiResponse }>(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint/${selectedSprint.id}/tasks`,
        {
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
          priority: taskPriority,
        },
      );
      showToast.success("Task created successfully");
      setIsCreateTaskModalOpen(false);
      const rawTask = response.data?.data;
      const createdTask: Task = {
        ...rawTask,
        status: rawTask.task_status,
        priority: rawTask.priority || "MEDIUM",
      };
      setTasks((previousTasks) => [createdTask, ...previousTasks]);
      fetchSprints();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToast.error(err.response?.data?.message || "Failed to create task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdateTaskModal = (task: Task) => {
    setSelectedTaskToEdit(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setIsUpdateTaskModalOpen(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint || !selectedTaskToEdit || !taskTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await api.patch<{ data: TaskApiResponse }>(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint/${selectedSprint.id}/tasks/${selectedTaskToEdit.id}`,
        {
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
          priority: taskPriority,
        },
      );
      showToast.success("Task updated successfully");
      setIsUpdateTaskModalOpen(false);
      setSelectedTaskToEdit(null);
      const rawTask = response.data?.data;
      const updatedTask: Task = {
        ...rawTask,
        status: rawTask.task_status,
        priority: rawTask.priority || "MEDIUM",
      };
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );
      fetchSprints();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToast.error(err.response?.data?.message || "Failed to update task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string | number) => {
    if (!selectedSprint) return;
    setDeleteTarget({ type: "task", taskId });
  };

  const deleteTask = async (taskId: string | number) => {
    if (!selectedSprint) return;

    try {
      setIsDeleting(true);
      await api.delete(
        `/user/workspace/${workspaceId}/project/${projectId}/sprint/${selectedSprint.id}/tasks/${taskId}`,
      );
      showToast.success("Task deleted successfully");
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== taskId),
      );
      fetchSprints();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToast.error(err.response?.data?.message || "Failed to delete task");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "sprint") {
      await deleteSprint();
    } else {
      await deleteTask(deleteTarget.taskId);
    }

    setDeleteTarget(null);
  };

  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-[#FF6B6B] text-white";
      case "HIGH":
        return "bg-[#FFD93D] text-black";
      case "MEDIUM":
        return "bg-[#4D96FF] text-white";
      case "LOW":
        return "bg-[#6BCB77] text-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const completionPercentage =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : selectedSprint?.sprint_progress || 0;

  if (isLoadingSprints) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <HypotrochoidLoader />
        <p className="mt-4 text-xs font-black uppercase tracking-wider">
          Loading Sprints...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center border-4 border-black bg-[#FF6B6B] p-8 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <AlertCircle className="h-12 w-12 stroke-[2.5]" />
        <h3 className="mt-2 text-lg font-black uppercase">
          Failed to load board
        </h3>
        <p className="mt-1 text-xs font-bold">{error}</p>
        <button
          onClick={fetchSprints}
          className="mt-4 flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <label className="mb-1 block text-xs font-black uppercase tracking-wider text-black">
            Select Active Sprint
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={sprints.length === 0}
            className="flex w-full items-center justify-between border-4 border-black bg-white p-3 text-xs font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            <span className="flex items-center gap-2 truncate">
              <Layers className="h-4 w-4 stroke-[2.5]" />
              {selectedSprint ? selectedSprint.name : "No Sprints Found"}
            </span>
            <ChevronDown
              className={`h-4 w-4 stroke-3 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && sprints.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 divide-y-2 divide-black border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {sprints.map((sprint) => (
                <button
                  key={sprint.id}
                  onClick={() => {
                    setSelectedSprint(sprint);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between p-3 text-left text-xs font-bold ${
                    sprint.id === selectedSprint?.id
                      ? "bg-[#FFD93D] font-black text-black"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  <span className="truncate">{sprint.name}</span>
                  {sprint.id === selectedSprint?.id && (
                    <CheckCircle2 className="h-4 w-4 stroke-3 text-black" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <ProjectAIAssistant workspaceId={workspaceId} projectId={projectId} />

          <button
            onClick={() => {
              setSprintName("");
              setStartDate("");
              setEndDate("");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 border-4 border-black bg-[#4D96FF] px-4 py-3 text-xs font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Plus className="h-4 w-4 stroke-3" />
            <span>Create Sprint</span>
          </button>

          <button
            disabled={!selectedSprint}
            onClick={openCreateTaskModal}
            className="flex items-center gap-2 border-4 border-black bg-[#6BCB77] px-4 py-3 text-xs font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            <Plus className="h-4 w-4 stroke-3" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Selected Sprint Details Header */}
      {selectedSprint ? (
        <div className="relative border-4 border-black bg-[#D48800] p-5 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black uppercase tracking-wider">
                  {selectedSprint.name}
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={openUpdateModal}
                    title="Edit Sprint"
                    className="border-2 border-black bg-white p-1.5 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteSprint}
                    title="Delete Sprint"
                    className="border-2 border-black bg-[#FF6B6B] p-1.5 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black uppercase">
                  Complete: {completionPercentage}% ({completedTasks}/
                  {totalTasks} Tasks)
                </span>
                <div className="h-4 w-36 border-2 border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:w-48">
                  <div
                    className="h-full bg-[#6BCB77] transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-wide">
              <div className="flex items-center gap-2 border-2 border-black bg-white/10 px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Calendar className="h-4 w-4 stroke-[2.5] text-white" />
                <span>Start: {formatDate(selectedSprint.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 border-2 border-black bg-white/10 px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Clock className="h-4 w-4 stroke-[2.5] text-white" />
                <span>End: {formatDate(selectedSprint.endDate)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-4 border-black bg-white p-6 text-center font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          No active sprint found. Click &quot;Create Sprint&quot; to get
          started.
        </div>
      )}

      {/* --- KANBAN BOARD DRAG AND DROP CONTAINER --- */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STATUS_COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.key);

            return (
              <div
                key={column.key}
                className="flex min-h-112.5 flex-col border-4 border-black bg-[#333333] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b-4 border-black bg-white p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 border-2 border-black ${column.color}`}
                    />
                    <h3 className="text-xs font-black uppercase text-black">
                      {column.label}
                    </h3>
                  </div>
                  <span className="border-2 border-black bg-gray-200 px-2 py-0.5 text-[10px] font-black text-black">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Droppable Column Area */}
                <Droppable droppableId={column.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`max-h-150 flex-1 space-y-3 overflow-y-auto p-3 transition-colors ${
                        snapshot.isDraggingOver ? "bg-[#444444]" : ""
                      }`}
                    >
                      {isLoadingTasks ? (
                        <div className="flex h-32 items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-white" />
                        </div>
                      ) : columnTasks.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center border-2 border-dashed border-gray-600 p-4 text-center">
                          <AlertCircle className="mb-1 h-5 w-5 text-gray-400" />
                          <p className="text-[11px] font-bold uppercase text-gray-400">
                            No Tasks
                          </p>
                        </div>
                      ) : (
                        columnTasks.map((task, index) => (
                          <Draggable
                            key={String(task.id)}
                            draggableId={String(task.id)}
                            index={index}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`group relative cursor-grab select-none border-3 border-black bg-white p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:cursor-grabbing ${
                                  dragSnapshot.isDragging
                                    ? "scale-105 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50"
                                    : ""
                                }`}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    {/* Drag Handle */}
                                    <span className="text-gray-400 group-hover:text-black">
                                      <GripVertical className="h-4 w-4" />
                                    </span>
                                    <span
                                      className={`border border-black px-1.5 py-0.5 text-[9px] font-black uppercase ${getPriorityStyle(
                                        task.priority,
                                      )}`}
                                    >
                                      {task.priority}
                                    </span>
                                  </div>

                                  {/* Task Actions */}
                                  <div className="flex items-center gap-1 opacity-90 transition-opacity group-hover:opacity-100">
                                    <button
                                      onClick={() => openUpdateTaskModal(task)}
                                      className="border border-black bg-gray-100 p-1 hover:bg-yellow-300"
                                      title="Edit Task"
                                    >
                                      <Pencil className="h-3 w-3 text-black" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="border border-black bg-red-100 p-1 hover:bg-red-400 hover:text-white"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                <h4 className="text-xs font-black uppercase tracking-wide text-black">
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="mt-1 line-clamp-2 text-[11px] font-bold text-gray-600">
                                    {task.description}
                                  </p>
                                )}

                                <div className="mt-3 flex items-center justify-between border-t-2 border-gray-200 pt-2 text-[10px] font-bold text-gray-600">
                                  {task.assignee ? (
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex h-5 w-5 items-center justify-center border border-black bg-[#FFD93D] font-black text-black">
                                        {task.assignee.name.charAt(0)}
                                      </div>
                                      <span className="max-w-25 truncate">
                                        {task.assignee.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="flex items-center gap-1 italic text-gray-400">
                                      <UserIcon className="h-3 w-3" />{" "}
                                      Unassigned
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* --- MODALS (Create/Update Sprint & Task) --- */}
      {/* (আগের সম্পূর্ণ Modal JSX কোড অপরিবর্তিত আছে) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-2">
              <h3 className="text-base font-black uppercase text-black">
                Create New Sprint
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="border-2 border-black bg-gray-200 p-1 font-black text-black hover:bg-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-black">
                  Sprint Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sprint 1"
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-black">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-black">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-2 border-black bg-gray-200 px-3 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border-2 border-black bg-[#4D96FF] px-4 py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Sprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-2">
              <h3 className="text-base font-black uppercase text-black">
                Update Sprint
              </h3>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="border-2 border-black bg-gray-200 p-1 font-black text-black hover:bg-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateSprint} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-black">
                  Sprint Name
                </label>
                <input
                  type="text"
                  required
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-black">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-black">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="border-2 border-black bg-gray-200 px-3 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border-2 border-black bg-[#FFD93D] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Sprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-2">
              <h3 className="text-base font-black uppercase text-black">
                Create Task
              </h3>
              <button
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="border-2 border-black bg-gray-200 p-1 font-black text-black hover:bg-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-black">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Build authentication module"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-black">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Task details and instructions..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-black">
                    Status
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) =>
                      setTaskStatus(e.target.value as Task["status"])
                    }
                    className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-black">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) =>
                      setTaskPriority(e.target.value as Task["priority"])
                    }
                    className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="border-2 border-black bg-gray-200 px-3 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border-2 border-black bg-[#6BCB77] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-2">
              <h3 className="text-base font-black uppercase text-black">
                Edit Task
              </h3>
              <button
                onClick={() => setIsUpdateTaskModalOpen(false)}
                className="border-2 border-black bg-gray-200 p-1 font-black text-black hover:bg-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-black">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-black">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-black">
                    Status
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) =>
                      setTaskStatus(e.target.value as Task["status"])
                    }
                    className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-black">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) =>
                      setTaskPriority(e.target.value as Task["priority"])
                    }
                    className="w-full border-3 border-black p-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateTaskModalOpen(false)}
                  className="border-2 border-black bg-gray-200 px-3 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border-2 border-black bg-[#FFD93D] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Update Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={
          deleteTarget?.type === "sprint" ? "Delete Sprint" : "Delete Task"
        }
        message={
          deleteTarget?.type === "sprint"
            ? `Delete "${selectedSprint?.name}"? This action cannot be undone.`
            : "Delete this task? This action cannot be undone."
        }
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
