import express from "express";
import verifyUser from "../../../middleware/verifyUser.js";
import { PlatformRole } from "../../../generated/prisma/enums.js";
import { adminPanelController } from "./panel.controller.js";

const adminPanelRouter = express.Router();
adminPanelRouter.use(verifyUser(PlatformRole.ADMIN));
adminPanelRouter.get("/dashboard", adminPanelController.getDashboard);
adminPanelRouter.get("/users", adminPanelController.getUsers);
adminPanelRouter.patch(
  "/users/:userId/suspend",
  adminPanelController.suspendUser,
);

export default adminPanelRouter;
