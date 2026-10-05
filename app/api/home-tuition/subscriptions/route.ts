import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getEffectivePlanPrice } from "@/lib/home-tuition/pricing";

const HOME_TUITION_TERMS_VERSION = "1.0";
const HOME_TUITION_SAFETY_VERSION = "1.0";

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

export async function GET() {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    const subscriptions = await prisma.tutorSubscription.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        purchasedPlanType: true,
        purchasedPrice: true,
        durationDays: true,
        startsAt: true,
        expiresAt: true,
        activatedAt: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        createdAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            durationDays: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Home Tuition subscriptions GET error:", error);

    return NextResponse.json(
      { error: "Failed to load subscriptions" },
      { status: 500 }
    );
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
        {
          error:
            "Campus student verification is required before purchasing a tutor subscription",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const planId = String(body.planId ?? "").trim();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        status: true,
        termsAcceptedAt: true,
        termsVersion: true,
        safetyAcceptedAt: true,
        safetyVersion: true,
      },
    });

    if (!tutorProfile) {
      return NextResponse.json(
        {
          error:
            "Create your tutor profile before purchasing a subscription",
        },
        { status: 400 }
      );
    }

    if (
      !tutorProfile.termsAcceptedAt ||
      tutorProfile.termsVersion !== HOME_TUITION_TERMS_VERSION ||
      !tutorProfile.safetyAcceptedAt ||
      tutorProfile.safetyVersion !== HOME_TUITION_SAFETY_VERSION
    ) {
      return NextResponse.json(
        {
          error:
            "You must accept the current Home Tuition terms and safety rules before purchasing a subscription",
          termsVersion: HOME_TUITION_TERMS_VERSION,
          safetyVersion: HOME_TUITION_SAFETY_VERSION,
        },
        { status: 400 }
      );
    }

    if (tutorProfile.status === "DELETED") {
      return NextResponse.json(
        {
          error:
            "Your tutor profile has been deleted. Create a new profile before subscribing.",
        },
        { status: 400 }
      );
    }

    const plan = await prisma.tutorSubscriptionPlan.findFirst({
      where: {
        id: planId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        durationDays: true,
        description: true,
        offerEnabled: true,
        discountPercent: true,
        offerPrice: true,
        offerStartsAt: true,
        offerEndsAt: true,
        offerMessage: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Subscription plan is unavailable" },
        { status: 404 }
      );
    }

    // Server-side pricing.
    // The frontend cannot choose the amount that will be charged.
    const pricing = getEffectivePlanPrice(plan);

    const activeSubscription =
      await prisma.tutorSubscription.findFirst({
        where: {
          userId: user.id,
          status: "ACTIVE",
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
          expiresAt: true,
          plan: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      });

    if (activeSubscription) {
      return NextResponse.json(
        {
          error: "You already have an active subscription",
          subscription: activeSubscription,
        },
        { status: 409 }
      );
    }

    const pendingSubscription =
      await prisma.tutorSubscription.findFirst({
        where: {
          userId: user.id,
          status: "PENDING",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (pendingSubscription) {
      return NextResponse.json(
        {
          error:
            "You already have a pending subscription payment. Complete or resolve that payment before creating another one.",
          subscriptionId: pendingSubscription.id,
        },
        { status: 409 }
      );
    }

    const subscription = await prisma.tutorSubscription.create({
      data: {
        tutorProfileId: tutorProfile.id,
        userId: user.id,
        planId: plan.id,

        // Snapshot the effective price.
        // Future offer/price changes will not affect this subscription.
        purchasedPlanType: plan.type,
        purchasedPrice: pricing.price,
        durationDays: plan.durationDays,

        status: "PENDING",

        startsAt: null,
        expiresAt: null,
      },
      select: {
        id: true,
        status: true,
        purchasedPlanType: true,
        purchasedPrice: true,
        durationDays: true,
        startsAt: true,
        expiresAt: true,
        createdAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            durationDays: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        subscription,
        amount: pricing.price,
        currency: "INR",
        originalPrice: pricing.originalPrice,
        offerActive: pricing.offerActive,
        discountPercent: pricing.discountPercent,
        offerMessage: pricing.offerMessage,
        offerEndsAt: pricing.offerEndsAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Home Tuition subscriptions POST error:", error);

    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}