import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
    const subscriptionId = String(body.subscriptionId ?? "").trim();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const subscription = await prisma.tutorSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId: user.id,
        status: "PENDING",
      },
      select: {
        id: true,
        userId: true,
        tutorProfileId: true,
        planId: true,
        purchasedPrice: true,
        purchasedPlanType: true,
        durationDays: true,
        razorpayOrderId: true,
        plan: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Pending subscription not found" },
        { status: 404 }
      );
    }

    if (!subscription.plan.isActive) {
      return NextResponse.json(
        { error: "This subscription plan is no longer active" },
        { status: 409 }
      );
    }

    if (subscription.razorpayOrderId) {
      return NextResponse.json({
        orderId: subscription.razorpayOrderId,
        subscriptionId: subscription.id,
        amount: subscription.purchasedPrice,
        currency: "INR",
        planName: subscription.plan.name,
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials are not configured");

      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Amount comes exclusively from the server-side subscription snapshot.
    const amountInPaise = subscription.purchasedPrice * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `tutor_${subscription.id}`,
      notes: {
        subscriptionId: subscription.id,
        tutorProfileId: subscription.tutorProfileId,
        userId: subscription.userId,
        planId: subscription.planId,
        planType: subscription.purchasedPlanType,
      },
    });

    await prisma.tutorSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        razorpayOrderId: order.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      subscriptionId: subscription.id,
      amount: subscription.purchasedPrice,
      currency: "INR",
      planName: subscription.plan.name,
      keyId,
    });
  } catch (error) {
    console.error(
      "Home Tuition Razorpay order creation error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}