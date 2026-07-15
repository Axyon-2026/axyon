import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    const seller = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        name: true,
      },
    });

    const { productId, buyerId } = await req.json();

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    if (product.sellerId !== decoded.id) {
      return NextResponse.json(
        { message: "Only the seller can complete the deal." },
        { status: 403 }
      );
    }

    if (product.status !== "AVAILABLE") {
      return NextResponse.json(
        { message: "Product is already sold." },
        { status: 400 }
      );
    }

    const invoiceId = `AXY-${Date.now()}`;

    const deal = await prisma.deal.create({
      data: {
        productId,
        buyerId,
        sellerId: decoded.id,

        originalPrice: product.price,
        finalPrice: product.price,

        paymentMethod: "OFFLINE",

        invoiceId,

        sellerConfirmed: true,
        buyerConfirmed: true,

        status: "COMPLETED",
      },
    });

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: "SOLD",
        buyerId,
        soldAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: buyerId,
        title: "Purchase Completed",
        message: `${seller?.name} has completed your purchase.`,
        type: "DEAL_COMPLETED",
        link: "/my-orders",
      },
    });

    return NextResponse.json({
      success: true,
      deal,
    });

  } catch (error) {
    console.log("COMPLETE DEAL ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}