import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Admins cannot purchase products." },
        { status: 403 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { message: "Your account is suspended." },
        { status: 403 }
      );
    }

    if (user.studentVerificationStatus !== "APPROVED") {
      return NextResponse.json(
        {
          message:
            "You must complete student verification before purchasing products.",
        },
        { status: 403 }
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.status !== "AVAILABLE") {
      return NextResponse.json(
        { message: "Product is not available" },
        { status: 400 }
      );
    }

    if (product.sellerId === user.id) {
      return NextResponse.json(
        { message: "You cannot buy your own product" },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Number(product.price) * 100,
      currency: "INR",
      receipt: `axyon_${Date.now()}`,
    });

    const order = await prisma.order.create({
      data: {
        productId: product.id,
        buyerId: user.id,
        sellerId: product.sellerId,
        amount: Number(product.price),
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Payment order created successfully",
      razorpayOrder,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log("CREATE PAYMENT ORDER ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create payment order" },
      { status: 500 }
    );
  }
}