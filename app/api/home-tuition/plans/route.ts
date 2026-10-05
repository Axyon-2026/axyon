import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { getEffectivePlanPrice } from "@/lib/home-tuition/pricing";

function parseDate(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

function validateOffer(
  body: Record<string, unknown>,
  price: number
) {
  const offerEnabled =
    body.offerEnabled === undefined
      ? false
      : Boolean(body.offerEnabled);

  const discountPercent =
    body.discountPercent === undefined ||
    body.discountPercent === null ||
    body.discountPercent === ""
      ? null
      : Number(body.discountPercent);

  const offerPrice =
    body.offerPrice === undefined ||
    body.offerPrice === null ||
    body.offerPrice === ""
      ? null
      : Number(body.offerPrice);

  const offerStartsAt = parseDate(body.offerStartsAt);
  const offerEndsAt = parseDate(body.offerEndsAt);

  if (
    discountPercent !== null &&
    (!Number.isInteger(discountPercent) ||
      discountPercent < 1 ||
      discountPercent > 99)
  ) {
    return {
      error: "Discount must be a whole number between 1 and 99",
    };
  }

  if (
    offerPrice !== null &&
    (!Number.isInteger(offerPrice) ||
      offerPrice <= 0 ||
      offerPrice > price)
  ) {
    return {
      error:
        "Offer price must be a positive integer no greater than the regular price",
    };
  }

  if (
    body.offerStartsAt &&
    !offerStartsAt
  ) {
    return { error: "Invalid offer start date" };
  }

  if (
    body.offerEndsAt &&
    !offerEndsAt
  ) {
    return { error: "Invalid offer end date" };
  }

  if (
    offerStartsAt &&
    offerEndsAt &&
    offerStartsAt > offerEndsAt
  ) {
    return {
      error: "Offer start date must be before the end date",
    };
  }

  const offerMessage =
    body.offerMessage === undefined ||
    body.offerMessage === null
      ? null
      : String(body.offerMessage).trim();

  if (offerMessage && offerMessage.length > 300) {
    return {
      error: "Offer message cannot exceed 300 characters",
    };
  }

  return {
    data: {
      offerEnabled,
      discountPercent,
      offerPrice,
      offerStartsAt,
      offerEndsAt,
      offerMessage: offerMessage || null,
    },
  };
}

export async function GET() {
  try {
    const plans = await prisma.tutorSubscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { type: "asc" },
        { price: "asc" },
      ],
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
        isActive: true,
      },
    });

    const plansWithPricing = plans.map((plan) => ({
      ...plan,
      ...getEffectivePlanPrice(plan),
    }));

    return NextResponse.json({
      plans: plansWithPricing,
    });
  } catch (error) {
    console.error("Home Tuition plans GET error:", error);

    return NextResponse.json(
      { error: "Failed to load subscription plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const type = String(body.type ?? "")
      .trim()
      .toUpperCase();
    const description = String(body.description ?? "").trim();
    const price = Number(body.price);
    const durationDays = Number(body.durationDays);

    if (!name) {
      return NextResponse.json(
        { error: "Plan name is required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Plan name cannot exceed 100 characters" },
        { status: 400 }
      );
    }

    if (type !== "MONTHLY" && type !== "YEARLY") {
      return NextResponse.json(
        { error: "Plan type must be MONTHLY or YEARLY" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(price) || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive integer" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(durationDays) || durationDays <= 0) {
      return NextResponse.json(
        { error: "Duration must be a positive integer" },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { error: "Description is too long" },
        { status: 400 }
      );
    }

    const offer = validateOffer(body, price);

    if ("error" in offer) {
      return NextResponse.json(
        { error: offer.error },
        { status: 400 }
      );
    }

    const plan = await prisma.tutorSubscriptionPlan.create({
      data: {
        name,
        type,
        price,
        durationDays,
        description: description || null,
        isActive: true,
        ...offer.data,
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
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        plan: {
          ...plan,
          ...getEffectivePlanPrice(plan),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Home Tuition plans POST error:", error);

    return NextResponse.json(
      { error: "Failed to create subscription plan" },
      { status: 500 }
    );
  }
}