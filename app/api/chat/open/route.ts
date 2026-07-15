import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Product is required." },
        { status: 400 }
      );
    }

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

    if (product.sellerId === decoded.id) {
      return NextResponse.json(
        { message: "You cannot chat with yourself." },
        { status: 400 }
      );
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        buyerId: decoded.id,
        sellerId: product.sellerId,
        productId: product.id,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          buyerId: decoded.id,
          sellerId: product.sellerId,
          productId: product.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
    });

  } catch (error) {
    console.log("CHAT OPEN ERROR:", error);

    return NextResponse.json(
      { message: "Failed to open chat." },
      { status: 500 }
    );
  }
}