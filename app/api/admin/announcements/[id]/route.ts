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

const allowedStyles = [
  "AURORA",
  "MIDNIGHT",
  "SUNSET",
  "MINIMAL",
];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.siteAnnouncement.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      eyebrow?: string | null;
      title?: string;
      description?: string | null;
      ctaText?: string | null;
      ctaHref?: string | null;
      imageUrl?: string | null;
      style?: string;
      isActive?: boolean;
      startsAt?: Date | null;
      endsAt?: Date | null;
    } = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();

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

      data.title = title;
    }

    if (body.eyebrow !== undefined) {
      data.eyebrow =
        body.eyebrow === null
          ? null
          : String(body.eyebrow).trim() || null;
    }

    if (body.description !== undefined) {
      data.description =
        body.description === null
          ? null
          : String(body.description).trim() || null;
    }

    if (body.ctaText !== undefined) {
      data.ctaText =
        body.ctaText === null
          ? null
          : String(body.ctaText).trim() || null;
    }

    if (body.ctaHref !== undefined) {
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

      data.ctaHref = ctaHref;
    }

    const finalCtaText =
      data.ctaText !== undefined
        ? data.ctaText
        : existing.ctaText;

    const finalCtaHref =
      data.ctaHref !== undefined
        ? data.ctaHref
        : existing.ctaHref;

    if (finalCtaText && !finalCtaHref) {
      return NextResponse.json(
        {
          error:
            "CTA destination is required when CTA text is provided",
        },
        { status: 400 }
      );
    }

    if (body.imageUrl !== undefined) {
      data.imageUrl =
        body.imageUrl === null
          ? null
          : String(body.imageUrl).trim() || null;
    }

    if (body.style !== undefined) {
      const style = String(body.style)
        .trim()
        .toUpperCase();

      if (!allowedStyles.includes(style)) {
        return NextResponse.json(
          { error: "Invalid announcement style" },
          { status: 400 }
        );
      }

      data.style = style;
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    if (body.startsAt !== undefined) {
      const startsAt = parseDate(body.startsAt);

      if (body.startsAt && !startsAt) {
        return NextResponse.json(
          { error: "Invalid start date" },
          { status: 400 }
        );
      }

      data.startsAt = startsAt;
    }

    if (body.endsAt !== undefined) {
      const endsAt = parseDate(body.endsAt);

      if (body.endsAt && !endsAt) {
        return NextResponse.json(
          { error: "Invalid end date" },
          { status: 400 }
        );
      }

      data.endsAt = endsAt;
    }

    const finalStartsAt =
      data.startsAt !== undefined
        ? data.startsAt
        : existing.startsAt;

    const finalEndsAt =
      data.endsAt !== undefined
        ? data.endsAt
        : existing.endsAt;

    if (
      finalStartsAt &&
      finalEndsAt &&
      finalEndsAt < finalStartsAt
    ) {
      return NextResponse.json(
        { error: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    const announcement =
      await prisma.siteAnnouncement.update({
        where: { id },
        data,
      });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error(
      "Admin announcement PATCH error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.siteAnnouncement.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    await prisma.siteAnnouncement.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Admin announcement DELETE error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}