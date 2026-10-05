import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const expiredSubscriptions =
      await prisma.tutorSubscription.findMany({
        where: {
          status: "ACTIVE",
          expiresAt: {
            not: null,
            lte: now,
          },
        },
        select: {
          id: true,
          tutorProfileId: true,
        },
      });

    let expiredCount = 0;

    for (const subscription of expiredSubscriptions) {
      await prisma.$transaction(async (tx) => {
        const current =
          await tx.tutorSubscription.findUnique({
            where: {
              id: subscription.id,
            },
            select: {
              id: true,
              status: true,
              tutorProfileId: true,
            },
          });

        if (!current || current.status !== "ACTIVE") {
          return;
        }

        await tx.tutorSubscription.update({
          where: {
            id: current.id,
          },
          data: {
            status: "EXPIRED",
            expiredAt: now,
          },
        });

        const otherActiveSubscription =
          await tx.tutorSubscription.findFirst({
            where: {
              tutorProfileId: current.tutorProfileId,
              status: "ACTIVE",
              expiresAt: {
                gt: now,
              },
              id: {
                not: current.id,
              },
            },
            select: {
              id: true,
            },
          });

        if (!otherActiveSubscription) {
          await tx.tutorProfile.update({
            where: {
              id: current.tutorProfileId,
            },
            data: {
              status: "PAUSED",
              pausedAt: now,
            },
          });
        }
      });

      expiredCount++;
    }

    return NextResponse.json({
      success: true,
      expiredCount,
    });
  } catch (error) {
    console.error(
      "Home Tuition subscription expiry error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to expire subscriptions" },
      { status: 500 },
    );
  }
}