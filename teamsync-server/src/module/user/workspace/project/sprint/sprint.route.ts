import express from "express";
import verifyUser from "../../../../../middleware/verifyUser.js";
import { PlatformRole } from "../../../../../generated/prisma/enums.js";
import { sprintController } from "./sprint.controller.js";
import taskRouter from "./task/task.route.js";

const sprintRouter = express.Router({ mergeParams: true });

sprintRouter.get(
  "/:projectId/sprint",
  verifyUser(PlatformRole.USER),
  sprintController.getSprint,
);

sprintRouter.post(
  "/:projectId/sprint",
  verifyUser(PlatformRole.USER),
  sprintController.createSprint,
);

sprintRouter.put(
  "/:projectId/sprint/:sprintId",
  verifyUser(PlatformRole.USER),
  sprintController.updateSprint,
);

sprintRouter.delete(
  "/:projectId/sprint/:sprintId",
  verifyUser(PlatformRole.USER),
  sprintController.deleteSprint,
);

sprintRouter.use("/:projectId/sprint", taskRouter);

export default sprintRouter;
