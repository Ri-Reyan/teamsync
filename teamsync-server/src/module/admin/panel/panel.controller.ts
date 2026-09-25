import { Request, Response } from "express";
import catchAsync from "../../../global/catchAsync.js";
import AppError from "../../../global/AppError.js";
import sendResponse from "../../../global/sendResponse.js";
import { adminPanelService } from "./panel.service.js";

const getDashboard = catchAsync(async (_req: Request, res: Response) => {
  const dashboard = await adminPanelService.getDashboard();
  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Admin dashboard fetched successfully",
    data: dashboard,
  });
});

const getUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await adminPanelService.getUsers();
  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users fetched successfully",
    data: users,
  });
});

const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (typeof userId !== "string") {
    throw new AppError("A valid user id is required", 400);
  }

  const user = await adminPanelService.suspendUser(userId);
  return sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User suspended successfully",
    data: user,
  });
});

export const adminPanelController = { getDashboard, getUsers, suspendUser };
