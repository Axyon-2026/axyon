import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyToken(token);

    const {
      productId,
      buyerId,
      finalPrice,
      paymentMethod,
    } = await req.json();

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      product.sellerId !==
      decoded.id
    ) {
      return NextResponse.json(
        {
          message:
            "Only seller can create a deal",
        },
        {
          status: 403,
        }
      );
    }

    const invoiceId =
      `AXY-${Date.now()}`;

    const deal =
      await prisma.deal.create({
        data: {
          productId,
          buyerId,
          sellerId: decoded.id,

          originalPrice:
            product.price,

          finalPrice,

          paymentMethod,

          invoiceId,
        },
      });

    return NextResponse.json({
      message:
        "Deal created successfully",

      deal,
    });

  } catch (error) {

    console.log(
      "CREATE DEAL ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}