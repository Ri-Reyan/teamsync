import Stripe from "stripe";
import AppError from "../../../global/AppError.js";
import { credentials } from "../../../config/credentials.js";
import { prisma } from "../../../lib/prisma.js";
import {
  Package,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";

const stripe = new Stripe(credentials.stripe_secret_key as string);

const plans = {
  PROFESSIONAL: {
    package: Package.PROFESSIONAL,
    name: "TeamSync Professional",
    amount: 14900,
  },
  ENTERPRISE: {
    package: Package.ENTERPRISE,
    name: "TeamSync Team / Agency",
    amount: 39900,
  },
};

type PaidPackage = keyof typeof plans;

const createPaymentService = async (
  userId: string,
  requestedPackage: string,
) => {
  const plan = plans[requestedPackage as PaidPackage];

  if (!plan) {
    throw new AppError("Invalid payment plan", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, package: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.package === plan.package) {
    throw new AppError("You already have this plan", 400);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: plan.name },
          unit_amount: plan.amount,
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, package: plan.package },
    success_url: `${credentials.client_url}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${credentials.client_url}/dashboard?payment=cancelled`,
  });

  if (!session.url) {
    throw new AppError("Unable to create payment session", 500);
  }

  await prisma.payment.upsert({
    where: { user_id: user.id },
    create: {
      user_id: user.id,
      method: PaymentMethod.STRIPE,
      transection_id: session.id,
      amount: plan.amount,
      payment_status: PaymentStatus.PENDING,
      package: plan.package,
    },
    update: {
      method: PaymentMethod.STRIPE,
      transection_id: session.id,
      amount: plan.amount,
      payment_status: PaymentStatus.PENDING,
      package: plan.package,
      paidAt: null,
    },
  });

  return { url: session.url };
};

const confirmPaymentService = async (userId: string, sessionId: string) => {
  if (!sessionId) {
    throw new AppError("Payment session is required", 400);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (
    session.payment_status !== "paid" ||
    session.metadata?.userId !== userId
  ) {
    throw new AppError("Payment has not been completed", 400);
  }

  const paidPackage = session.metadata?.package as PaidPackage | undefined;
  if (!paidPackage || !plans[paidPackage]) {
    throw new AppError("Invalid payment metadata", 400);
  }

  const plan = plans[paidPackage];
  if (session.amount_total !== plan.amount) {
    throw new AppError("Payment amount does not match the selected plan", 400);
  }

  const transactionId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.id;

  return prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.updateMany({
      where: {
        user_id: userId,
        transection_id: { in: [session.id, transactionId] },
      },
      data: {
        transection_id: transactionId,
        payment_status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });

    if (payment.count === 0) {
      throw new AppError("Payment record not found", 404);
    }

    return transaction.user.update({
      where: { id: userId },
      data: {
        package: plan.package,
        isPremium: true,
      },
      select: { id: true, package: true, isPremium: true },
    });
  });
};

export const paymentService = {
  createPaymentService,
  confirmPaymentService,
};
