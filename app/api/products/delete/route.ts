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
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    const { productId } = await req.json();

    const product = await prisma.product.findUnique({
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

    if (product.sellerId !== decoded.id) {
      return NextResponse.json(
        {
          message: "You can only remove your own listing.",
        },
        {
          status: 403,
        }
      );
    }

    if (product.status === "SOLD") {
      return NextResponse.json(
        {
          message: "Sold products cannot be removed.",
        },
        {
          status: 400,
        }
      );
    }

    if (product.status === "REMOVED") {
      return NextResponse.json(
        {
          message: "Listing already removed.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.conversation.updateMany({
  where: {
    productId: product.id,
  },
  data: {
    isArchived: true,
  },
});

const updated = await prisma.product.update({
  where: {
    id: product.id,
  },
  data: {
    status: "REMOVED",
  },
});

return NextResponse.json({
  success: true,
  product: updated,
});

  } catch (error) {
    console.log("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}