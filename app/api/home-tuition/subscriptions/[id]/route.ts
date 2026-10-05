import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const subscription =
      await prisma.tutorSubscription.findFirst({
        where: {
          id,
          userId: user.id,
        },
        select: {
          id: true,
          tutorProfileId: true,
          planId: true,
          purchasedPlanType: true,
          purchasedPrice: true,
          durationDays: true,
          status: true,
          startsAt: true,
          expiresAt: true,
          activatedAt: true,
          cancelledAt: true,
          expiredAt: true,
          createdAt: true,
          updatedAt: true,
          plan: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
              durationDays: true,
              description: true,
              isActive: true,
            },
          },
        },
      });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscription,
    });
  } catch (error) {
    console.error(
      "Home Tuition subscription GET error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const action =
      typeof body.action === "string"
        ? body.action.trim().toUpperCase()
        : "";

    if (action !== "CANCEL") {
      return NextResponse.json(
        { error: "Invalid subscription action" },
        { status: 400 }
      );
    }

    const subscription =
      await prisma.tutorSubscription.findFirst({
        where: {
          id,
          userId: user.id,
        },
        select: {
          id: true,
          tutorProfileId: true,
          status: true,
          expiresAt: true,
        },
      });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (subscription.status === "CANCELLED") {
      return NextResponse.json({
        success: true,
        message: "Subscription is already cancelled",
      });
    }

    if (subscription.status === "EXPIRED") {
      return NextResponse.json(
        { error: "Subscription has already expired" },
        { status: 400 }
      );
    }

    /*
     * Home Tuition has no auto-renewal.
     * Cancellation therefore stops the subscription from
     * being treated as active, without creating a refund
     * automatically.
     */
    const updated = await prisma.$transaction(
      async (tx) => {
        const updatedSubscription =
          await tx.tutorSubscription.update({
            where: {
              id: subscription.id,
            },
            data: {
              status: "CANCELLED",
              cancelledAt: new Date(),
            },
            select: {
              id: true,
              status: true,
              cancelledAt: true,
              expiresAt: true,
            },
          });

        await tx.tutorProfile.updateMany({
          where: {
            id: subscription.tutorProfileId,
            userId: user.id,
          },
          data: {
            status: "PAUSED",
            pausedAt: new Date(),
          },
        });

        return updatedSubscription;
      }
    );

    return NextResponse.json({
      success: true,
      subscription: updated,
      message:
        "Subscription cancelled and tutor profile paused",
    });
  } catch (error) {
    console.error(
      "Home Tuition subscription POST error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}