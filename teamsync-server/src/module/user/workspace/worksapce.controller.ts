import { Request, Response } from "express";
import catchAsync from "../../../global/catchAsync.js";
import AppError from "../../../global/AppError.js";
import sendResponse from "../../../global/sendResponse.js";
import { createWorkspaceSchema } from "./worksapce.schema.js";
import { workspaceService } from "./worksapce.service.js";
import { prisma } from "../../../lib/prisma.js";

const getWorkspace = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [
        {
          owner_id: user?.id,
        },
        {
          members: {
            some: {
              user_id: user?.id,
            },
          },
        },
      ],
    },
    include: {
      members: true,
    },
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Workspace fetched successfuly",
    data: workspaces,
  });
});

const createWorkspace = catchAsync(async (req: Request, res: Response) => {
  const result = createWorkspaceSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized access", 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
    platformRole: user.platformRole,
    isPremium: user.isPremium,
    name: result.data.name,
  };

  const workspace = await workspaceService.createWorkspaceService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Workspace created successfully",
    data: workspace,
  });
});

const updateWorkspace = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Workspace ID is required", 400);
  }

  const result = createWorkspaceSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized access", 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
    platformRole: user.platformRole,
    isPremium: user.isPremium,
    name: result.data.name,
    workspace_id: id as string,
  };

  const workspace = await workspaceService.updateWorkspaceService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Workspace updated successfully",
    data: workspace,
  });
});

const removeWorkspace = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Workspace ID is required", 400);
  }

  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized access", 401);
  }

  await workspaceService.removeWorkspaceService(id as string, user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Workspace deleted successfully",
  });
});

export const leaveWorkspace = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const { workspaceId } = req.params;

  if (!userId) {
    throw new AppError("user not found", 400);
  }

  const isWorkspaceExits = await prisma.workspace.findUnique({
    where: {
      id: workspaceId as string,
    },
  });

  if (!isWorkspaceExits) {
    throw new AppError("workspace not found", 400);
  }

  const isMemberExists = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: isWorkspaceExits.id,
        user_id: userId,
      },
    },
  });

  if (!isMemberExists) {
    throw new AppError("member not found", 400);
  }

  // ২. ওনার (Owner) সরাসরি লিভ নিতে পারবে না
  if (isMemberExists.role === "OWNER") {
    throw new AppError(
      "Workspace Owners cannot leave the workspace. Transfer ownership or delete the workspace instead.",
      400,
    );
  }

  await prisma.member.delete({
    where: {
      id: isMemberExists.id,
    },
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully left the workspace.",
  });
};

export const transferWorkspaceOwnership = async (
  req: Request,
  res: Response,
) => {
  const currentUserId = req.user?.id;
  const workspaceId = req.params.workspaceId as string;
  const newOwnerId = req.body.newOwnerId as string;

  if (!currentUserId) {
    throw new AppError("Unauthorized", 401);
  }

  if (!newOwnerId) {
    throw new AppError("New owner ID is required", 400);
  }

  if (currentUserId === newOwnerId) {
    throw new AppError("You are already the owner of this workspace", 400);
  }

  const payload = {
    currentUserId,
    workspaceId,
    newOwnerId,
  };

  const updatedWorkspace = await workspaceService.transferWorkspace(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Workspace ownership transferred successfully",
    data: updatedWorkspace,
  });
};

export const workspaceController = {
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  removeWorkspace,
  leaveWorkspace,
  transferWorkspaceOwnership,
};
