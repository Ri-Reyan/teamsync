import AppError from "../../../global/AppError.js";
import catchAsync from "../../../global/catchAsync.js";
import { Request, Response } from "express";
import { paymentService } from "./payment.service.js";
import sendResponse from "../../../global/sendResponse.js";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("user not  found", 400);
  }

  const payment = await paymentService.createPaymentService(
    userId,
    req.body.package,
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Payment session created successfully",
    data: payment,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("User not found", 401);
  }

  const user = await paymentService.confirmPaymentService(
    userId,
    req.body.sessionId,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Payment confirmed successfully",
    data: user,
  });
});

const paymentControler = {
  createPayment,
  confirmPayment,
};

export default paymentControler;
