import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { ADMIN_EMAIL } from "@/lib/admin";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Axyon <noreply@axyon.in>";

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
  secret: string
) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}

function createInvoiceNumber() {
  const date = new Date();

  const datePart =
    `${date.getFullYear()}` +
    `${String(date.getMonth() + 1).padStart(2, "0")}` +
    `${String(date.getDate()).padStart(2, "0")}`;

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
  if (!date) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
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
        <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">
          Axyon
        </div>
        <div style="margin-top:6px;font-size:13px;color:#cbd5e1;">
          Home Tuition Subscription Invoice
        </div>
      </div>

      <div style="padding:32px;">
        <div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;">
          <div>
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;">
              Invoice
            </div>
            <div style="margin-top:6px;font-size:20px;font-weight:800;">
              ${invoiceNumber}
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:12px;color:#64748b;">
              Issued
            </div>
            <div style="margin-top:4px;font-weight:700;">
              ${formatDate(issuedAt)}
            </div>
          </div>
        </div>

        <div style="margin-top:32px;padding:20px;border-radius:14px;background:#f8fafc;">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;">
            Billed to
          </div>
          <div style="margin-top:8px;font-size:17px;font-weight:800;">
            ${tutorName}
          </div>
          <div style="margin-top:4px;color:#64748b;">
            ${tutorEmail}
          </div>
        </div>

        <div style="margin-top:28px;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <div style="padding:16px 18px;background:#f8fafc;font-weight:800;">
            Subscription
          </div>

          <div style="padding:18px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#64748b;">Plan</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;">
                  ${planName}
                </td>
              </tr>

              <tr>
                <td style="padding:8px 0;color:#64748b;">Billing cycle</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;">
                  ${planType}
                </td>
              </tr>

              <tr>
                <td style="padding:8px 0;color:#64748b;">Subscription ID</td>
                <td style="padding:8px 0;text-align:right;font-family:monospace;font-size:12px;">
                  ${subscriptionId}
                </td>
              </tr>

              <tr>
                <td style="padding:8px 0;color:#64748b;">Start date</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;">
                  ${formatDate(startsAt)}
                </td>
              </tr>

              <tr>
                <td style="padding:8px 0;color:#64748b;">Expiry date</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;">
                  ${formatDate(expiresAt)}
                </td>
              </tr>

              <tr>
                <td style="padding:16px 0 8px;border-top:1px solid #e5e7eb;font-size:16px;font-weight:800;">
                  Total paid
                </td>
                <td style="padding:16px 0 8px;border-top:1px solid #e5e7eb;text-align:right;font-size:18px;font-weight:800;">
                  ${formatMoney(amount, currency)}
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div style="margin-top:24px;padding:18px;border-radius:14px;background:#f8fafc;font-size:12px;color:#64748b;line-height:1.7;">
          <strong style="color:#334155;">Payment details</strong><br />
          Razorpay Order ID: ${razorpayOrderId || "—"}<br />
          Razorpay Payment ID: ${razorpayPaymentId || "—"}
        </div>

        <div style="margin-top:28px;font-size:12px;line-height:1.7;color:#64748b;">
          This invoice confirms the successful payment and activation of your
          Axyon Home Tuition subscription. Please retain it for your records.
        </div>

        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#94a3b8;">
          Axyon · Home Tuition
        </div>
      </div>
    </div>
  </div>
</body>
</html>
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
  });

  if (existing) {
    return existing;
  }

  const details =
    await prisma.tutorSubscription.findUnique({
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
        payments: {
          where: {
            id: paymentId,
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

  if (!details) {
    throw new Error("Subscription details not found for invoice");
  }

  const payment = details.payments[0];

  if (!payment) {
    throw new Error("Payment record not found for invoice");
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
        razorpayOrderId:
          payment.razorpayOrderId ||
          details.razorpayOrderId,
        razorpayPaymentId:
          payment.razorpayPaymentId ||
          details.razorpayPaymentId,
        issuedAt: new Date(),
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      const concurrentInvoice =
        await prisma.tutorInvoice.findUnique({
          where: {
            subscriptionId,
          },
        });

      if (concurrentInvoice) {
        return concurrentInvoice;
      }
    }

    throw error;
  }
}

async function sendInvoiceEmails(
  invoiceId: string,
  subscriptionId: string
) {
  const invoice = await prisma.tutorInvoice.findUnique({
    where: {
      id: invoiceId,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const subscription =
    await prisma.tutorSubscription.findUnique({
      where: {
        id: subscriptionId,
      },
      select: {
        startsAt: true,
        expiresAt: true,
      },
    });

  if (!subscription) {
    throw new Error("Subscription not found for invoice email");
  }

  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.error(
      "RESEND_API_KEY is not configured; invoice email not sent"
    );

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
      await resend.emails.send({
        from: FROM_EMAIL,
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
      console.error(
        "Failed to send tutor invoice email:",
        error
      );
    }
  }

  const latest =
    await prisma.tutorInvoice.findUnique({
      where: {
        id: invoice.id,
      },
    });

  if (!latest?.adminEmailSentAt) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Home Tuition Invoice Copy ${invoice.invoiceNumber}`,
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
      console.error(
        "Failed to send admin invoice email:",
        error
      );
    }
  }
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

    const body = await request.json();

    const subscriptionId = String(
      body.subscriptionId ?? ""
    ).trim();

    const razorpayOrderId = String(
      body.razorpay_order_id ?? ""
    ).trim();

    const razorpayPaymentId = String(
      body.razorpay_payment_id ?? ""
    ).trim();

    const razorpaySignature = String(
      body.razorpay_signature ?? ""
    ).trim();

    if (
      !subscriptionId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Incomplete payment information" },
        { status: 400 }
      );
    }

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error(
        "Razorpay secret is not configured"
      );

      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 }
      );
    }

    const subscription =
      await prisma.tutorSubscription.findFirst({
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
          purchasedPlanType: true,
          durationDays: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
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
      subscription.razorpayPaymentId ===
        razorpayPaymentId
    ) {
      const existingInvoice =
        await prisma.tutorInvoice.findUnique({
          where: {
            subscriptionId: subscription.id,
          },
        });

      if (existingInvoice) {
        await sendInvoiceEmails(
          existingInvoice.id,
          subscription.id
        );
      }

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        subscriptionId: subscription.id,
        invoiceNumber:
          existingInvoice?.invoiceNumber || null,
      });
    }

    if (subscription.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            "This subscription is no longer awaiting payment",
          status: subscription.status,
        },
        { status: 409 }
      );
    }

    if (
      subscription.razorpayOrderId !==
      razorpayOrderId
    ) {
      return NextResponse.json(
        {
          error:
            "Payment order does not match subscription",
        },
        { status: 400 }
      );
    }

    const validSignature =
      verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        keySecret
      );

    if (!validSignature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const now = new Date();

    const expiresAt = new Date(now);

    expiresAt.setDate(
      expiresAt.getDate() +
        subscription.durationDays
    );

    const activated =
      await prisma.$transaction(
        async (tx) => {
          const current =
            await tx.tutorSubscription.findUnique({
              where: {
                id: subscription.id,
              },
              select: {
                id: true,
                userId: true,
                tutorProfileId: true,
                status: true,
                purchasedPrice: true,
                razorpayOrderId: true,
                razorpayPaymentId: true,
              },
            });

          if (!current) {
            throw new Error(
              "Subscription disappeared during activation"
            );
          }

          if (
            current.status === "ACTIVE" &&
            current.razorpayPaymentId ===
              razorpayPaymentId
          ) {
            return current;
          }

          if (current.status !== "PENDING") {
            throw new Error(
              "Subscription is no longer pending"
            );
          }

          const updated =
            await tx.tutorSubscription.update({
              where: {
                id: subscription.id,
              },
              data: {
                status: "ACTIVE",
                startsAt: now,
                expiresAt,
                activatedAt: now,
                razorpayPaymentId,
                razorpaySignature,
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
              id: subscription.tutorProfileId,
            },
            data: {
              status: "ACTIVE",
              publishedAt: now,
              pausedAt: null,
            },
          });

          const existingPayment =
            await tx.tutorPayment.findFirst({
              where: {
                razorpayPaymentId,
              },
              select: {
                id: true,
              },
            });

          if (!existingPayment) {
            await tx.tutorPayment.create({
              data: {
                subscriptionId:
                  subscription.id,
                userId: subscription.userId,
                amount:
                  subscription.purchasedPrice,
                currency: "INR",
                status: "ACTIVATED",
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                verifiedAt: now,
                activatedAt: now,
              },
            });
          } else {
            await tx.tutorPayment.update({
              where: {
                id: existingPayment.id,
              },
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
          }

          return updated;
        }
      );

    /*
     * Create exactly one invoice for the successful
     * subscription payment.
     */
    const payment =
      await prisma.tutorPayment.findFirst({
        where: {
          subscriptionId: subscription.id,
          razorpayPaymentId,
        },
        select: {
          id: true,
        },
      });

    if (!payment) {
      throw new Error(
        "Activated payment record not found"
      );
    }

    const invoice =
      await createInvoiceIfNeeded({
        userId: user.id,
        subscriptionId: subscription.id,
        paymentId: payment.id,
      });

    /*
     * Send invoice to tutor and a copy to admin.
     * Email failures do not undo an already verified payment.
     */
    await sendInvoiceEmails(
      invoice.id,
      subscription.id
    );

    /*
     * Payment success notification/email.
     *
     * The notification is checked first so repeated
     * Razorpay callbacks cannot send duplicate success emails.
     */
    const existingNotification =
      await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: "HOME_TUITION_PAYMENT",
          message: {
            contains:
              `Subscription ID: ${subscription.id}`,
          },
        },
        select: {
          id: true,
        },
      });

    if (!existingNotification) {
      const expiryText =
        expiresAt.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );

      await createNotification({
        userId: user.id,
        title:
          "Home Tuition payment successful",
        message:
          `Your Home Tuition subscription payment was successful. ` +
          `Your tutor profile is now active and published until ${expiryText}. ` +
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
        invoiceNumber:
          invoice.invoiceNumber,
      },
      message:
        "Payment verified, invoice generated, and tutor subscription activated",
    });
  } catch (error) {
    console.error(
      "Home Tuition payment verification error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}