import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { ADMIN_EMAIL } from "@/lib/admin";
import { Resend } from "resend";

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function createInvoiceNumber() {
  const now = new Date();

  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `AXY-HT-${datePart}-${randomPart}`;
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
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px">Axyon</div>
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
      startsAt: true,
      expiresAt: true,
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

  const invoiceNumber = createInvoiceNumber();

  try {
    return await prisma.tutorInvoice.create({
      data: {
        invoiceNumber,
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

      if (concurrent) {
        return concurrent;
      }
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
    const rawBody = await request.text();

    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret =
      process.env.RAZORPAY_TUTOR_WEBHOOK_SECRET ||
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Invalid webhook configuration" },
        { status: 400 },
      );
    }

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 },
      );
    }

    const event = String(payload?.event ?? "");

    if (event !== "payment.captured" && event !== "payment.failed") {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const paymentEntity = payload?.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const paymentId = String(paymentEntity.id ?? "").trim();
    const orderId = String(paymentEntity.order_id ?? "").trim();

    if (!paymentId || !orderId) {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const subscription = await prisma.tutorSubscription.findFirst({
      where: {
        razorpayOrderId: orderId,
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

    if (!subscription) {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    if (event === "payment.failed") {
      if (subscription.status === "PENDING") {
        const failureReason = String(
          paymentEntity.error_description ??
            paymentEntity.error_reason ??
            "Payment failed",
        ).slice(0, 500);

        const existingPayment = await prisma.tutorPayment.findFirst({
          where: {
            razorpayPaymentId: paymentId,
          },
          select: {
            id: true,
          },
        });

        if (existingPayment) {
          await prisma.tutorPayment.update({
            where: {
              id: existingPayment.id,
            },
            data: {
              status: "FAILED",
              failureReason,
              razorpayOrderId: orderId,
            },
          });
        } else {
          await prisma.tutorPayment.create({
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

        const existingFailureNotification =
          await prisma.notification.findFirst({
            where: {
              userId: subscription.userId,
              type: "HOME_TUITION_PAYMENT_FAILED",
              message: {
                contains: `Payment ID: ${paymentId}`,
              },
            },
            select: {
              id: true,
            },
          });

        if (!existingFailureNotification) {
          await createNotification({
            userId: subscription.userId,
            title: "Home Tuition payment failed",
            message:
              `Your Home Tuition payment could not be completed. ` +
              `Reason: ${failureReason}. ` +
              `Payment ID: ${paymentId}`,
            type: "HOME_TUITION_PAYMENT_FAILED",
            link: `/home-tuition/subscriptions/${subscription.id}`,
            sendEmail: true,
          });
        }
      }

      return NextResponse.json({
        received: true,
        processed: true,
      });
    }

    const capturedAmount = Number(paymentEntity.amount ?? 0);
    const expectedAmount = subscription.purchasedPrice * 100;

    if (capturedAmount !== expectedAmount) {
      console.error("Home Tuition webhook amount mismatch", {
        subscriptionId: subscription.id,
        expectedAmount,
        capturedAmount,
        orderId,
        paymentId,
      });

      return NextResponse.json(
        { error: "Payment amount mismatch" },
        { status: 400 },
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);

    expiresAt.setDate(expiresAt.getDate() + subscription.durationDays);

    await prisma.$transaction(async (tx) => {
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
          razorpayPaymentId: true,
        },
      });

      if (!current) {
        throw new Error("Subscription not found during webhook processing");
      }

      if (current.status === "PENDING") {
        await tx.tutorSubscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            status: "ACTIVE",
            startsAt: now,
            expiresAt,
            activatedAt: now,
            razorpayPaymentId: paymentId,
          },
        });

        await tx.tutorProfile.update({
          where: {
            id: subscription.tutorProfileId,
          },
          data: {
            status: "ACTIVE",
            publishedAt: now,
            pausedAt: null,
          },
        });
      }

      const existingPayment = await tx.tutorPayment.findFirst({
        where: {
          razorpayPaymentId: paymentId,
        },
        select: {
          id: true,
        },
      });

      if (existingPayment) {
        await tx.tutorPayment.update({
          where: {
            id: existingPayment.id,
          },
          data: {
            status: "ACTIVATED",
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            verifiedAt: now,
            activatedAt: now,
            failureReason: null,
          },
        });
      } else {
        await tx.tutorPayment.create({
          data: {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            amount: subscription.purchasedPrice,
            currency: "INR",
            status: "ACTIVATED",
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            verifiedAt: now,
            activatedAt: now,
          },
        });
      }
    });

    const activatedPayment = await prisma.tutorPayment.findFirst({
      where: {
        subscriptionId: subscription.id,
        razorpayPaymentId: paymentId,
      },
      select: {
        id: true,
      },
    });

    if (activatedPayment) {
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
          invoiceError,
        );
      }
    }

    const existingSuccessNotification =
      await prisma.notification.findFirst({
        where: {
          userId: subscription.userId,
          type: "HOME_TUITION_PAYMENT",
          message: {
            contains: `Payment ID: ${paymentId}`,
          },
        },
        select: {
          id: true,
        },
      });

    if (!existingSuccessNotification) {
      const expiryText = expiresAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

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

    return NextResponse.json({
      received: true,
      processed: true,
    });
  } catch (error) {
    console.error("Home Tuition Razorpay webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

