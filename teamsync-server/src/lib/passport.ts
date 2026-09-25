import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma.js";
import { credentials } from "../config/credentials.js";
import path from "path";
import { sendEmail } from "../utils/sendEmail.js";
import ejs from "ejs";

passport.use(
  new GoogleStrategy(
    {
      clientID: credentials.google_client_id!,
      clientSecret: credentials.google_client_secret!,
      callbackURL: credentials.google_client_callback_url,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found from Google"), undefined);
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              username: profile.displayName.toLowerCase().replace(/\s+/g, ""),
              email,
              password: "",
              signUpMethod: "GOOGLE",
            },
          });

          const templatePath = path.join(
            process.cwd(),
            "src/views/welcome.ejs",
          );

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
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);

export default passport;
