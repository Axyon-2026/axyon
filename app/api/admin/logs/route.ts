import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const logs = await prisma.adminLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.log("ADMIN LOGS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load admin logs" },
      { status: 500 }
    );
  }
}