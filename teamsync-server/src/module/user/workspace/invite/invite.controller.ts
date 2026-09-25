import AppError from "../../../../global/AppError.js";
import catchAsync from "../../../../global/catchAsync.js";
import { sendInvitationSchema } from "./invite.schema.js";
import { Request, Response } from "express";
import { invitationService } from "./invite.service.js";
import sendResponse from "../../../../global/sendResponse.js";

const getInvitations = catchAsync(async (req: Request, res: Response) => {
  const { workspace_id } = req.params;

  const user = req.user;

  if (!user) {
    throw new AppError("User not found", 400);
  }

  const payload = {
    id: workspace_id as string,
    user_id: user.id,
  };

  const invitation = await invitationService.getInvitationService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invitations fetched successfully",
    data: invitation,
  });
});

const sendInvitation = catchAsync(async (req: Request, res: Response) => {
  const result = sendInvitationSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const user = req.user;

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  const id = req.params.id as string;

  const workspace_id = id as string;

  if (!workspace_id) {
    throw new AppError("Workspace ID is required", 400);
  }

  const { member_email, role } = result.data;

  const invitation = await invitationService.sendInvitationService({
    member_email,
    workspace_id,
    sender_id: user.id,
    role,
  });

  res.status(201).json({
    success: true,
    message: "Invitation sent successfully",
    data: invitation,
  });
});

const acceptInvitation = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const user = req.user;

  if (!user) {
    throw new AppError("User not found.", 400);
  }

  const payload = {
    id,
    user_id: user.id,
  };

  const member = await invitationService.acceptInvitationService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invitation accepted sucessfully",
    data: member,
  });
});

const cancelInvitation = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const { inviteId } = req.body;

  const user = req.user;

  if (!user) {
    throw new AppError("User not found.", 400);
  }

  const payload = {
    id,
    user_id: user.id,
    inviteId,
  };

  await invitationService.deleteInvitationService(payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Invitation deleted sucessfully",
  });
});

export const invitationController = {
  getInvitations,
  sendInvitation,
  acceptInvitation,
  cancelInvitation,
};
