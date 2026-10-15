import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/admin";

async function getCampusUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        marketplaceType: true,
        studentVerified: true,
        isSuspended: true,
      },
    });

    if (!user || user.marketplaceType !== "CAMPUS") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

function createInvoiceNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  return `AXY-HT-${datePart}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function invoiceEmailHtml(invoice: {
  invoiceNumber: string;
  tutorName: string;
  tutorEmail: string;
  planName: string;
  planType: string;
  amount: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  issuedAt: Date;
  subscription: {
    startsAt: Date | null;
    expiresAt: Date | null;
  };
}) {
  return `
    <div style="margin:0;padding:32px;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden">
        <div style="padding:28px 32px;background:#111827;color:#ffffff">
          <div style="font-size:24px;font-weight:800">Axyon</div>
          <div style="margin-top:6px;font-size:14px;color:#d1d5db">Home Tuition Subscription Invoice</div>
        </div>
        <div style="padding:32px">
          <div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap">
            <div>
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Invoice</div>
              <div style="margin-top:6px;font-size:20px;font-weight:800">${escapeHtml(invoice.invoiceNumber)}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Issued</div>
              <div style="margin-top:6px;font-size:15px;font-weight:700">${formatDate(invoice.issuedAt)}</div>
            </div>
          </div>
          <div style="margin-top:28px;padding:20px;border-radius:14px;background:#f9fafb">
            <div style="font-size:13px;color:#6b7280">Billed to</div>
            <div style="margin-top:6px;font-size:17px;font-weight:800">${escapeHtml(invoice.tutorName)}</div>
            <div style="margin-top:4px;font-size:14px;color:#4b5563">${escapeHtml(invoice.tutorEmail)}</div>
          </div>
          <table style="width:100%;margin-top:28px;border-collapse:collapse">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Plan</td>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">${escapeHtml(invoice.planName)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Billing period</td>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">${escapeHtml(invoice.planType)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Subscription starts</td>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">${formatDate(invoice.subscription.startsAt)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Subscription expires</td>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">${formatDate(invoice.subscription.expiresAt)}</td>
            </tr>
            <tr>
              <td style="padding:18px 0 0;font-size:17px;font-weight:800">Total paid</td>
              <td style="padding:18px 0 0;text-align:right;font-size:20px;font-weight:900">${formatMoney(invoice.amount, invoice.currency)}</td>
            </tr>
          </table>
          <div style="margin-top:28px;padding:18px;border:1px solid #e5e7eb;border-radius:14px">
            <div style="font-size:13px;font-weight:800;color:#374151">Payment details</div>
            <div style="margin-top:10px;font-size:13px;color:#6b7280">Razorpay Order ID: <span style="color:#111827">${escapeHtml(invoice.razorpayOrderId ?? "-")}</span></div>
            <div style="margin-top:6px;font-size:13px;color:#6b7280">Razorpay Payment ID: <span style="color:#111827">${escapeHtml(invoice.razorpayPaymentId ?? "-")}</span></div>
          </div>
          <div style="margin-top:28px;font-size:12px;line-height:1.6;color:#6b7280">
            This invoice confirms the successful payment for the Axyon Home Tuition subscription. Please retain this email for your records.
          </div>
        </div>
      </div>
    </div>
  `;
}

async function createInvoiceIfNeeded({
  userId,
  subscriptionId,
  paymentId,
}: {
  userId: string;
  subscriptionId: string;
  paymentId: string;
}) {
  const existing = await prisma.tutorInvoice.findUnique({
    where: { subscriptionId },
    select: { id: true, invoiceNumber: true },
  });

  if (existing) return existing;

  const data = await prisma.tutorSubscription.findUnique({
    where: { id: subscriptionId },
    select: {
      id: true,
      userId: true,
      status: true,
      purchasedPrice: true,
      purchasedPlanType: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      plan: { select: { name: true } },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payments: {
        where: {
          razorpayPaymentId: paymentId,
          status: "ACTIVATED",
        },
        select: {
          id: true,
          amount: true,
          currency: true,
          razorpayOrderId: true,
        },
        take: 1,
      },
    },
  });

  if (
    !data ||
    data.userId !== userId ||
    data.status !== "ACTIVE" ||
    data.razorpayPaymentId !== paymentId
  ) {
    throw new Error("Invoice subscription data is invalid");
  }

  const payment = data.payments[0];

  if (
    !payment ||
    payment.amount !== data.purchasedPrice ||
    payment.currency !== "INR" ||
    payment.razorpayOrderId !== data.razorpayOrderId
  ) {
    throw new Error("Invoice payment record is invalid");
  }

  try {
    return await prisma.tutorInvoice.create({
      data: {
        invoiceNumber: createInvoiceNumber(),
        userId: data.user.id,
        subscriptionId: data.id,
        paymentId: payment.id,
        tutorName: data.user.name,
        tutorEmail: data.user.email,
        planName: data.plan.name,
        planType: data.purchasedPlanType,
        amount: data.purchasedPrice,
        currency: "INR",
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: paymentId,
      },
      select: { id: true, invoiceNumber: true },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const concurrent = await prisma.tutorInvoice.findUnique({
        where: { subscriptionId },
        select: { id: true, invoiceNumber: true },
      });

      if (concurrent) return concurrent;
    }

    throw error;
  }
}

async function sendInvoiceEmails(
  invoiceId: string,
  subscriptionId: string
) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured; invoice emails skipped.");
    return;
  }

  const invoice = await prisma.tutorInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscription: {
        select: { startsAt: true, expiresAt: true },
      },
    },
  });

  if (!invoice || invoice.subscriptionId !== subscriptionId) return;

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM_EMAIL || "Axyon <noreply@axyon.in>";
  const html = invoiceEmailHtml(invoice);

  if (!invoice.tutorEmailSentAt) {
    try {
      const result = await resend.emails.send({
        from,
        to: invoice.tutorEmail,
        subject: `Axyon Home Tuition Invoice ${invoice.invoiceNumber}`,
        html,
      });

      if (!result.error) {
        await prisma.tutorInvoice.update({
          where: { id: invoice.id },
          data: { tutorEmailSentAt: new Date() },
        });
      } else {
        console.error("Tutor invoice email error:", result.error);
      }
    } catch (error) {
      console.error("Tutor invoice email error:", error);
    }
  }

  const refreshedInvoice = await prisma.tutorInvoice.findUnique({
    where: { id: invoice.id },
    select: { adminEmailSentAt: true },
  });

  if (!refreshedInvoice?.adminEmailSentAt) {
    try {
      const result = await resend.emails.send({
        from,
        to: ADMIN_EMAIL,
        subject: `Axyon Home Tuition Invoice Copy ${invoice.invoiceNumber}`,
        html,
      });

      if (!result.error) {
        await prisma.tutorInvoice.update({
          where: { id: invoice.id },
          data: { adminEmailSentAt: new Date() },
        });
      } else {
        console.error("Admin invoice email error:", result.error);
      }
    } catch (error) {
      console.error("Admin invoice email error:", error);
    }
  }
}

async function fetchAndValidateRazorpayPayment({
  orderId,
  paymentId,
  expectedAmount,
}: {
  orderId: string;
  paymentId: string;
  expectedAmount: number;
}) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const payment: any = await razorpay.payments.fetch(paymentId);

  if (
    String(payment.id ?? "") !== paymentId ||
    String(payment.order_id ?? "") !== orderId ||
    Number(payment.amount) !== expectedAmount * 100 ||
    String(payment.currency ?? "").toUpperCase() !== "INR" ||
    String(payment.status ?? "").toLowerCase() !== "captured"
  ) {
    throw new Error(
      "Razorpay payment is not captured or does not match the subscription"
    );
  }

  return payment;
}

export async function POST(request: Request) {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account is suspended" },
        { status: 403 }
      );
    }

    if (!user.studentVerified) {
      return NextResponse.json(
        { error: "Campus student verification is required" },
        { status: 403 }
      );
    }

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const subscriptionId = String(body?.subscriptionId ?? "").trim();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const subscription = await prisma.tutorSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId: user.id,
      },
      select: {
        id: true,
        userId: true,
        tutorProfileId: true,
        status: true,
        purchasedPrice: true,
        durationDays: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        startsAt: true,
        expiresAt: true,
        activatedAt: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (
      subscription.status === "ACTIVE" &&
      subscription.razorpayPaymentId &&
      subscription.razorpayOrderId
    ) {
      const paymentRecord = await prisma.tutorPayment.findFirst({
        where: {
          subscriptionId: subscription.id,
          userId: user.id,
          status: "ACTIVATED",
          razorpayOrderId: subscription.razorpayOrderId,
          razorpayPaymentId: subscription.razorpayPaymentId,
          amount: subscription.purchasedPrice,
          currency: "INR",
        },
        select: { id: true },
      });

      if (!paymentRecord) {
        return NextResponse.json(
          { error: "Active subscription payment record is inconsistent" },
          { status: 409 }
        );
      }

      try {
        await fetchAndValidateRazorpayPayment({
          orderId: subscription.razorpayOrderId,
          paymentId: subscription.razorpayPaymentId,
          expectedAmount: subscription.purchasedPrice,
        });

        const invoice = await createInvoiceIfNeeded({
          userId: user.id,
          subscriptionId: subscription.id,
          paymentId: paymentRecord.id,
        });

        await sendInvoiceEmails(invoice.id, subscription.id);

        return NextResponse.json({
          success: true,
          recovered: false,
          alreadyActive: true,
          subscription,
          invoiceNumber: invoice.invoiceNumber,
        });
      } catch (error) {
        console.error(
          "Home Tuition active subscription recovery verification error:",
          error
        );

        return NextResponse.json(
          { error: "Unable to verify the existing subscription payment" },
          { status: 502 }
        );
      }
    }

    if (subscription.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "Only pending subscriptions can be recovered",
          status: subscription.status,
        },
        { status: 409 }
      );
    }

    if (!subscription.razorpayOrderId) {
      return NextResponse.json(
        { error: "No Razorpay order is associated with this subscription" },
        { status: 409 }
      );
    }

    const payment = await prisma.tutorPayment.findFirst({
      where: {
        subscriptionId: subscription.id,
        userId: user.id,
        razorpayOrderId: subscription.razorpayOrderId,
        status: "ACTIVATED",
        razorpayPaymentId: { not: null },
        amount: subscription.purchasedPrice,
        currency: "INR",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        currency: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        razorpaySignature: true,
        verifiedAt: true,
        activatedAt: true,
      },
    });

    if (!payment?.razorpayPaymentId) {
      return NextResponse.json(
        {
          success: false,
          recovered: false,
          error: "No candidate captured payment was found for this subscription",
        },
        { status: 409 }
      );
    }

    if (
      payment.amount !== subscription.purchasedPrice ||
      payment.currency !== "INR" ||
      payment.razorpayOrderId !== subscription.razorpayOrderId
    ) {
      return NextResponse.json(
        { error: "Payment record does not match the subscription" },
        { status: 400 }
      );
    }

    try {
      await fetchAndValidateRazorpayPayment({
        orderId: subscription.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        expectedAmount: subscription.purchasedPrice,
      });
    } catch (error) {
      console.error("Home Tuition recovery Razorpay verification error:", error);

      return NextResponse.json(
        { error: "Razorpay could not confirm a matching captured payment" },
        { status: 409 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + subscription.durationDays);

    const recovered = await prisma.$transaction(async (tx) => {
      const current = await tx.tutorSubscription.findUnique({
        where: { id: subscription.id },
        select: {
          id: true,
          userId: true,
          tutorProfileId: true,
          status: true,
          purchasedPrice: true,
          durationDays: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          startsAt: true,
          expiresAt: true,
          activatedAt: true,
        },
      });

      if (!current) {
        throw new Error("Subscription not found during recovery");
      }

      if (current.status === "ACTIVE") {
        if (current.razorpayPaymentId !== payment.razorpayPaymentId) {
          throw new Error(
            "Subscription was activated with a different payment"
          );
        }

        return {
          alreadyActive: true,
          subscription: current,
        };
      }

      if (
        current.status !== "PENDING" ||
        current.razorpayOrderId !== subscription.razorpayOrderId
      ) {
        throw new Error("Subscription is no longer eligible for recovery");
      }

      const paymentRecord = await tx.tutorPayment.findFirst({
        where: {
          id: payment.id,
          subscriptionId: current.id,
          userId: current.userId,
          status: "ACTIVATED",
          razorpayOrderId: current.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
          amount: current.purchasedPrice,
          currency: "INR",
        },
        select: { id: true },
      });

      if (!paymentRecord) {
        throw new Error("Verified payment record changed during recovery");
      }

      const claim = await tx.tutorSubscription.updateMany({
        where: {
          id: current.id,
          userId: current.userId,
          status: "PENDING",
          razorpayOrderId: current.razorpayOrderId,
        },
        data: {
          status: "ACTIVE",
          startsAt: now,
          expiresAt,
          activatedAt: now,
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpaySignature: payment.razorpaySignature,
        },
      });

      if (claim.count !== 1) {
        throw new Error("Subscription state changed during recovery");
      }

      await tx.tutorProfile.update({
        where: { id: current.tutorProfileId },
        data: {
          status: "ACTIVE",
          publishedAt: now,
          pausedAt: null,
        },
      });

      await tx.tutorPayment.update({
        where: { id: paymentRecord.id },
        data: {
          status: "ACTIVATED",
          verifiedAt: payment.verifiedAt ?? now,
          activatedAt: now,
          failureReason: null,
        },
      });

      return {
        alreadyActive: false,
        subscription: {
          id: current.id,
          status: "ACTIVE" as const,
          startsAt: now,
          expiresAt,
          activatedAt: now,
          razorpayOrderId: current.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
        },
      };
    });

    const invoice = await createInvoiceIfNeeded({
      userId: user.id,
      subscriptionId: subscription.id,
      paymentId: payment.id,
    });

    await sendInvoiceEmails(invoice.id, subscription.id);

    return NextResponse.json({
      success: true,
      recovered: !recovered.alreadyActive,
      alreadyActive: recovered.alreadyActive,
      subscription: recovered.subscription,
      invoiceNumber: invoice.invoiceNumber,
      message: recovered.alreadyActive
        ? "Tutor subscription is already active"
        : "Paid subscription recovered and activated successfully",
    });
  } catch (error) {
    console.error("Home Tuition payment recovery error:", error);

    return NextResponse.json(
      { error: "Failed to recover payment" },
      { status: 500 }
    );
  }
}