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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    if (!user.studentVerified) {
      return NextResponse.json(
        {
          error:
            "Campus student verification is required before renewing a tutor subscription",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const currentSubscription =
      await prisma.tutorSubscription.findFirst({
        where: {
          id,
          userId: user.id,
        },
        select: {
          id: true,
          userId: true,
          tutorProfileId: true,
          status: true,
          expiresAt: true,
          planId: true,
          plan: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
              durationDays: true,
              description: true,
              isActive: true,
              offerEnabled: true,
              discountPercent: true,
              offerPrice: true,
              offerStartsAt: true,
              offerEndsAt: true,
              offerMessage: true,
            },
          },
          tutorProfile: {
            select: {
              id: true,
              status: true,
              termsAcceptedAt: true,
              termsVersion: true,
              safetyAcceptedAt: true,
              safetyVersion: true,
            },
          },
        },
      });

    if (!currentSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (
      currentSubscription.status !== "ACTIVE" &&
      currentSubscription.status !== "EXPIRED"
    ) {
      return NextResponse.json(
        {
          error:
            "Only active or expired subscriptions can be renewed",
          status: currentSubscription.status,
        },
        { status: 409 }
      );
    }

    if (!currentSubscription.plan.isActive) {
      return NextResponse.json(
        {
          error:
            "The previous subscription plan is no longer available for renewal",
        },
        { status: 409 }
      );
    }

    const tutorProfile = currentSubscription.tutorProfile;

    if (tutorProfile.status === "DELETED") {
      return NextResponse.json(
        {
          error:
            "Your tutor profile has been deleted. Create a new profile before renewing.",
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
            "You must accept the current Home Tuition terms and safety rules before renewing",
          termsVersion: HOME_TUITION_TERMS_VERSION,
          safetyVersion: HOME_TUITION_SAFETY_VERSION,
        },
        { status: 400 }
      );
    }

    const pendingSubscription =
      await prisma.tutorSubscription.findFirst({
        where: {
          userId: user.id,
          status: "PENDING",
        },
        select: {
          id: true,
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

    const body = await request.json().catch(() => ({}));

    const requestedPlanId =
      typeof body?.planId === "string"
        ? body.planId.trim()
        : "";

    const planId =
      requestedPlanId || currentSubscription.planId;

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
        { error: "Renewal plan is unavailable" },
        { status: 404 }
      );
    }

    // Calculate the payable renewal price on the server.
    const pricing = getEffectivePlanPrice(plan);

    const subscription =
      await prisma.tutorSubscription.create({
        data: {
          tutorProfileId: currentSubscription.tutorProfileId,
          userId: user.id,
          planId: plan.id,

          // Snapshot the effective price.
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
        renewalOf: currentSubscription.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Home Tuition subscription renewal error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create renewal subscription" },
      { status: 500 }
    );
  }
}