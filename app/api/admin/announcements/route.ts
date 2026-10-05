import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function parseDate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function validateHref(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const href = String(value).trim();

  if (!href) {
    return null;
  }

  if (
    href.startsWith("/") ||
    href.startsWith("https://") ||
    href.startsWith("http://")
  ) {
    return href;
  }

  return null;
}

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const announcements = await prisma.siteAnnouncement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Admin announcements GET error:", error);

    return NextResponse.json(
      { error: "Failed to load announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = String(body.title ?? "").trim();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (title.length > 160) {
      return NextResponse.json(
        { error: "Title must be 160 characters or less" },
        { status: 400 }
      );
    }

    const description =
      body.description === null || body.description === undefined
        ? null
        : String(body.description).trim() || null;

    const eyebrow =
      body.eyebrow === null || body.eyebrow === undefined
        ? null
        : String(body.eyebrow).trim() || null;

    const ctaText =
      body.ctaText === null || body.ctaText === undefined
        ? null
        : String(body.ctaText).trim() || null;

    const ctaHref = validateHref(body.ctaHref);

    if (body.ctaHref && !ctaHref) {
      return NextResponse.json(
        {
          error:
            "CTA destination must be a relative path or a valid http/https URL",
        },
        { status: 400 }
      );
    }

    if (ctaText && !ctaHref) {
      return NextResponse.json(
        {
          error:
            "CTA destination is required when CTA text is provided",
        },
        { status: 400 }
      );
    }

    const startsAt = parseDate(body.startsAt);
    const endsAt = parseDate(body.endsAt);

    if (body.startsAt && !startsAt) {
      return NextResponse.json(
        { error: "Invalid start date" },
        { status: 400 }
      );
    }

    if (body.endsAt && !endsAt) {
      return NextResponse.json(
        { error: "Invalid end date" },
        { status: 400 }
      );
    }

    if (startsAt && endsAt && endsAt < startsAt) {
      return NextResponse.json(
        { error: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    const style = String(body.style ?? "AURORA")
      .trim()
      .toUpperCase();

    const allowedStyles = [
      "AURORA",
      "MIDNIGHT",
      "SUNSET",
      "MINIMAL",
    ];

    if (!allowedStyles.includes(style)) {
      return NextResponse.json(
        { error: "Invalid announcement style" },
        { status: 400 }
      );
    }

    const imageUrl =
      body.imageUrl === null || body.imageUrl === undefined
        ? null
        : String(body.imageUrl).trim() || null;

    const announcement = await prisma.siteAnnouncement.create({
      data: {
        eyebrow,
        title,
        description,
        ctaText,
        ctaHref,
        imageUrl,
        style,
        isActive: Boolean(body.isActive),
        startsAt,
        endsAt,
      },
    });

    return NextResponse.json(
      { announcement },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin announcements POST error:", error);

    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}