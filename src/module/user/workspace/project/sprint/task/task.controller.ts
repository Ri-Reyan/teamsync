import AppError from "../../../../../../global/AppError.js";
import catchAsync from "../../../../../../global/catchAsync.js";
import sendResponse from "../../../../../../global/sendResponse.js";
import { Request, Response } from "express";
import { createTaskSchema, updateTaskSchema } from "./task.schema.js";
import { taskService } from "./task.service.js";
import { publishTaskEvent } from "../../../../../../lib/pusher.js";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const sprintId = Number(req.params.sprintId);

  if (isNaN(sprintId)) {
    throw new AppError("Valid sprint ID is required", 400);
  }

  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const task = await taskService.createTask(sprintId, result.data);
  await publishTaskEvent(sprintId, "task_created", {
    sprintId,
    task: { ...task, status: task.task_status },
  });

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Task created successfully",
    data: task,
  });
});

const getTasks = catchAsync(async (req: Request, res: Response) => {
  const sprintId = Number(req.params.sprintId);

  if (isNaN(sprintId)) {
    throw new AppError("Valid sprint ID is required", 400);
  }

  const tasks = await taskService.getTasksBySprint(sprintId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Tasks fetched successfully",
    data: tasks,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);

  if (isNaN(taskId)) {
    throw new AppError("Valid task ID is required", 400);
  }

  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const task = await taskService.updateTask(taskId, result.data);
  await publishTaskEvent(task.sprint_id, "task_updated", {
    sprintId: task.sprint_id,
    task: { ...task, status: task.task_status },
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Task updated successfully",
    data: task,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);

  if (isNaN(taskId)) {
    throw new AppError("Valid task ID is required", 400);
  }

  const task = await taskService.deleteTask(taskId);
  await publishTaskEvent(task.sprint_id, "task_deleted", {
    sprintId: task.sprint_id,
    taskId,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Task deleted successfully",
    data: null,
  });
});

export const taskController = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
