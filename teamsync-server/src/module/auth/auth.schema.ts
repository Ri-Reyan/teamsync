import * as z from "zod";

export const registerValidation = z.object({
  username: z
    .string()
    .min(5, { message: "Username must be at least 8 charecters" })
    .max(50, { message: "Username must be smaller than 50 charecters" }),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 charecters" })
    .max(50, { message: "Password must be smaller than 200 charecters" }),
  role: z.enum(["ADMIN", "USER"]).optional().default("USER"),
});

export const verifyOtpValidation = z.object({
  email: z.string().trim().email(),
  otp: z
    .string()
    .min(6, { message: "OTP must be exact 6 charecters" })
    .max(6, { message: "OTP must be exact 6 charecters" }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
