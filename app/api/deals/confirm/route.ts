import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { completeDeal } from "@/lib/deals/completeDeal";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    const { dealId } = await req.json();

    const deal = await prisma.deal.findUnique({
      where: {
        id: dealId,
      },
    });

    if (!deal) {
      return NextResponse.json(
        {
          message: "Deal not found",
        },
        {
          status: 404,
        },
      );
    }

    if (deal.buyerConfirmed) {
      return NextResponse.json(
        {
          message: "This deal has already been confirmed.",
        },
        {
          status: 400,
        },
      );
    }

    if (deal.status === "COMPLETED") {
      return NextResponse.json(
        {
          message: "This deal has already been completed.",
        },
        {
          status: 400,
        },
      );
    }

    if (deal.buyerId !== decoded.id) {
      return NextResponse.json(
        {
          message: "Only the buyer can confirm this deal.",
        },
        {
          status: 403,
        },
      );
    }

    const updatedDeal = await prisma.deal.update({
      where: {
        id: deal.id,
      },
      data: {
        buyerConfirmed: true,
      },
    });
    await prisma.notification.create({
      data: {
        userId: deal.sellerId,
        title: "Buyer Confirmed",
        message: "The buyer has confirmed the deal.",
        type: "DEAL_CONFIRMATION",
        link: "/chat",
      },
    });
    if (updatedDeal.sellerConfirmed && updatedDeal.buyerConfirmed) {
      const result = await completeDeal({
        dealId: updatedDeal.id,
        completedBy: decoded.id,
      });

      return NextResponse.json({
        success: true,
        completed: true,
        result,
      });
    }

    return NextResponse.json({
      success: true,
      completed: false,
      message: "Waiting for seller confirmation.",
    });
  } catch (error) {
    console.log("CONFIRM DEAL ERROR:", error);

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
