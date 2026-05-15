import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CANCELLATION_WINDOW_MINUTES = 120;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);
    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { message: "Please provide a valid cancellation reason" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.buyerId !== decoded.id) {
      return NextResponse.json(
        { message: "You can cancel only your own order" },
        { status: 403 }
      );
    }

    if (order.paymentStatus === "SUCCESS") {
      return NextResponse.json(
        {
          message:
            "Paid orders cannot be cancelled directly. Please contact support for refund or dispute.",
        },
        { status: 400 }
      );
    }

    if (order.paymentStatus === "CANCELLED") {
      return NextResponse.json(
        { message: "Order is already cancelled" },
        { status: 400 }
      );
    }

    const createdAt = new Date(order.createdAt).getTime();
    const now = Date.now();
    const minutesPassed = (now - createdAt) / (1000 * 60);

    if (minutesPassed > CANCELLATION_WINDOW_MINUTES) {
      return NextResponse.json(
        {
          message:
            "Cancellation window expired. Please contact seller or support.",
        },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "CANCELLED",
        cancelReason: reason.trim(),
        cancelledAt: new Date(),
        cancelledBy: decoded.id,
      },
    });

    return NextResponse.json({
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.log("CANCEL ORDER ERROR:", error);

    return NextResponse.json(
      { message: "Failed to cancel order" },
      { status: 500 }
    );
  }
}