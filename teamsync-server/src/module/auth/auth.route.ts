import express from "express";
import {
  authControllers,
  forgotPassword,
  getMe,
  login,
  resetPassword,
} from "./auth.controller.js";
import passport from "passport";
import verifyUser from "../../middleware/verifyUser.js";
import { PlatformRole } from "../../generated/prisma/enums.js";

const authRouter = express.Router();

authRouter.post("/register", authControllers.register);
authRouter.post("/verify-email", authControllers.verifyRegistrationEmail);

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  authControllers.googleCallback,
);

authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/logout", authControllers.logout);

authRouter.get("/me", verifyUser(PlatformRole.USER, PlatformRole.ADMIN), getMe);

export default authRouter;
