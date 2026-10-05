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

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        { message: "Invalid session." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Admins cannot use marketplace chat." },
        { status: 403 }
      );
    }

    if (user.marketplaceType !== "SCHOOL") {
      return NextResponse.json(
        { message: "School Marketplace access required." },
        { status: 403 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { message: "Your account has been suspended." },
        { status: 403 }
      );
    }

    if (
      user.schoolVerificationStatus !== "APPROVED" ||
      !user.schoolVerified
    ) {
      return NextResponse.json(
        { message: "Your School account is not approved." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const productId =
      typeof body?.productId === "string"
        ? body.productId.trim()
        : "";

    if (!productId) {
      return NextResponse.json(
        { message: "Product is required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        marketplaceType: "SCHOOL",
        status: "AVAILABLE",
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          message:
            "School Marketplace product not found.",
        },
        { status: 404 }
      );
    }

    if (product.sellerId === user.id) {
      return NextResponse.json(
        {
          message: "You cannot chat with yourself.",
        },
        { status: 400 }
      );
    }

    let conversation =
      await prisma.conversation.findFirst({
        where: {
          buyerId: user.id,
          sellerId: product.sellerId,
          productId: product.id,
          roomId: null,
          marketplaceType: "SCHOOL",
          isArchived: false,
        },
      });

    if (!conversation) {
      conversation =
        await prisma.conversation.create({
          data: {
            buyerId: user.id,
            sellerId: product.sellerId,
            productId: product.id,
            roomId: null,
            marketplaceType: "SCHOOL",
          },
        });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error(
      "SCHOOL CHAT OPEN ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to open School chat.",
      },
      { status: 500 }
    );
  }
}