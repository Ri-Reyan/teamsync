import express from "express";
import verifyUser from "../../../../../middleware/verifyUser.js";
import { PlatformRole } from "../../../../../generated/prisma/enums.js";
import { AIController } from "./ai.controller.js";
import rateLimiter from "../../../../../middleware/rateLimiter.js";

const aiRouter = express.Router({ mergeParams: true });

aiRouter.post(
  "/ai/chat",
  rateLimiter({ windowMs: 60 * 1000, max: 20, keyPrefix: "ai-chat" }),
  verifyUser(PlatformRole.USER),
  AIController.AIChat,
);

aiRouter.post(
  "/ai/summary",
  rateLimiter({ windowMs: 60 * 1000, max: 10, keyPrefix: "ai-summary" }),
  verifyUser(PlatformRole.USER),
  AIController.generateProjectSummary,
);

aiRouter.get(
  "/ai/conversations",
  rateLimiter({ windowMs: 60 * 1000, max: 60, keyPrefix: "ai-conversations" }),
  verifyUser(PlatformRole.USER),
  AIController.getPreviousConversation,
);

export default aiRouter;
