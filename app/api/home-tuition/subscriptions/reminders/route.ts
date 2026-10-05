import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.HOME_TUITION_CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "Cron secret is not configured" },
        { status: 500 },
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const now = new Date();

    const subscriptions =
      await prisma.tutorSubscription.findMany({
        where: {
          status: {
            in: ["ACTIVE", "EXPIRED"],
          },
          OR: [
            {
              status: "ACTIVE",
              expiresAt: {
                not: null,
              },
            },
            {
              status: "EXPIRED",
              expiredAt: {
                not: null,
              },
            },
          ],
        },
        select: {
          id: true,
          userId: true,
          status: true,
          expiresAt: true,
          expiredAt: true,
        },
      });

    let sentCount = 0;

    for (const subscription of subscriptions) {
      if (
        subscription.status === "ACTIVE" &&
        subscription.expiresAt
      ) {
        const expiresAt = subscription.expiresAt;

        const difference =
          expiresAt.getTime() - now.getTime();

        const daysRemaining =
          difference / (1000 * 60 * 60 * 24);

        let reminderType: string | null = null;
        let title: string | null = null;
        let message: string | null = null;

        if (daysRemaining > 6 && daysRemaining <= 7) {
          reminderType = "HOME_TUITION_EXPIRY_7_DAYS";
          title = "Home Tuition subscription expires in 7 days";
          message =
            "Your Home Tuition subscription will expire in 7 days. Renew your subscription to keep your tutor profile active.";
        } else if (
          daysRemaining > 0 &&
          daysRemaining <= 1
        ) {
          reminderType = "HOME_TUITION_EXPIRY_1_DAY";
          title = "Home Tuition subscription expires tomorrow";
          message =
            "Your Home Tuition subscription expires tomorrow. Renew your subscription to keep your tutor profile active.";
        }

        if (reminderType && title && message) {
          const existingNotification =
            await prisma.notification.findFirst({
              where: {
                userId: subscription.userId,
                type: reminderType,
                message: {
                  contains: subscription.id,
                },
              },
              select: {
                id: true,
              },
            });

          if (!existingNotification) {
            await createNotification({
              userId: subscription.userId,
              title,
              message:
                `${message} Subscription ID: ${subscription.id}`,
              type: reminderType,
              link: `/home-tuition/subscriptions/${subscription.id}`,
              sendEmail: true,
            });

            sentCount++;
          }
        }
      }

      if (
        subscription.status === "EXPIRED" &&
        subscription.expiredAt
      ) {
        const existingNotification =
          await prisma.notification.findFirst({
            where: {
              userId: subscription.userId,
              type: "HOME_TUITION_SUBSCRIPTION_EXPIRED",
              message: {
                contains: subscription.id,
              },
            },
            select: {
              id: true,
            },
          });

        if (!existingNotification) {
          await createNotification({
            userId: subscription.userId,
            title: "Home Tuition subscription expired",
            message:
              `Your Home Tuition subscription has expired and your tutor profile is no longer active. ` +
              `Subscription ID: ${subscription.id}`,
            type: "HOME_TUITION_SUBSCRIPTION_EXPIRED",
            link: `/home-tuition/subscriptions/${subscription.id}`,
            sendEmail: true,
          });

          sentCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
    });
  } catch (error) {
    console.error(
      "Home Tuition subscription reminder error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to send subscription reminders" },
      { status: 500 },
    );
  }
}