import { prisma } from "./prisma.js";
import { PlatformRole } from "../generated/prisma/enums.js";
import { convertToHash } from "../utils/argon.js";

const seed = async () => {
  const isUserExits = await prisma.user.findMany({
    where: {
      username: "user",
      email: "user@example.com",
      platformRole: PlatformRole.USER,
    },
  });

  const isAdminExits = await prisma.user.findMany({
    where: {
      username: "admin",
      email: "admin@example.com",
      platformRole: PlatformRole.ADMIN,
    },
  });

  if (isUserExits.length <= 0 && isAdminExits.length <= 0) {
    const hashedPassUser = await convertToHash("user1234");
    await prisma.user.create({
      data: {
        username: "user",
        email: "user@example.com",
        password: hashedPassUser,
        platformRole: PlatformRole.USER,
        status: "ACTIVE",
        signUpMethod: "CREDENTIALS",
      },
    });
    const hashedPassAdmin = await convertToHash("admin1234");
    await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@example.com",
        password: hashedPassAdmin,
        platformRole: PlatformRole.ADMIN,
        status: "ACTIVE",
        signUpMethod: "CREDENTIALS",
      },
    });

    console.log("◇ User & Admin both seeded successfully.");
  } else if (isUserExits.length <= 0) {
    const hashedPassUser = await convertToHash("user1234");
    await prisma.user.create({
      data: {
        username: "user",
        email: "user@example.com",
        password: hashedPassUser,
        platformRole: PlatformRole.USER,
        status: "ACTIVE",
        signUpMethod: "CREDENTIALS",
      },
    });

    console.log("◇ User seeded successfully.");
  } else if (isAdminExits.length <= 0) {
    const hashedPassAdmin = await convertToHash("admin1234");
    await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@example.com",
        password: hashedPassAdmin,
        platformRole: PlatformRole.ADMIN,
        status: "ACTIVE",
        signUpMethod: "CREDENTIALS",
      },
    });

    console.log("◇ Admin seeded successfully.");
  } else {
    console.log("◇ Admin & User already exists.");
  }
};

export default seed;
