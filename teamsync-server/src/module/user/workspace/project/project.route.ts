import express from "express";
import verifyUser from "../../../../middleware/verifyUser.js";
import { PlatformRole } from "../../../../generated/prisma/enums.js";
import { projectController } from "./project.controller.js";
import sprintRouter from "./sprint/sprint.route.js";
import aiRouter from "./ai/ai.route.js";

const projectRouter = express.Router();

projectRouter.get(
  "/:workspaceId/project",
  verifyUser(PlatformRole.USER),
  projectController.getProject,
);

projectRouter.post(
  "/:workspaceId/project",
  verifyUser(PlatformRole.USER),
  projectController.createProject,
);

projectRouter.patch(
  "/:workspaceId/project/:projectId",
  verifyUser(PlatformRole.USER),
  projectController.updateProject,
);

projectRouter.use("/:workspaceId/project/:projectId", aiRouter);

// Delete Project
projectRouter.delete(
  "/:workspaceId/project/:projectId",
  verifyUser(PlatformRole.USER),
  projectController.deleteProject,
);

// sprint mount
projectRouter.use("/:workspaceId/project", sprintRouter);

export default projectRouter;
