import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/admin";
import { Resend } from "resend";
import crypto from "crypto";

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
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | null) {
  if (!date) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
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
              <div style="margin-top:6px;font-size:20px;font-weight:800">${invoice.invoiceNumber}</div>
            </div>

            <div style="text-align:right">
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Issued</div>
              <div style="margin-top:6px;font-size:15px;font-weight:700">${formatDate(invoice.issuedAt)}</div>
            </div>
          </div>

          <div style="margin-top:28px;padding:20px;border-radius:14px;background:#f9fafb">
            <div style="font-size:13px;color:#6b7280">Billed to</div>
            <div style="margin-top:6px;font-size:17px;font-weight:800">${invoice.tutorName}</div>
            <div style="margin-top:4px;font-size:14px;color:#4b5563">${invoice.tutorEmail}</div>
          </div>

          <table style="width:100%;margin-top:28px;border-collapse:collapse">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Plan</td>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">${invoice.planName}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#6b7280">Billing period</td>
              <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">${invoice.planType}</td>
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
            <div style="margin-top:10px;font-size:13px;color:#6b7280">
              Razorpay Order ID:
              <span style="color:#111827">${invoice.razorpayOrderId ?? "-"}</span>
            </div>
            <div style="margin-top:6px;font-size:13px;color:#6b7280">
              Razorpay Payment ID:
              <span style="color:#111827">${invoice.razorpayPaymentId ?? "-"}</span>
            </div>
          </div>

          <div style="margin-top:28px;font-size:12px;line-height:1.6;color:#6b7280">
            This invoice confirms the successful payment for the Axyon Home Tuition subscription.
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
    where: {
      subscriptionId,
    },
    select: {
      id: true,
      invoiceNumber: true,
    },
  });

  if (existing) {
    return existing;
  }

  const data = await prisma.tutorSubscription.findUnique({
    where: {
      id: subscriptionId,
    },
    select: {
      id: true,
      purchasedPrice: true,
      purchasedPlanType: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      plan: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!data || data.user.id !== userId) {
    throw new Error("Invoice subscription data not found");
  }

  try {
    return await prisma.tutorInvoice.create({
      data: {
        invoiceNumber: createInvoiceNumber(),
        userId: data.user.id,
        subscriptionId: data.id,
        paymentId,
        tutorName: data.user.name,
        tutorEmail: data.user.email,
        planName: data.plan.name,
        planType: data.purchasedPlanType,
        amount: data.purchasedPrice,
        currency: "INR",
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
      },
      select: {
        id: true,
        invoiceNumber: true,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      const concurrent = await prisma.tutorInvoice.findUnique({
        where: {
          subscriptionId,
        },
        select: {
          id: true,
          invoiceNumber: true,
        },
      });

      if (concurrent) return concurrent;
    }

    throw error;
  }
}

async function sendInvoiceEmails(
  invoiceId: string,
  subscriptionId: string,
) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured; invoice emails skipped.");
    return;
  }

  const invoice = await prisma.tutorInvoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      subscription: {
        select: {
          startsAt: true,
          expiresAt: true,
        },
      },
    },
  });

  if (!invoice || invoice.subscriptionId !== subscriptionId) {
    return;
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM_EMAIL || "Axyon <noreply@axyon.in>";

  const html = invoiceEmailHtml(invoice);

  if (!invoice.tutorEmailSentAt) {
    try {
      await resend.emails.send({
        from,
        to: invoice.tutorEmail,
        subject: `Axyon Home Tuition Invoice ${invoice.invoiceNumber}`,
        html,
      });

      await prisma.tutorInvoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          tutorEmailSentAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Home Tuition tutor invoice email error:", error);
    }
  }

  const refreshedInvoice = await prisma.tutorInvoice.findUnique({
    where: {
      id: invoice.id,
    },
    select: {
      adminEmailSentAt: true,
    },
  });

  if (!refreshedInvoice?.adminEmailSentAt) {
    try {
      await resend.emails.send({
        from,
        to: ADMIN_EMAIL,
        subject: `Axyon Home Tuition Invoice Copy ${invoice.invoiceNumber}`,
        html,
      });

      await prisma.tutorInvoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          adminEmailSentAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Home Tuition admin invoice email error:", error);
    }
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 },
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account is suspended" },
        { status: 403 },
      );
    }

    if (!user.studentVerified) {
      return NextResponse.json(
        { error: "Campus student verification is required" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const subscriptionId = String(body.subscriptionId ?? "").trim();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
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
        { status: 404 },
      );
    }

    if (
      subscription.status === "ACTIVE" &&
      subscription.razorpayPaymentId
    ) {
      const payment = await prisma.tutorPayment.findFirst({
        where: {
          subscriptionId: subscription.id,
          status: "ACTIVATED",
          razorpayPaymentId: subscription.razorpayPaymentId,
        },
        select: {
          id: true,
        },
      });

      if (payment) {
        try {
          const invoice = await createInvoiceIfNeeded({
            userId: user.id,
            subscriptionId: subscription.id,
            paymentId: payment.id,
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
            "Home Tuition recovery invoice processing error:",
            error,
          );
        }
      }

      return NextResponse.json({
        success: true,
        recovered: false,
        alreadyActive: true,
        subscription,
      });
    }

    if (subscription.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "Only pending subscriptions can be recovered",
          status: subscription.status,
        },
        { status: 409 },
      );
    }

    if (!subscription.razorpayOrderId) {
      return NextResponse.json(
        {
          error:
            "No Razorpay order is associated with this subscription",
        },
        { status: 409 },
      );
    }

    const payment = await prisma.tutorPayment.findFirst({
      where: {
        subscriptionId: subscription.id,
        razorpayOrderId: subscription.razorpayOrderId,
        status: "ACTIVATED",
        razorpayPaymentId: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          recovered: false,
          error:
            "No verified captured payment was found for this subscription",
        },
        { status: 409 },
      );
    }

    const expectedAmount = subscription.purchasedPrice;

    if (payment.amount !== expectedAmount) {
      console.error("Home Tuition recovery amount mismatch", {
        subscriptionId: subscription.id,
        paymentId: payment.id,
        expectedAmount,
        paymentAmount: payment.amount,
      });

      return NextResponse.json(
        { error: "Payment amount mismatch" },
        { status: 400 },
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);

    expiresAt.setDate(
      expiresAt.getDate() + subscription.durationDays,
    );

    const recovered = await prisma.$transaction(async (tx) => {
      const current = await tx.tutorSubscription.findUnique({
        where: {
          id: subscription.id,
        },
        select: {
          id: true,
          userId: true,
          tutorProfileId: true,
          status: true,
          purchasedPrice: true,
          durationDays: true,
          razorpayPaymentId: true,
        },
      });

      if (!current) {
        throw new Error("Subscription not found during recovery");
      }

      if (
        current.status === "ACTIVE" &&
        current.razorpayPaymentId
      ) {
        return {
          alreadyActive: true,
          subscription: current,
        };
      }

      if (current.status !== "PENDING") {
        throw new Error("Subscription is no longer pending");
      }

      const updated = await tx.tutorSubscription.update({
        where: {
          id: current.id,
        },
        data: {
          status: "ACTIVE",
          startsAt: now,
          expiresAt,
          activatedAt: now,
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpaySignature: payment.razorpaySignature,
        },
        select: {
          id: true,
          status: true,
          startsAt: true,
          expiresAt: true,
          activatedAt: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
        },
      });

      await tx.tutorProfile.update({
        where: {
          id: current.tutorProfileId,
        },
        data: {
          status: "ACTIVE",
          publishedAt: now,
          pausedAt: null,
        },
      });

      await tx.tutorPayment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "ACTIVATED",
          verifiedAt: payment.verifiedAt ?? now,
          activatedAt: now,
          failureReason: null,
        },
      });

      return {
        alreadyActive: false,
        subscription: updated,
      };
    });

    if (!recovered.alreadyActive) {
      try {
        const invoice = await createInvoiceIfNeeded({
          userId: user.id,
          subscriptionId: subscription.id,
          paymentId: payment.id,
        });

        await sendInvoiceEmails(invoice.id, subscription.id);

        return NextResponse.json({
          success: true,
          recovered: true,
          alreadyActive: false,
          subscription: recovered.subscription,
          invoiceNumber: invoice.invoiceNumber,
          message:
            "Paid subscription recovered and activated successfully",
        });
      } catch (invoiceError) {
        console.error(
          "Home Tuition recovery invoice processing error:",
          invoiceError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      recovered: !recovered.alreadyActive,
      alreadyActive: recovered.alreadyActive,
      subscription: recovered.subscription,
      message: recovered.alreadyActive
        ? "Tutor subscription is already active"
        : "Paid subscription recovered and activated successfully",
    });
  } catch (error) {
    console.error("Home Tuition payment recovery error:", error);

    return NextResponse.json(
      { error: "Failed to recover payment" },
      { status: 500 },
    );
  }
}

