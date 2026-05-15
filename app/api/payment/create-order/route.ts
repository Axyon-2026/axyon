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
        { message: "Please login to buy product" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);
    const { productId } = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.sellerId === decoded.id) {
      return NextResponse.json(
        { message: "You cannot buy your own product" },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: product.price * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    const order = await prisma.order.create({
      data: {
        productId: product.id,
        buyerId: decoded.id,
        sellerId: product.sellerId,
        amount: product.price,
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      message: "Payment order created",
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: product.price,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log("PAYMENT ORDER ERROR:", error);

    return NextResponse.json(
      { message: "Payment order could not be created" },
      { status: 500 }
    );
  }
}