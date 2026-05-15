import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message:
            "Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any =
      verifyToken(token);

    const user =
      await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },

        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          createdAt: true,
        },
      });

    const listedProducts =
      await prisma.product.findMany({
        where: {
          sellerId: decoded.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const purchasedOrders =
      await prisma.order.findMany({
        where: {
          buyerId: decoded.id,
          paymentStatus: "SUCCESS",
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const soldOrders =
      await prisma.order.findMany({
        where: {
          sellerId: decoded.id,
          paymentStatus: "SUCCESS",
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const conversations =
      await prisma.conversation.findMany({
        where: {
          OR: [
            {
              buyerId:
                decoded.id,
            },
            {
              sellerId:
                decoded.id,
            },
          ],
        },

        include: {
          messages: true,
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    return NextResponse.json({
      user,
      listedProducts,
      purchasedOrders,
      soldOrders,
      conversations,
    });

  } catch (error) {

    console.log(
      "DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load dashboard",
      },
      {
        status: 500,
      }
    );

  }
}