import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ad = await prisma.adBanner.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.log("ACTIVE AD FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load active ad" },
      { status: 500 }
    );
  }
}