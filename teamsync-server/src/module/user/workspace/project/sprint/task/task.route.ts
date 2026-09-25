import express from "express";
import verifyUser from "../../../../../../middleware/verifyUser.js";
import { PlatformRole } from "../../../../../../generated/prisma/enums.js";
import { taskController } from "./task.controller.js";

const taskRouter = express.Router({ mergeParams: true });

// Fetch all tasks for a specific sprint
taskRouter.get(
  "/:sprintId/tasks",
  verifyUser(PlatformRole.USER),
  taskController.getTasks,
);

// Create task inside a sprint
taskRouter.post(
  "/:sprintId/tasks",
  verifyUser(PlatformRole.USER),
  taskController.createTask,
);

// Update specific task
taskRouter.patch(
  "/:sprintId/tasks/:taskId",
  verifyUser(PlatformRole.USER),
  taskController.updateTask,
);

// Delete specific task
taskRouter.delete(
  "/:sprintId/tasks/:taskId",
  verifyUser(PlatformRole.USER),
  taskController.deleteTask,
);

export default taskRouter;
