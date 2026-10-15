import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { ADMIN_EMAIL } from "@/lib/admin";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Axyon <noreply@axyon.in>";

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
        name: true,
        email: true,
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

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
) {
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

function createInvoiceNumber() {
  const date = new Date();

  const datePart =
    `${date.getFullYear()}` +
    `${String(date.getMonth() + 1).padStart(2, "0")}` +
    `${String(date.getDate()).padStart(2, "0")}`;

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
  if (!date) return "—";

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

function invoiceEmailHtml({
  invoiceNumber,
  tutorName,
  tutorEmail,
  planName,
  planType,
  amount,
  currency,
  subscriptionId,
  razorpayOrderId,
  razorpayPaymentId,
  issuedAt,
  startsAt,
  expiresAt,
}: {
  invoiceNumber: string;
  tutorName: string;
  tutorEmail: string;
  planName: string;
  planType: string;
  amount: number;
  currency: string;
  subscriptionId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  issuedAt: Date;
  startsAt: Date | null;
  expiresAt: Date | null;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Axyon Home Tuition Invoice</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
  <div style="padding:32px 16px;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">
      <div style="padding:28px 32px;background:#111827;color:#ffffff;">
        <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">Axyon</div>
        <div style="margin-top:6px;font-size:13px;color:#cbd5e1;">Home Tuition Subscription Invoice</div>
      </div>
      <div style="padding:32px;">
        <div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;">
          <div>
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;">Invoice</div>
            <div style="margin-top:6px;font-size:20px;font-weight:800;">${escapeHtml(invoiceNumber)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px;color:#64748b;">Issued</div>
            <div style="margin-top:4px;font-weight:700;">${formatDate(issuedAt)}</div>
          </div>
        </div>
        <div style="margin-top:32px;padding:20px;border-radius:14px;background:#f8fafc;">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;">Billed to</div>
          <div style="margin-top:8px;font-size:17px;font-weight:800;">${escapeHtml(tutorName)}</div>
          <div style="margin-top:4px;color:#64748b;">${escapeHtml(tutorEmail)}</div>
        </div>
        <div style="margin-top:28px;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <div style="padding:16px 18px;background:#f8fafc;font-weight:800;">Subscription</div>
          <div style="padding:18px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#64748b;">Plan</td><td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(planName)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Billing cycle</td><td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(planType)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Subscription ID</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px;">${escapeHtml(subscriptionId)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Start date</td><td style="padding:8px 0;text-align:right;font-weight:700;">${formatDate(startsAt)}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Expiry date</td><td style="padding:8px 0;text-align:right;font-weight:700;">${formatDate(expiresAt)}</td></tr>
              <tr>
                <td style="padding:16px 0 8px;border-top:1px solid #e5e7eb;font-size:16px;font-weight:800;">Total paid</td>
                <td style="padding:16px 0 8px;border-top:1px solid #e5e7eb;text-align:right;font-size:18px;font-weight:800;">${formatMoney(amount, currency)}</td>
              </tr>
            </table>
          </div>
        </div>
        <div style="margin-top:24px;padding:18px;border-radius:14px;background:#f8fafc;font-size:12px;color:#64748b;line-height:1.7;">
          <strong style="color:#334155;">Payment details</strong><br />
          Razorpay Order ID: ${escapeHtml(razorpayOrderId || "—")}<br />
          Razorpay Payment ID: ${escapeHtml(razorpayPaymentId || "—")}
        </div>
        <div style="margin-top:28px;font-size:12px;line-height:1.7;color:#64748b;">
          This invoice confirms the successful payment and activation of your Axyon Home Tuition subscription. Please retain it for your records.
        </div>
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#94a3b8;">Axyon · Home Tuition</div>
      </div>
    </div>
  </div>
</body>
</html>`;
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
  });

  if (existing) return existing;

  const details = await prisma.tutorSubscription.findUnique({
    where: { id: subscriptionId },
    select: {
      id: true,
      userId: true,
      status: true,
      purchasedPrice: true,
      purchasedPlanType: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      startsAt: true,
      expiresAt: true,
      user: {
        select: { id: true, name: true, email: true },
      },
      plan: {
        select: { name: true },
      },
      payments: {
        where: {
          id: paymentId,
          status: "ACTIVATED",
        },
        select: {
          id: true,
          amount: true,
          currency: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
        },
        take: 1,
      },
    },
  });

  if (
    !details ||
    details.user.id !== userId ||
    details.status !== "ACTIVE" ||
    details.razorpayPaymentId !== details.payments[0]?.razorpayPaymentId
  ) {
    throw new Error("Subscription details are not valid for invoice");
  }

  const payment = details.payments[0];

  if (
    !payment ||
    payment.amount !== details.purchasedPrice ||
    payment.currency !== "INR" ||
    payment.razorpayOrderId !== details.razorpayOrderId
  ) {
    throw new Error("Payment record is not valid for invoice");
  }

  try {
    return await prisma.tutorInvoice.create({
      data: {
        invoiceNumber: createInvoiceNumber(),
        userId,
        subscriptionId: details.id,
        paymentId: payment.id,
        tutorName: details.user.name,
        tutorEmail: details.user.email,
        planName: details.plan.name,
        planType: details.purchasedPlanType,
        amount: payment.amount,
        currency: payment.currency,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        issuedAt: new Date(),
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const concurrentInvoice = await prisma.tutorInvoice.findUnique({
        where: { subscriptionId },
      });

      if (concurrentInvoice) return concurrentInvoice;
    }

    throw error;
  }
}

async function sendInvoiceEmails(invoiceId: string, subscriptionId: string) {
  const invoice = await prisma.tutorInvoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) throw new Error("Invoice not found");

  const subscription = await prisma.tutorSubscription.findUnique({
    where: { id: subscriptionId },
    select: { startsAt: true, expiresAt: true },
  });

  if (!subscription) {
    throw new Error("Subscription not found for invoice email");
  }

  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.error("RESEND_API_KEY is not configured; invoice email not sent");
    return;
  }

  const resend = new Resend(resendKey);

  const html = invoiceEmailHtml({
    invoiceNumber: invoice.invoiceNumber,
    tutorName: invoice.tutorName,
    tutorEmail: invoice.tutorEmail,
    planName: invoice.planName,
    planType: invoice.planType,
    amount: invoice.amount,
    currency: invoice.currency,
    subscriptionId,
    razorpayOrderId: invoice.razorpayOrderId,
    razorpayPaymentId: invoice.razorpayPaymentId,
    issuedAt: invoice.issuedAt,
    startsAt: subscription.startsAt,
    expiresAt: subscription.expiresAt,
  });

  if (!invoice.tutorEmailSentAt) {
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
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

  const latest = await prisma.tutorInvoice.findUnique({
    where: { id: invoice.id },
  });

  if (latest && !latest.adminEmailSentAt) {
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Home Tuition Invoice Copy ${invoice.invoiceNumber}`,
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

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const subscriptionId = String(body?.subscriptionId ?? "").trim();
    const razorpayOrderId = String(body?.razorpay_order_id ?? "").trim();
    const razorpayPaymentId = String(body?.razorpay_payment_id ?? "").trim();
    const razorpaySignature = String(body?.razorpay_signature ?? "").trim();

    if (
      !subscriptionId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Incomplete payment information" },
        { status: 400 },
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials are not configured");

      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 },
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
      subscription.razorpayPaymentId === razorpayPaymentId &&
      subscription.razorpayOrderId === razorpayOrderId
    ) {
      const paymentRecord = await prisma.tutorPayment.findFirst({
        where: {
          subscriptionId: subscription.id,
          userId: user.id,
          status: "ACTIVATED",
          razorpayOrderId,
          razorpayPaymentId,
          amount: subscription.purchasedPrice,
          currency: "INR",
        },
        select: { id: true },
      });

      if (!paymentRecord) {
        return NextResponse.json(
          { error: "Existing payment record is inconsistent" },
          { status: 409 },
        );
      }

      const existingInvoice = await prisma.tutorInvoice.findUnique({
        where: { subscriptionId: subscription.id },
      });

      const invoice =
        existingInvoice ??
        (await createInvoiceIfNeeded({
          userId: user.id,
          subscriptionId: subscription.id,
          paymentId: paymentRecord.id,
        }));

      await sendInvoiceEmails(invoice.id, subscription.id);

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        subscriptionId: subscription.id,
        invoiceNumber: invoice.invoiceNumber,
      });
    }

    if (subscription.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "This subscription is no longer awaiting payment",
          status: subscription.status,
        },
        { status: 409 },
      );
    }

    if (
      !subscription.razorpayOrderId ||
      subscription.razorpayOrderId !== razorpayOrderId
    ) {
      return NextResponse.json(
        { error: "Payment order does not match subscription" },
        { status: 400 },
      );
    }

    if (
      !Number.isSafeInteger(subscription.purchasedPrice) ||
      subscription.purchasedPrice <= 0
    ) {
      return NextResponse.json(
        { error: "Subscription amount is invalid" },
        { status: 409 },
      );
    }

    if (
      !verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        keySecret,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

    if (
      razorpayPayment.id !== razorpayPaymentId ||
      razorpayPayment.order_id !== razorpayOrderId ||
      razorpayPayment.amount !== subscription.purchasedPrice * 100 ||
      razorpayPayment.currency !== "INR" ||
      razorpayPayment.status !== "captured"
    ) {
      return NextResponse.json(
        { error: "Razorpay payment does not match the subscription" },
        { status: 409 },
      );
    }

    const existingPayment = await prisma.tutorPayment.findFirst({
      where: { razorpayPaymentId },
      select: {
        id: true,
        subscriptionId: true,
        userId: true,
        amount: true,
        currency: true,
        razorpayOrderId: true,
        status: true,
      },
    });

    if (
      existingPayment &&
      (existingPayment.subscriptionId !== subscription.id ||
        existingPayment.userId !== user.id ||
        existingPayment.amount !== subscription.purchasedPrice ||
        existingPayment.currency !== "INR" ||
        existingPayment.razorpayOrderId !== razorpayOrderId)
    ) {
      return NextResponse.json(
        { error: "Payment ID is already associated with another payment" },
        { status: 409 },
      );
    }

    if (existingPayment?.status === "ACTIVATED") {
      return NextResponse.json(
        { error: "Payment record and subscription status are inconsistent" },
        { status: 409 },
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + subscription.durationDays);

    const activated = await prisma.$transaction(async (tx) => {
      const claim = await tx.tutorSubscription.updateMany({
        where: {
          id: subscription.id,
          userId: user.id,
          status: "PENDING",
          razorpayOrderId,
        },
        data: {
          status: "ACTIVE",
          startsAt: now,
          expiresAt,
          activatedAt: now,
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      if (claim.count !== 1) {
        const current = await tx.tutorSubscription.findUnique({
          where: { id: subscription.id },
          select: {
            id: true,
            userId: true,
            tutorProfileId: true,
            status: true,
            purchasedPrice: true,
            razorpayOrderId: true,
            razorpayPaymentId: true,
            startsAt: true,
            expiresAt: true,
            activatedAt: true,
          },
        });

        if (
          current?.status === "ACTIVE" &&
          current.userId === user.id &&
          current.razorpayOrderId === razorpayOrderId &&
          current.razorpayPaymentId === razorpayPaymentId
        ) {
          return current;
        }

        throw new Error("Subscription could not be claimed for activation");
      }

      await tx.tutorProfile.update({
        where: { id: subscription.tutorProfileId },
        data: {
          status: "ACTIVE",
          publishedAt: now,
          pausedAt: null,
        },
      });

      if (existingPayment) {
        await tx.tutorPayment.update({
          where: { id: existingPayment.id },
          data: {
            status: "ACTIVATED",
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            verifiedAt: now,
            activatedAt: now,
            failureReason: null,
          },
        });
      } else {
        await tx.tutorPayment.create({
          data: {
            subscriptionId: subscription.id,
            userId: user.id,
            amount: subscription.purchasedPrice,
            currency: "INR",
            status: "ACTIVATED",
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            verifiedAt: now,
            activatedAt: now,
          },
        });
      }

      return tx.tutorSubscription.findUniqueOrThrow({
        where: { id: subscription.id },
        select: {
          id: true,
          userId: true,
          tutorProfileId: true,
          status: true,
          purchasedPrice: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          startsAt: true,
          expiresAt: true,
          activatedAt: true,
        },
      });
    });

    const paymentRecord = await prisma.tutorPayment.findFirst({
      where: {
        subscriptionId: subscription.id,
        userId: user.id,
        status: "ACTIVATED",
        razorpayOrderId,
        razorpayPaymentId,
        amount: subscription.purchasedPrice,
        currency: "INR",
      },
      select: { id: true },
    });

    if (!paymentRecord) {
      throw new Error("Activated payment record not found");
    }

    const invoice = await createInvoiceIfNeeded({
      userId: user.id,
      subscriptionId: subscription.id,
      paymentId: paymentRecord.id,
    });

    await sendInvoiceEmails(invoice.id, subscription.id);

    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: "HOME_TUITION_PAYMENT",
        message: {
          contains: `Payment ID: ${razorpayPaymentId}`,
        },
      },
      select: { id: true },
    });

    if (!existingNotification) {
      const expiryText = formatDate(activated.expiresAt);

      await createNotification({
        userId: user.id,
        title: "Home Tuition payment successful",
        message:
          `Your Home Tuition subscription payment was successful. ` +
          `Your tutor profile is now active until ${expiryText}. ` +
          `Payment ID: ${razorpayPaymentId}. ` +
          `Subscription ID: ${subscription.id}. ` +
          `Invoice: ${invoice.invoiceNumber}`,
        type: "HOME_TUITION_PAYMENT",
        link: `/home-tuition/subscriptions/${subscription.id}`,
        sendEmail: true,
      });
    }

    return NextResponse.json({
      success: true,
      subscription: activated,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
      message:
        "Payment verified, invoice generated, and tutor subscription activated",
    });
  } catch (error) {
    console.error("Home Tuition payment verification error:", error);

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
