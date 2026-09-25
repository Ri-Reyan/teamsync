import path from "path";
import AppError from "../../global/AppError.js";
import { prisma } from "../../lib/prisma.js";
import redisClient from "../../lib/redis.js";
import { convertToHash } from "../../utils/argon.js";
import { genOtp } from "../../utils/otp.js";
import { RegisterPayloadType, VerifyOtpPayloadType } from "./auth.interface.js";
import { sendEmail } from "../../utils/sendEmail.js";
import ejs from "ejs";

const registeUserService = async (paylaod: RegisterPayloadType) => {
  const { username, email, password, role } = paylaod;

  const isExistingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isExistingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await convertToHash(password);

  const isUserAlredyStoredInRedis = await redisClient.get(
    `unverified_user:${email}`,
  );

  const isOtpAlreadyStoredInRedis = await redisClient.get(
    `verify_otp:${email}`,
  );

  if (isOtpAlreadyStoredInRedis || isUserAlredyStoredInRedis) {
    await redisClient.del(`unverified_user:${email}`);

    await redisClient.del(`verify_otp:${email}`);
  }

  await redisClient.set(
    `unverified_user:${email}`,
    JSON.stringify({
      username,
      email,
      password: hashedPassword,
      role,
    }),
    {
      expiration: {
        type: "EX",
        value: 60 * 15,
      },
    },
  );

  const otpCode = genOtp();

  const templatePath = path.join(process.cwd(), "src/views/verify-email.ejs");

  const html = await ejs.renderFile(templatePath, {
    username: username,
    otpCode: otpCode,
    expiresIn: 15,
  });

  const sendEmailPayload = {
    to: email,
    subject: "Welcome to Team Sync",
    html,
  };

  sendEmail(sendEmailPayload);

  await redisClient.set(`verify_otp:${email}`, JSON.stringify(otpCode), {
    expiration: {
      type: "EX",
      value: 60 * 15,
    },
  });
};

const verifyRegistrationOtpService = async (payload: VerifyOtpPayloadType) => {
  const { email, otp } = payload;

  const storedUser = await redisClient.get(`unverified_user:${email}`);
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  const storedOtp = await redisClient.get(`verify_otp:${email}`);

  const parsedOtp = storedOtp ? JSON.parse(storedOtp) : null;

  const isOtpMatched = parsedOtp === Number(otp);

  if (!isOtpMatched) {
    throw new AppError("Invalid or expired otp", 400);
  }

  const user = await prisma.user.create({
    data: {
      username: parsedUser.username,
      email: parsedUser.email,
      password: parsedUser.password,
      signUpMethod: "CREDENTIALS",
      platformRole: parsedUser.role,
    },
    omit: {
      password: true,
    },
  });

  if (user) {
    await redisClient.del(`unverified_user:${email}`);

    await redisClient.del(`verify_otp:${email}`);
  }

  return user;
};

export const authService = {
  registeUserService,
  verifyRegistrationOtpService,
};
