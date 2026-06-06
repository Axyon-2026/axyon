import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const ad = await prisma.adBanner.findUnique({
      where: {
        id,
      },
    });

    if (!ad || !ad.isActive) {
      return NextResponse.json(
        { message: "Ad not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ad,
    });

  } catch (error) {

    console.log(
      "AD DETAILS FETCH ERROR:",
      error
    );

    return NextResponse.json(
      { message: "Failed to load ad" },
      { status: 500 }
    );
  }
}