import express from "express";
import verifyUser from "../../../middleware/verifyUser.js";
import { PlatformRole } from "../../../generated/prisma/enums.js";
import paymentController from "./payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/checkout",
  verifyUser(PlatformRole.USER),
  paymentController.createPayment,
);
paymentRouter.post(
  "/confirm",
  verifyUser(PlatformRole.USER),
  paymentController.confirmPayment,
);

export default paymentRouter;
