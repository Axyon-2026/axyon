import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { message: "Payment verification data missing" },
        { status: 400 }
      );
    }

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET!
      )
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    if (existingOrder.paymentStatus === "SUCCESS") {
      return NextResponse.json({
        message: "Payment already verified",
        order: existingOrder,
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: existingOrder.productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (existingProduct.status === "REMOVED") {
      return NextResponse.json(
        { message: "Removed products cannot be sold" },
        { status: 400 }
      );
    }

    if (existingProduct.status === "SOLD") {
      return NextResponse.json(
        { message: "Product is already sold" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "SUCCESS",
      },
    });

    const product = await prisma.product.update({
      where: {
        id: order.productId,
      },
      data: {
        status: "SOLD",
      },
      include: {
        seller: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const buyer = await prisma.user.findUnique({
      where: {
        id: order.buyerId,
      },
      select: {
        name: true,
        email: true,
      },
    });

    await createNotification({
      userId: order.buyerId,
      title: "Payment Successful",
      message: `Your payment for "${product.title}" was completed successfully.`,
      type: "ORDER_SUCCESS",
      link: "/my-orders",
    });

    await createNotification({
      userId: order.sellerId,
      title: "Product Sold",
      message: `"${product.title}" has been purchased successfully.`,
      type: "PRODUCT_SOLD",
      link: `/product/${product.id}`,
    });

    if (buyer?.email) {
      await resend.emails.send({
        from: "Axyon <noreply@axyon.in>",
        to: buyer.email,
        subject: "Axyon Payment Receipt",
        html: `
          <div style="font-family: Arial, sans-serif; color: #111827;">
            <h2>Payment Receipt</h2>

            <p>Hello ${buyer.name || "Student"},</p>

            <p>Your payment on Axyon was successful.</p>

            <div style="margin-top: 20px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 10px;">
              <p><strong>Product:</strong> ${product.title}</p>
              <p><strong>Amount:</strong> ₹${order.amount}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
              <p><strong>Razorpay Payment ID:</strong> ${razorpay_payment_id}</p>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Seller:</strong> ${product.seller?.name || "Seller"}</p>
              <p><strong>Seller Email:</strong> ${product.seller?.email || "Not available"}</p>
            </div>

            <p style="margin-top: 20px;">
              Please keep this receipt for your records.
            </p>

            <p>
              Team Axyon
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR:", error);

    return NextResponse.json(
      { message: "Payment verification failed" },
      { status: 500 }
    );
  }
}