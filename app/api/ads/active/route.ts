import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ads = await prisma.adBanner.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.log("ACTIVE ADS FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load active ads" },
      { status: 500 }
    );
  }
}