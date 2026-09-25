import AppError from "../../../global/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import {
  CreateWorkspacePayload,
  TransferWorkspacePayload,
  UpdateWorkspacePayload,
} from "./worksapce.interface.js";

const createWorkspaceService = async (payload: CreateWorkspacePayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Account is suspended or inactive", 403);
  }

  const existingWorkspacesCount = await prisma.workspace.count({
    where: { owner_id: user.id },
  });

  if (!user.isPremium && existingWorkspacesCount >= 1) {
    throw new AppError(
      "Please upgrade your package to create more workspaces",
      400,
    );
  }

  const workspace = await prisma.$transaction(async (tx) => {
    const createdWorkspace = await tx.workspace.create({
      data: {
        name: payload.name,
        owner_id: user.id,
      },
    });

    await tx.member.create({
      data: {
        workspace_id: createdWorkspace.id,
        user_id: user.id,
        role: "OWNER",
      },
    });

    return createdWorkspace;
  });

  return workspace;
};

const updateWorkspaceService = async (payload: UpdateWorkspacePayload) => {
  const existingWorkspace = await prisma.workspace.findFirst({
    where: {
      id: payload.workspace_id,
      owner_id: payload.id,
    },
  });

  if (!existingWorkspace) {
    throw new AppError(
      "Workspace not found or you don't have permission to edit",
      404,
    );
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: payload.workspace_id },
    data: { name: payload.name },
  });

  return updatedWorkspace;
};

const removeWorkspaceService = async (workspaceId: string, userId: string) => {
  const existingWorkspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      owner_id: userId,
    },
  });

  if (!existingWorkspace) {
    throw new AppError(
      "Workspace not found or you don't have permission to delete",
      404,
    );
  }

  await prisma.workspace.delete({
    where: { id: workspaceId },
  });

  return null;
};

const transferWorkspace = async (payload: TransferWorkspacePayload) => {
  const { workspaceId, newOwnerId, currentUserId } = payload;

  // 1. Fetch Workspace and verify current owner
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  // Security Check: Only the actual current owner can transfer ownership
  if (workspace.owner_id !== currentUserId) {
    throw new AppError(
      "Forbidden: Only the workspace owner can transfer ownership",
      403,
    );
  }

  const isMemberExits = await prisma.member.findUnique({
    where: {
      id: newOwnerId,
    },
  });

  if (!isMemberExits) {
    throw new AppError("member not found", 400);
  }

  // 2. FIXED: Verify if NEW OWNER is a member of this workspace
  const targetMember = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: isMemberExits.user_id,
      },
    },
  });

  if (!targetMember) {
    throw new AppError(
      "The selected user is not a member of this workspace",
      400,
    );
  }

  // 3. Atomic Transaction: Update Workspace owner & swap Member roles
  const result = await prisma.$transaction(async (tx) => {
    // Step A: FIXED Field Name -> owner_id
    const updatedWorkspace = await tx.workspace.update({
      where: { id: workspaceId },
      data: { owner_id: isMemberExits.user_id },
    });

    // Step B: Promote target member to OWNER role
    await tx.member.update({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: isMemberExits.user_id,
        },
      },
      data: { role: "OWNER" },
    });

    // Step C: Demote former owner to ADMIN
    await tx.member.update({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: currentUserId,
        },
      },
      data: { role: "ADMIN" },
    });

    return updatedWorkspace;
  });

  return result; // FIXED: returning updated workspace
};

export const workspaceService = {
  createWorkspaceService,
  updateWorkspaceService,
  removeWorkspaceService,
  transferWorkspace,
};
