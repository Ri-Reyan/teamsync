import AppError from "../../../../global/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import {
  CreateProjectPayloadType,
  DeleteProjectPayloadType,
  GetProjectPayloadType,
  UpdateProjectPayloadType,
} from "./project.interface.js";

const getProjectService = async (payload: GetProjectPayloadType) => {
  const { workspaceId, userId } = payload;

  const isWorkspaceExits = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!isWorkspaceExits) {
    throw new AppError("workspace not found", 400);
  }

  const isMemberExists = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
  });

  if (!isMemberExists) {
    throw new AppError("You are not member of this workspace", 400);
  }

  const project = await prisma.project.findMany({
    where: {
      workspace_id: workspaceId,
    },
  });

  return project;
};

const createProjectService = async (payload: CreateProjectPayloadType) => {
  const { workspaceId, userId, name, description } = payload;

  const isWorkspaceExists = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
    include: {
      owner: true,
    },
  });

  if (!isWorkspaceExists) {
    throw new AppError("workspace not found", 400);
  }

  const isMemberExists = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
  });

  if (!isMemberExists) {
    throw new AppError("You are not member of this workspace", 403);
  }

  if (isMemberExists.role !== "OWNER" && isMemberExists.role !== "ADMIN") {
    throw new AppError("You are not allowed to perform this action", 403);
  }

  const project_count = await prisma.project.findMany({
    where: {
      workspace_id: workspaceId,
    },
  });

  if (
    isWorkspaceExists.owner.package === "STARTER" &&
    project_count.length >= 2
  ) {
    throw new AppError(
      "Please upgrade your package to create more projcet",
      400,
    );
  }

  if (
    isWorkspaceExists.owner.package === "PROFESSIONAL" &&
    project_count.length >= 50
  ) {
    throw new AppError(
      "Please upgrade your package to create more projcet",
      400,
    );
  }

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        name,
        description,
        workspace_id: workspaceId,
      },
    });

    await tx.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        project_count: {
          increment: 1,
        },
      },
    });

    return createdProject;
  });

  return project;
};

const updateProjectService = async (payload: UpdateProjectPayloadType) => {
  const { workspaceId, projectId, userId, name, description } = payload;

  const isMemberExists = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
  });

  if (!isMemberExists) {
    throw new AppError(
      "Forbidden: You are not a member of this workspace",
      403,
    );
  }

  if (isMemberExists.role !== "OWNER" && isMemberExists.role !== "ADMIN") {
    throw new AppError("You are not allowed to perform this action", 403);
  }

  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace_id: workspaceId,
    },
  });

  if (!existingProject) {
    throw new AppError("Project not found in this workspace", 404);
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
  });

  return updatedProject;
};

const deleteProjectService = async (payload: DeleteProjectPayloadType) => {
  const { workspaceId, projectId, userId } = payload;

  const isMemberExists = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
  });

  if (!isMemberExists) {
    throw new AppError(
      "Forbidden: You are not a member of this workspace",
      403,
    );
  }

  if (isMemberExists.role !== "OWNER" && isMemberExists.role !== "ADMIN") {
    throw new AppError("You are not allowed to perform this action", 403);
  }

  const existingProject = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace_id: workspaceId,
    },
  });

  if (!existingProject) {
    throw new AppError("Project not found in this workspace", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.delete({
      where: {
        id: projectId,
      },
    });

    await tx.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        project_count: {
          decrement: 1,
        },
      },
    });
  });

  return null;
};

export const projectServices = {
  getProjectService,
  createProjectService,
  updateProjectService,
  deleteProjectService,
};
