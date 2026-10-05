import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const announcement = await prisma.siteAnnouncement.findFirst({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startsAt: null },
              { startsAt: { lte: now } },
            ],
          },
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { startsAt: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        eyebrow: true,
        title: true,
        description: true,
        ctaText: true,
        ctaHref: true,
        imageUrl: true,
        style: true,
      },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Announcement fetch error:", error);

    return NextResponse.json(
      { announcement: null },
      { status: 500 }
    );
  }
}