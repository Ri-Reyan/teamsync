import "./global/globalUser.js";
import express from "express";
import cors from "cors";
import { credentials } from "./config/credentials.js";
import helmet from "helmet";
import { Request, Response } from "express";
import { globalErrorHandler } from "./global/errorHandler.js";
import authRouter from "./module/auth/auth.route.js";
import "./lib/passport.js";
import passport from "passport";
import worksapceRouter from "./module/user/workspace/worksapce.route.js";
import cookieParser from "cookie-parser";
import paymentRouter from "./module/user/payment/payment.route.js";
import adminPanelRouter from "./module/admin/panel/panel.route.js";
import rateLimiter from "./middleware/rateLimiter.js";
import verifyUser from "./middleware/verifyUser.js";
import { PlatformRole } from "./generated/prisma/enums.js";
import { pusher } from "./lib/pusher.js";

const app = express();

app.use(
  cors({
    origin: credentials.client_url as string,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(passport.initialize());

app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true,
    message: "Server is running",
  });
});

app.get("/api/v1/realtime/config", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { key: credentials.pusher_key, cluster: credentials.pusher_cluster },
  });
});

app.post(
  "/api/v1/realtime/auth",
  verifyUser(PlatformRole.USER),
  (req: Request, res: Response) => {
    const { socket_id: socketId, channel_name: channelName } = req.body;

    if (
      typeof socketId !== "string" ||
      typeof channelName !== "string" ||
      !channelName.startsWith("private-sprint-")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel authentication request",
      });
    }

    return res.send(pusher.authenticate(socketId, channelName));
  },
);

app.use(
  "/api/v1/auth",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, keyPrefix: "auth" }),
  authRouter,
);

app.use(
  "/api/v1/user/workspace",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 300, keyPrefix: "workspace" }),
  worksapceRouter,
);

app.use(
  "/api/v1/user/payment",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30, keyPrefix: "payment" }),
  paymentRouter,
);

app.use(
  "/api/v1/admin/panel",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, keyPrefix: "admin" }),
  adminPanelRouter,
);

app.use(globalErrorHandler);

export default app;
