import express from "express";
import verifyUser from "../../../../middleware/verifyUser.js";
import { PlatformRole } from "../../../../generated/prisma/enums.js";
import { invitationController } from "./invite.controller.js";

const invitationRouter = express.Router();

invitationRouter.get(
  "/:workspace_id/invite",
  verifyUser(PlatformRole.USER),
  invitationController.getInvitations,
);

invitationRouter.post(
  "/:id/invite",
  verifyUser(PlatformRole.USER),
  invitationController.sendInvitation,
);

invitationRouter.post(
  "/invitations/:id/accept",
  verifyUser(PlatformRole.USER),
  invitationController.acceptInvitation,
);

invitationRouter.delete(
  "/:id/invite",
  verifyUser(PlatformRole.USER),
  invitationController.cancelInvitation,
);

export default invitationRouter;
