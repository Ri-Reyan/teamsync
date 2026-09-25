import AppError from "../../../../global/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import {
  IDeleteMemberPayload,
  IGetMembersPayload,
} from "./member.interface.js";

const getWorkspaceMembersService = async (payload: IGetMembersPayload) => {
  const { workspace_id, user_id } = payload;

  const isMember = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id,
        user_id,
      },
    },
  });

  if (!isMember) {
    throw new AppError("You do not have access to this workspace", 403);
  }

  const members = await prisma.member.findMany({
    where: {
      workspace_id,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          platformRole: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return members;
};

const deleteWorkspaceMemberService = async (payload: IDeleteMemberPayload) => {
  const { workspace_id, member_id, requested_by_user_id } = payload;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspace_id },
  });

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  const requesterMember = await prisma.member.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id,
        user_id: requested_by_user_id,
      },
    },
  });

  if (!requesterMember) {
    throw new AppError("You are not a member of this workspace", 403);
  }

  const targetMember = await prisma.member.findUnique({
    where: { id: member_id },
  });

  if (!targetMember || targetMember.workspace_id !== workspace_id) {
    throw new AppError("Member not found in this workspace", 404);
  }

  if (workspace.owner_id === targetMember.user_id) {
    throw new AppError("Cannot remove the owner of the workspace", 400);
  }

  if (
    workspace.owner_id !== requested_by_user_id &&
    requesterMember.role !== "ADMIN"
  ) {
    throw new AppError(
      "Only Workspace Owner or Admins can remove members",
      403,
    );
  }

  await prisma.member.delete({
    where: { id: member_id },
  });

  return { message: "Member removed successfully" };
};

export const memberService = {
  getWorkspaceMembersService,
  deleteWorkspaceMemberService,
};
