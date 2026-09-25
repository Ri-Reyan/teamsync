import AppError from "../../../../../global/AppError.js";
import catchAsync from "../../../../../global/catchAsync.js";
import { Request, Response } from "express";
import { sprintServices } from "./sprint.service.js";
import sendResponse from "../../../../../global/sendResponse.js";
import { createSprintSchema, updateSprintSchema } from "./sprint.schema.js";

const getSprint = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;

  if (!projectId) {
    throw new AppError("Project is must required", 400);
  }

  const userId = req.user?.id as string;

  if (!userId) {
    throw new AppError("user not found", 400);
  }

  const payload = {
    projectId,
    userId,
  };

  const sprints = await sprintServices.getSprintService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All sprints fetched successfully",
    data: sprints,
  });
});

const createSprint = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;

  if (!projectId) {
    throw new AppError("Project is must required", 400);
  }

  const userId = req.user?.id as string;

  if (!userId) {
    throw new AppError("user not found", 400);
  }

  const result = createSprintSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const payload = {
    projectId,
    userId,
    name: result.data.name,
    startDate: result.data.startDate,
    endDate: result.data.endDate,
  };

  const sprint = await sprintServices.createSprintService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Sprint created successfully",
    data: sprint,
  });
});

const updateSprint = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const sprintId = Number(req.params.sprintId);

  if (!projectId || isNaN(sprintId)) {
    throw new AppError("Project ID and valid Sprint ID are required", 400);
  }

  const userId = req.user?.id as string;
  if (!userId) {
    throw new AppError("User not found", 400);
  }

  const result = updateSprintSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const payload = {
    projectId,
    sprintId,
    userId,
    name: result.data.name,
    startDate: result.data.startDate,
    endDate: result.data.endDate,
  };

  const sprint = await sprintServices.updateSprintService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Sprint updated successfully",
    data: sprint,
  });
});

const deleteSprint = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const sprintId = Number(req.params.sprintId);

  if (!projectId || isNaN(sprintId)) {
    throw new AppError("Project ID and valid Sprint ID are required", 400);
  }

  const userId = req.user?.id as string;
  if (!userId) {
    throw new AppError("User not found", 400);
  }

  const payload = {
    projectId,
    sprintId,
    userId,
  };

  await sprintServices.deletedSprintService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Sprint deleted successfully",
  });
});

export const sprintController = {
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
};
