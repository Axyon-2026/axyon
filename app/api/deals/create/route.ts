import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const { productId, buyerId, finalPrice, paymentMethod } = await req.json();  

    const buyer = await prisma.user.findUnique({
  where: {
    id: buyerId,
  },
  select: {
    id: true,
    studentVerified: true,
    isSuspended: true,
  },
});

if (!buyer) {
  return NextResponse.json(
    {
      message: "Buyer not found.",
    },
    {
      status: 404,
    }
  );
}

if (!buyer.studentVerified || buyer.isSuspended) {
  return NextResponse.json(
    {
      message: "Buyer is not eligible to complete deals.",
    },
    {
      status: 403,
    }
  );
}

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
        },
      );
    }
    if (product.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message: "This product is no longer available.",
        },
        {
          status: 400,
        },
      );
    }

    if (product.sellerId !== decoded.id) {
      return NextResponse.json(
        {
          message: "Only seller can create a deal",
        },
        {
          status: 403,
        },
      );
    }
    if (buyerId === decoded.id) {
      return NextResponse.json(
        {
          message: "You cannot buy your own product.",
        },
        {
          status: 400,
        },
      );
    }

    if (!Number(finalPrice) || Number(finalPrice) <= 0) {
      return NextResponse.json(
        {
          message: "Invalid final price.",
        },
        {
          status: 400,
        },
      );
    }

    const existingDeal = await prisma.deal.findFirst({
  where: {
    productId,
    status: {
      in: ["PENDING", "COMPLETED"],
    },
  },
});

    if (existingDeal) {
      return NextResponse.json(
        {
          message: "A pending deal already exists.",
        },
        {
          status: 400,
        },
      );
    }

    const invoiceId = `AXY-${Date.now()}`;

    const deal = await prisma.deal.create({
      data: {
        productId,

        buyerId,

        sellerId: decoded.id,

        originalPrice: product.price,

        finalPrice: Number(finalPrice),

        paymentMethod,

        invoiceId,

        sellerConfirmed: true,

        buyerConfirmed: false,

        status: "PENDING",
      },
    });
    await prisma.notification.create({
      data: {
        userId: buyerId,
        title: "Deal Request",
        message: `${seller?.name} wants to complete this purchase.`,
        type: "DEAL_CONFIRMATION",
        link: `/chat`,
      },
    });

    return NextResponse.json({
      success: true,
      deal,
    });
  } catch (error) {
    console.log("CREATE DEAL ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
