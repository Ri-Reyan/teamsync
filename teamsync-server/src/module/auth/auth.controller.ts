import { Request, Response } from "express";
import {
  forgotPasswordSchema,
  loginSchema,
  registerValidation,
  resetPasswordSchema,
  verifyOtpValidation,
} from "./auth.schema.js";
import AppError from "../../global/AppError.js";
import { authService } from "./auth.service.js";
import sendResponse from "../../global/sendResponse.js";
import catchAsync from "../../global/catchAsync.js";
import { credentials } from "../../config/credentials.js";
import { generateToken, sendCookie } from "../../utils/token.js";
import path from "path";
import ejs from "ejs";
import { sendEmail } from "../../utils/sendEmail.js";
import { convertToHash, verifyHash } from "../../utils/argon.js";
import { prisma } from "../../lib/prisma.js";
import { genOtp } from "../../utils/otp.js";
import redisClient from "../../lib/redis.js";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = registerValidation.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  await authService.registeUserService(result.data);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "A 6 digit otp sent to your email.",
    data: {
      username: result.data.username,
      email: result.data.email,
    },
  });
});

const verifyRegistrationEmail = catchAsync(
  async (req: Request, res: Response) => {
    const result = verifyOtpValidation.safeParse(req.body);

    if (!result.success) {
      throw new AppError(result.error.issues[0].message, 400);
    }

    const user = await authService.verifyRegistrationOtpService(result.data);

    const jwtPayload = {
      id: user.id,
      email: user.email,
      platformRole: user.platformRole,
      isPremium: user.isPremium,
      package: user.package,
    };

    const accessToken = generateToken(
      credentials.jwt_access_token_secret,
      jwtPayload,
      credentials.jwt_access_token_expires,
    );

    const refreshToken = generateToken(
      credentials.jwt_refresh_token_secret,
      jwtPayload,
      credentials.jwt_refresh_token_expires,
    );

    const templatePath = path.join(process.cwd(), "src/views/welcome.ejs");

    const html = await ejs.renderFile(templatePath, {
      username: user.username,
      email: user.email,
    });

    const sendEmailPayload = {
      to: user.email,
      subject: "Welcome to Team Sync",
      html,
    };

    sendEmail(sendEmailPayload);

    sendCookie(res, "accessToken", accessToken);

    sendCookie(res, "refreshToken", refreshToken);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Email verified successfully",
      data: user,
    });
  },
);

export const googleCallback = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any;

    const jwtPayload = {
      id: user.id,
      email: user.email,
      platformRole: user.platformRole,
      isPremium: user.isPremium,
      package: user.package,
    };

    const accessToken = generateToken(
      credentials.jwt_access_token_secret,
      jwtPayload,
      credentials.jwt_access_token_expires,
    );

    const refreshToken = generateToken(
      credentials.jwt_refresh_token_secret,
      jwtPayload,
      credentials.jwt_refresh_token_expires,
    );

    sendCookie(res, "accessToken", accessToken);
    sendCookie(res, "refreshToken", refreshToken);

    res.redirect(`${credentials.client_url}/sso-callback`);
  },
);

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const email = result.data?.email;

  const password = result.data?.password as string;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordMatch = await verifyHash(user.password, password);
  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    platformRole: user.platformRole,
    isPremium: user.isPremium,
    package: user.package,
  };

  const accessToken = generateToken(
    credentials.jwt_access_token_secret,
    jwtPayload,
    credentials.jwt_access_token_expires,
  );

  const refreshToken = generateToken(
    credentials.jwt_refresh_token_secret,
    jwtPayload,
    credentials.jwt_refresh_token_expires,
  );

  sendCookie(res, "accessToken", accessToken);
  sendCookie(res, "refreshToken", refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User logged in successfully",
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.platformRole,
    },
  });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const result = forgotPasswordSchema.safeParse(req.body);

    const email = result.data?.email;

    if (!result.success) {
      throw new AppError(result.error.issues[0].message, 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const resetToken = String(genOtp());
    const hashedToken = await convertToHash(resetToken);

    await redisClient.set(
      `forget_password:${resetToken}`,
      JSON.stringify({
        userId: user.id,
        token: hashedToken,
      }),
      {
        expiration: {
          type: "EX",
          value: 60 * 15,
        },
      },
    );

    const resetUrl = `${credentials.client_url}/reset-password?token=${resetToken}`;

    const templatePath = path.join(
      process.cwd(),
      "src/views/reset-password.ejs",
    );

    const html = await ejs.renderFile(templatePath, {
      name: user.username,
      resetUrl: resetUrl,
    });

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  },
);

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = resetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const token = result.data.token;
  const newPassword = result.data.newPassword;

  const findToken = await redisClient.get(`forget_password:${token}`);
  if (!findToken) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  const parsedToken = JSON.parse(findToken);

  const isMatched = await verifyHash(parsedToken.token, token);
  if (!isMatched) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  const hashedPassword = await convertToHash(newPassword);

  await prisma.user.update({
    where: { id: parsedToken.userId },
    data: {
      password: hashedPassword,
    },
  });

  await redisClient.del(`forget_password:${token}`);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message:
      "Password reset successfully. You can now login with your new password.",
  });
});

export const getMe = async (req: Request, res: Response) => {
  const userId = (req.user as any)?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User ID not found in token",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      platformRole: true,
      isPremium: true,
      package: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User profile fetched successfully",
    data: user,
  });
};

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");

  res.clearCookie("refreshToken");

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User logout successfully",
  });
});

export const authControllers = {
  register,
  verifyRegistrationEmail,
  googleCallback,
  getMe,
  logout,
};
