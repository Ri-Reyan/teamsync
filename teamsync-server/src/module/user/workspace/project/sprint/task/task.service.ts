import { TaskStatus } from "../../../../../../generated/prisma/enums.js";
import { prisma } from "../../../../../../lib/prisma.js"; // Generated prisma enum import করো

interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
}

// Helper: Sprint Progress হিসেব করার জন্য
const updateSprintMetrics = async (tx: any, sprintId: number) => {
  const totalTasks = await tx.task.count({
    where: { sprint_id: sprintId },
  });

  const completedTasks = await tx.task.count({
    where: {
      sprint_id: sprintId,
      task_status: TaskStatus.DONE,
    },
  });

  const sprintProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  await tx.sprint.update({
    where: { id: sprintId },
    data: {
      task_count: totalTasks,
      sprint_progress: sprintProgress,
    },
  });
};

const createTask = async (sprintId: number, payload: CreateTaskPayload) => {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: payload.title,
        description: payload.description,
        sprint_id: sprintId,
        task_status: payload.status ?? TaskStatus.TODO,
      },
    });

    // Task তৈরি হওয়ার পর Sprint Count & Progress আপডেট
    await updateSprintMetrics(tx, sprintId);

    return task;
  });
};

const getTasksBySprint = async (sprintId: number) => {
  return await prisma.task.findMany({
    where: { sprint_id: sprintId },
    orderBy: { createdAt: "desc" },
  });
};

const updateTask = async (
  taskId: number,
  payload: Partial<CreateTaskPayload>,
) => {
  return await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        ...(payload.title && { title: payload.title }),
        ...(payload.description !== undefined && {
          description: payload.description,
        }),
        ...(payload.status && { task_status: payload.status }),
      },
    });

    // Status পরিবর্তন হয়ে থাকলে Sprint Progress পুনর্গণনা
    if (payload.status) {
      await updateSprintMetrics(tx, updatedTask.sprint_id);
    }

    return updatedTask;
  });
};

const deleteTask = async (taskId: number) => {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.task.delete({
      where: { id: taskId },
    });

    // Task ডিলিট হওয়ার পর Sprint Metrics আপডেট
    await updateSprintMetrics(tx, task.sprint_id);

    return task;
  });
};

export const taskService = {
  createTask,
  getTasksBySprint,
  updateTask,
  deleteTask,
};
