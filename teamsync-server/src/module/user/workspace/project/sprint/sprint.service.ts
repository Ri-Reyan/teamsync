import { prisma } from "../../../../../lib/prisma.js";
import {
  CreateSprintPayloadType,
  DeletedSprintPayloadType,
  GetSprintPayloadType,
  UpdateSprintPayloadType,
} from "./sprint.interface.js";
import AppError from "../../../../../global/AppError.js";

const getSprintService = async (payload: GetSprintPayloadType) => {
  const { projectId, userId } = payload;

  const existingProject = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      workspace_id: true,
    },
  });

  if (!existingProject) {
    throw new AppError("Project not found", 404);
  }

  const isMember = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: existingProject.workspace_id,
        user_id: userId,
      },
    },
  });

  if (!isMember) {
    throw new AppError(
      "You are not authorized to view sprints for this project",
      403,
    );
  }

  const sprints = await prisma.sprint.findMany({
    where: {
      project_id: projectId,
    },
    include: {
      tasks: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return sprints;
};

const createSprintService = async (payload: CreateSprintPayloadType) => {
  const { projectId, userId, name, startDate, endDate } = payload;

  const existingProject = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      workspace_id: true,
    },
  });

  if (!existingProject) {
    throw new AppError("Project not found", 404);
  }

  const isMember = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: existingProject.workspace_id,
        user_id: userId,
      },
    },
  });

  if (isMember?.role !== "OWNER" && isMember?.role !== "ADMIN") {
    throw new AppError(
      "You are not authorized to create sprints for this project",
      403,
    );
  }

  const sprint = await prisma.$transaction(async (tx) => {
    const newSprint = await tx.sprint.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        project_id: projectId,
      },
    });

    await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        sprint_count: {
          increment: 1,
        },
      },
    });

    return newSprint;
  });

  return sprint;
};

const updateSprintService = async (payload: UpdateSprintPayloadType) => {
  const { projectId, sprintId, userId, name, startDate, endDate } = payload;

  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspace_id: true },
  });

  if (!existingProject) {
    throw new AppError("Project not found", 404);
  }

  const isMember = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: existingProject.workspace_id,
        user_id: userId,
      },
    },
  });

  if (isMember?.role !== "OWNER" && isMember?.role !== "ADMIN") {
    throw new AppError(
      "You are not authorized to update sprints for this project",
      403,
    );
  }

  const existingSprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      project_id: projectId,
    },
  });

  if (!existingSprint) {
    throw new AppError("Sprint not found in this project", 404);
  }

  const updatedSprint = await prisma.sprint.update({
    where: { id: sprintId },
    data: {
      ...(name && { name }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    },
  });

  return updatedSprint;
};

const deletedSprintService = async (payload: DeletedSprintPayloadType) => {
  const { projectId, sprintId, userId } = payload;

  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspace_id: true },
  });

  if (!existingProject) {
    throw new AppError("Project not found", 404);
  }

  const isMember = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: existingProject.workspace_id,
        user_id: userId,
      },
    },
  });

  if (isMember?.role !== "OWNER" && isMember?.role !== "ADMIN") {
    throw new AppError(
      "You are not authorized to delete sprints for this project",
      403,
    );
  }

  const existingSprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      project_id: projectId,
    },
  });

  if (!existingSprint) {
    throw new AppError("Sprint not found in this project", 404);
  }

  // Database Transaction for safely deleting sprint and decrementing sprint_count
  return await prisma.$transaction(async (tx) => {
    const deletedSprint = await tx.sprint.delete({
      where: { id: sprintId },
    });

    await tx.project.update({
      where: { id: projectId },
      data: {
        sprint_count: {
          decrement: 1,
        },
      },
    });

    return deletedSprint;
  });
};

export const sprintServices = {
  getSprintService,
  createSprintService,
  updateSprintService,
  deletedSprintService,
};
