import AppError from "../../../global/AppError.js";
import { prisma } from "../../../lib/prisma.js";

const getDashboard = async () => {
  const [totalUsers, premiumUsers, workspaceCount, projectCount, payments] =
    await Promise.all([
      prisma.user.count({
        where: { platformRole: "USER", NOT: { email: "user@example.com" } },
      }),
      prisma.user.count({
        where: {
          platformRole: "USER",
          isPremium: true,
          NOT: { email: "user@example.com" },
        },
      }),
      prisma.workspace.count(),
      prisma.project.count(),
      prisma.payment.aggregate({
        where: { payment_status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

  return {
    totalUsers,
    premiumUsers,
    workspaceCount,
    projectCount,
    totalAmountReceived: payments._sum.amount ?? 0,
  };
};

const getUsers = async () =>
  prisma.user.findMany({
    where: { platformRole: "USER", NOT: { email: "user@example.com" } },
    select: {
      id: true,
      username: true,
      email: true,
      isPremium: true,
      package: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

const suspendUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.platformRole !== "USER") {
    throw new AppError("User not found", 404);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
    omit: { password: true },
  });
};

export const adminPanelService = { getDashboard, getUsers, suspendUser };
