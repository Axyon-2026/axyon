import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { getEffectivePlanPrice } from "@/lib/home-tuition/pricing";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseDate(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const existingPlan =
      await prisma.tutorSubscriptionPlan.findUnique({
        where: { id },
      });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const nextPrice =
      body.price !== undefined
        ? Number(body.price)
        : existingPlan.price;

    if (!Number.isInteger(nextPrice) || nextPrice <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive integer" },
        { status: 400 }
      );
    }

    const data: {
      name?: string;
      type?: "MONTHLY" | "YEARLY";
      price?: number;
      durationDays?: number;
      description?: string | null;
      isActive?: boolean;
      offerEnabled?: boolean;
      discountPercent?: number | null;
      offerPrice?: number | null;
      offerStartsAt?: Date | null;
      offerEndsAt?: Date | null;
      offerMessage?: string | null;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name || name.length > 100) {
        return NextResponse.json(
          {
            error:
              "Plan name must be between 1 and 100 characters",
          },
          { status: 400 }
        );
      }

      data.name = name;
    }

    if (body.type !== undefined) {
      const type = String(body.type)
        .trim()
        .toUpperCase();

      if (type !== "MONTHLY" && type !== "YEARLY") {
        return NextResponse.json(
          {
            error:
              "Type must be MONTHLY or YEARLY",
          },
          { status: 400 }
        );
      }

      data.type = type;
    }

    if (body.price !== undefined) {
      data.price = nextPrice;
    }

    if (body.durationDays !== undefined) {
      const durationDays = Number(body.durationDays);

      if (
        !Number.isInteger(durationDays) ||
        durationDays <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Duration must be a positive integer",
          },
          { status: 400 }
        );
      }

      data.durationDays = durationDays;
    }

    if (body.description !== undefined) {
      const description =
        body.description === null
          ? null
          : String(body.description).trim();

      if (description && description.length > 1000) {
        return NextResponse.json(
          {
            error:
              "Description cannot exceed 1000 characters",
          },
          { status: 400 }
        );
      }

      data.description = description || null;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive must be a boolean" },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    const offerFieldsSupplied =
      body.offerEnabled !== undefined ||
      body.discountPercent !== undefined ||
      body.offerPrice !== undefined ||
      body.offerStartsAt !== undefined ||
      body.offerEndsAt !== undefined ||
      body.offerMessage !== undefined;

    if (offerFieldsSupplied) {
      const offerEnabled =
        body.offerEnabled === undefined
          ? existingPlan.offerEnabled
          : Boolean(body.offerEnabled);

      const discountPercent =
        body.discountPercent === undefined
          ? existingPlan.discountPercent
          : body.discountPercent === null ||
              body.discountPercent === ""
            ? null
            : Number(body.discountPercent);

      const offerPrice =
        body.offerPrice === undefined
          ? existingPlan.offerPrice
          : body.offerPrice === null ||
              body.offerPrice === ""
            ? null
            : Number(body.offerPrice);

      const offerStartsAt =
        body.offerStartsAt === undefined
          ? existingPlan.offerStartsAt
          : parseDate(body.offerStartsAt);

      const offerEndsAt =
        body.offerEndsAt === undefined
          ? existingPlan.offerEndsAt
          : parseDate(body.offerEndsAt);

      const offerMessage =
        body.offerMessage === undefined
          ? existingPlan.offerMessage
          : body.offerMessage === null
            ? null
            : String(body.offerMessage).trim();

      if (
        discountPercent !== null &&
        (!Number.isInteger(discountPercent) ||
          discountPercent < 1 ||
          discountPercent > 99)
      ) {
        return NextResponse.json(
          {
            error:
              "Discount must be a whole number between 1 and 99",
          },
          { status: 400 }
        );
      }

      if (
        offerPrice !== null &&
        (!Number.isInteger(offerPrice) ||
          offerPrice <= 0 ||
          offerPrice > nextPrice)
      ) {
        return NextResponse.json(
          {
            error:
              "Offer price must be a positive integer no greater than the regular price",
          },
          { status: 400 }
        );
      }

      if (
        body.offerStartsAt !== undefined &&
        body.offerStartsAt &&
        !offerStartsAt
      ) {
        return NextResponse.json(
          { error: "Invalid offer start date" },
          { status: 400 }
        );
      }

      if (
        body.offerEndsAt !== undefined &&
        body.offerEndsAt &&
        !offerEndsAt
      ) {
        return NextResponse.json(
          { error: "Invalid offer end date" },
          { status: 400 }
        );
      }

      if (
        offerStartsAt &&
        offerEndsAt &&
        offerStartsAt > offerEndsAt
      ) {
        return NextResponse.json(
          {
            error:
              "Offer start date must be before the end date",
          },
          { status: 400 }
        );
      }

      if (offerMessage && offerMessage.length > 300) {
        return NextResponse.json(
          {
            error:
              "Offer message cannot exceed 300 characters",
          },
          { status: 400 }
        );
      }

      data.offerEnabled = offerEnabled;
      data.discountPercent = discountPercent;
      data.offerPrice = offerPrice;
      data.offerStartsAt = offerStartsAt;
      data.offerEndsAt = offerEndsAt;
      data.offerMessage = offerMessage || null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No changes supplied" },
        { status: 400 }
      );
    }

    const plan =
      await prisma.tutorSubscriptionPlan.update({
        where: { id },
        data,
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

    return NextResponse.json({
      plan: {
        ...plan,
        ...getEffectivePlanPrice(plan),
      },
    });
  } catch (error) {
    console.error(
      "Home Tuition plan PATCH error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update subscription plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const existingPlan =
      await prisma.tutorSubscriptionPlan.findUnique({
        where: { id },
      });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    const activeSubscriptions =
      await prisma.tutorSubscription.count({
        where: {
          planId: id,
          status: {
            in: ["PENDING", "ACTIVE"],
          },
        },
      });

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        {
          error:
            "This plan has active or pending subscriptions. Deactivate it instead.",
        },
        { status: 409 }
      );
    }

    const plan =
      await prisma.tutorSubscriptionPlan.update({
        where: { id },
        data: {
          isActive: false,
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

    return NextResponse.json({
      success: true,
      plan,
      message: "Subscription plan deactivated",
    });
  } catch (error) {
    console.error(
      "Home Tuition plan DELETE error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to deactivate subscription plan" },
      { status: 500 }
    );
  }
}