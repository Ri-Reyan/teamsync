import express from "express";
import { memberController } from "./member.controller.js";
import { PlatformRole } from "../../../../generated/prisma/enums.js";
import verifyUser from "../../../../middleware/verifyUser.js";

const memberRouter = express.Router();

// Get all members of a workspace
memberRouter.get(
  "/:id/members",
  verifyUser(PlatformRole.USER),
  memberController.getWorkspaceMembers,
);

// Delete/Remove a member from a workspace
memberRouter.delete(
  "/:id/members/:member_id",
  verifyUser(PlatformRole.USER),
  memberController.deleteWorkspaceMember,
);

export default memberRouter;
