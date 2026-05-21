import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")
        ?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyToken(token);

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: decoded.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 50,
      });

    return NextResponse.json({
      notifications,
    });

  } catch (error) {

    console.log(
      "NOTIFICATIONS FETCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load notifications",
      },
      { status: 500 }
    );
  }
}