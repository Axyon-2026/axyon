import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { ADMIN_EMAIL } from "@/lib/admin";
import { Resend } from "resend";

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
) {
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

function createInvoiceNumber() {
  const now = new Date();

  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `AXY-HT-${datePart}-${randomPart}`;
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
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px">Axyon</div>
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
            <div style="margin-top:10px;font-size:13px;color:#6b7280">
              Razorpay Order ID:
              <span style="color:#111827">${escapeHtml(invoice.razorpayOrderId ?? "-")}</span>
            </div>
            <div style="margin-top:6px;font-size:13px;color:#6b7280">
              Razorpay Payment ID:
              <span style="color:#111827">${escapeHtml(invoice.razorpayPaymentId ?? "-")}</span>
            </div>
          </div>

          <div style="margin-top:28px;font-size:12px;line-height:1.6;color:#6b7280">
            This invoice confirms the successful payment for the Axyon Home Tuition subscription.
            Please retain this email for your records.
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
      purchasedPrice: true,
      purchasedPlanType: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      status: true,
      plan: {
        select: { name: true },
      },
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
    throw new Error("Invoice subscription data is not valid");
  }

  const payment = data.payments[0];

  if (
    !payment ||
    payment.amount !== data.purchasedPrice ||
    payment.currency !== "INR" ||
    payment.razorpayOrderId !== data.razorpayOrderId
  ) {
    throw new Error("Invoice payment record is not valid");
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
      select: {
        id: true,
        invoiceNumber: true,
      },
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
    console.warn(
      "RESEND_API_KEY is not configured; invoice emails skipped."
    );
    return;
  }

  const invoice = await prisma.tutorInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscription: {
        select: {
          startsAt: true,
          expiresAt: true,
        },
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

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret =
      process.env.RAZORPAY_TUTOR_WEBHOOK_SECRET ||
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Invalid webhook configuration" },
        { status: 400 }
      );
    }

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const event = String(payload?.event ?? "");

    if (event !== "payment.captured" && event !== "payment.failed") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const paymentEntity = payload?.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const paymentId = String(paymentEntity.id ?? "").trim();
    const orderId = String(paymentEntity.order_id ?? "").trim();
    const currency = String(paymentEntity.currency ?? "").toUpperCase();
    const paymentStatus = String(paymentEntity.status ?? "").toLowerCase();
    const amountInPaise = Number(paymentEntity.amount);

    if (!paymentId || !orderId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const subscription = await prisma.tutorSubscription.findFirst({
      where: { razorpayOrderId: orderId },
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
      console.warn("Webhook received for unknown Home Tuition order", {
        orderId,
        paymentId,
        event,
      });

      return NextResponse.json({ received: true, ignored: true });
    }

    const expectedAmount = subscription.purchasedPrice * 100;

    if (currency !== "INR" || amountInPaise !== expectedAmount) {
      console.error("Home Tuition webhook payment mismatch", {
        subscriptionId: subscription.id,
        orderId,
        paymentId,
        expectedAmount,
        amountInPaise,
        currency,
      });

      return NextResponse.json(
        { error: "Payment amount or currency mismatch" },
        { status: 400 }
      );
    }

    if (event === "payment.failed") {
      if (paymentStatus !== "failed") {
        return NextResponse.json({ received: true, ignored: true });
      }

      if (subscription.status !== "PENDING") {
        return NextResponse.json({
          received: true,
          processed: false,
          reason: "Subscription is no longer pending",
        });
      }

      const failureReason = String(
        paymentEntity.error_description ??
          paymentEntity.error_reason ??
          "Payment failed"
      ).slice(0, 500);

      await prisma.$transaction(async (tx) => {
        const current = await tx.tutorSubscription.findUnique({
          where: { id: subscription.id },
          select: { status: true, razorpayOrderId: true },
        });

        if (
          !current ||
          current.status !== "PENDING" ||
          current.razorpayOrderId !== orderId
        ) {
          return;
        }

        const existingPayment = await tx.tutorPayment.findFirst({
          where: { razorpayPaymentId: paymentId },
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

        if (existingPayment) {
          if (
            existingPayment.subscriptionId !== subscription.id ||
            existingPayment.userId !== subscription.userId ||
            existingPayment.amount !== subscription.purchasedPrice ||
            existingPayment.currency !== "INR" ||
            existingPayment.razorpayOrderId !== orderId
          ) {
            throw new Error("Existing payment does not match subscription");
          }

          if (existingPayment.status === "ACTIVATED") return;

          await tx.tutorPayment.update({
            where: { id: existingPayment.id },
            data: {
              status: "FAILED",
              failureReason,
            },
          });
        } else {
          await tx.tutorPayment.create({
            data: {
              subscriptionId: subscription.id,
              userId: subscription.userId,
              amount: subscription.purchasedPrice,
              currency: "INR",
              status: "FAILED",
              razorpayOrderId: orderId,
              razorpayPaymentId: paymentId,
              failureReason,
            },
          });
        }
      });

      const currentSubscription = await prisma.tutorSubscription.findUnique({
        where: { id: subscription.id },
        select: { status: true },
      });

      if (currentSubscription?.status === "PENDING") {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: subscription.userId,
            type: "HOME_TUITION_PAYMENT_FAILED",
            message: { contains: `Payment ID: ${paymentId}` },
          },
          select: { id: true },
        });

        if (!existingNotification) {
          await createNotification({
            userId: subscription.userId,
            title: "Home Tuition payment failed",
            message:
              `Your Home Tuition payment could not be completed. ` +
              `Reason: ${failureReason}. Payment ID: ${paymentId}`,
            type: "HOME_TUITION_PAYMENT_FAILED",
            link: `/home-tuition/subscriptions/${subscription.id}`,
            sendEmail: true,
          });
        }
      }

      return NextResponse.json({ received: true, processed: true });
    }

    if (paymentStatus !== "captured") {
      return NextResponse.json(
        { error: "Payment is not captured" },
        { status: 400 }
      );
    }

    let expiresAtForNotification: Date | null = null;
    let activationAllowed = false;

    await prisma.$transaction(async (tx) => {
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
          expiresAt: true,
        },
      });

      if (!current) {
        throw new Error("Subscription not found");
      }

      if (current.razorpayOrderId !== orderId) {
        throw new Error("Subscription order ID mismatch");
      }

      if (current.status === "ACTIVE") {
        if (current.razorpayPaymentId !== paymentId) {
          console.error(
            "Captured payment requires manual reconciliation: subscription is active with another payment",
            {
              subscriptionId: current.id,
              orderId,
              paymentId,
              savedPaymentId: current.razorpayPaymentId,
            }
          );
          return;
        }

        const existingActivatedPayment = await tx.tutorPayment.findFirst({
          where: {
            subscriptionId: current.id,
            userId: current.userId,
            razorpayPaymentId: paymentId,
            status: "ACTIVATED",
            amount: current.purchasedPrice,
            currency: "INR",
            razorpayOrderId: orderId,
          },
          select: { id: true },
        });

        if (!existingActivatedPayment || !current.expiresAt) {
          throw new Error("Existing activation failed consistency checks");
        }

        expiresAtForNotification = current.expiresAt;
        activationAllowed = true;
        return;
      }

      if (current.status !== "PENDING") {
        console.warn("Captured payment belongs to a non-pending subscription", {
          subscriptionId: current.id,
          status: current.status,
          orderId,
          paymentId,
        });
        return;
      }

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + current.durationDays);

      const existingPayment = await tx.tutorPayment.findFirst({
        where: { razorpayPaymentId: paymentId },
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

      if (existingPayment) {
        if (
          existingPayment.subscriptionId !== current.id ||
          existingPayment.userId !== current.userId ||
          existingPayment.amount !== current.purchasedPrice ||
          existingPayment.currency !== "INR" ||
          existingPayment.razorpayOrderId !== orderId
        ) {
          throw new Error("Existing payment does not match subscription");
        }

        if (existingPayment.status === "ACTIVATED") {
          throw new Error(
            "Payment is activated but subscription is still pending"
          );
        }
      }

      const claim = await tx.tutorSubscription.updateMany({
        where: {
          id: current.id,
          userId: current.userId,
          status: "PENDING",
          razorpayOrderId: orderId,
        },
        data: {
          status: "ACTIVE",
          startsAt: now,
          expiresAt,
          activatedAt: now,
          razorpayPaymentId: paymentId,
        },
      });

      if (claim.count !== 1) {
        throw new Error("Subscription state changed during activation");
      }

      await tx.tutorProfile.update({
        where: { id: current.tutorProfileId },
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
            verifiedAt: now,
            activatedAt: now,
            failureReason: null,
          },
        });
      } else {
        await tx.tutorPayment.create({
          data: {
            subscriptionId: current.id,
            userId: current.userId,
            amount: current.purchasedPrice,
            currency: "INR",
            status: "ACTIVATED",
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            verifiedAt: now,
            activatedAt: now,
          },
        });
      }

      const savedPayment = await tx.tutorPayment.findFirst({
        where: {
          subscriptionId: current.id,
          userId: current.userId,
          razorpayPaymentId: paymentId,
          status: "ACTIVATED",
          amount: current.purchasedPrice,
          currency: "INR",
          razorpayOrderId: orderId,
        },
        select: { id: true },
      });

      if (!savedPayment) {
        throw new Error("Activated payment record failed validation");
      }

      expiresAtForNotification = expiresAt;
      activationAllowed = true;
    });

    if (!activationAllowed || !expiresAtForNotification) {
      // Payment was received, but the subscription could not safely be
      // activated. Acknowledge the webhook and reconcile/refund manually.
      return NextResponse.json({
        received: true,
        processed: false,
        reason: "Subscription requires payment reconciliation",
      });
    }

    const activatedSubscription = await prisma.tutorSubscription.findUnique({
      where: { id: subscription.id },
      select: {
        status: true,
        userId: true,
        purchasedPrice: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        expiresAt: true,
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
      !activatedSubscription ||
      activatedSubscription.status !== "ACTIVE" ||
      activatedSubscription.userId !== subscription.userId ||
      activatedSubscription.razorpayOrderId !== orderId ||
      activatedSubscription.razorpayPaymentId !== paymentId ||
      !activatedSubscription.expiresAt
    ) {
      throw new Error("Activated subscription failed consistency checks");
    }

    const activatedPayment = activatedSubscription.payments[0];

    if (
      !activatedPayment ||
      activatedPayment.amount !== activatedSubscription.purchasedPrice ||
      activatedPayment.currency !== "INR" ||
      activatedPayment.razorpayOrderId !== orderId
    ) {
      throw new Error("Activated payment failed consistency checks");
    }

    try {
      const invoice = await createInvoiceIfNeeded({
        userId: subscription.userId,
        subscriptionId: subscription.id,
        paymentId: activatedPayment.id,
      });

      await sendInvoiceEmails(invoice.id, subscription.id);
    } catch (invoiceError) {
      console.error(
        "Home Tuition webhook invoice processing error:",
        invoiceError
      );
    }

    const existingSuccessNotification = await prisma.notification.findFirst({
      where: {
        userId: subscription.userId,
        type: "HOME_TUITION_PAYMENT",
        message: { contains: `Payment ID: ${paymentId}` },
      },
      select: { id: true },
    });

    if (!existingSuccessNotification) {
      const expiryText = activatedSubscription.expiresAt.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

      await createNotification({
        userId: subscription.userId,
        title: "Home Tuition payment successful",
        message:
          `Your Home Tuition payment was successful and your tutor profile is active. ` +
          `Your subscription is valid until ${expiryText}. ` +
          `Payment ID: ${paymentId}`,
        type: "HOME_TUITION_PAYMENT",
        link: `/home-tuition/subscriptions/${subscription.id}`,
        sendEmail: true,
      });
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("Home Tuition Razorpay webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}