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
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyToken(token);

    const orders =
      await prisma.order.findMany({
        where: {
          buyerId: decoded.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      orders,
    });

  } catch (error) {

    console.log(
      "MY ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load orders",
      },
      {
        status: 500,
      }
    );

  }
}