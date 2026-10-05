import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getCampusUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        marketplaceType: true,
        isSuspended: true,
      },
    });

    if (!user || user.marketplaceType !== "CAMPUS") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const ALLOWED_TARGET_TYPES = [
  "TUTOR",
  "TUTOR_REVIEW",
];

const MAX_DETAILS_LENGTH = 2000;

export async function POST(request: Request) {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account is suspended" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const targetType = clean(body.targetType).toUpperCase();
    const targetId = clean(body.targetId);
    const reason = clean(body.reason);
    const details = clean(body.details);

    if (!ALLOWED_TARGET_TYPES.includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid report target" },
        { status: 400 }
      );
    }

    if (!targetId) {
      return NextResponse.json(
        { error: "Target ID is required" },
        { status: 400 }
      );
    }

    if (!reason || reason.length < 3) {
      return NextResponse.json(
        { error: "Please provide a report reason" },
        { status: 400 }
      );
    }

    if (reason.length > 200) {
      return NextResponse.json(
        { error: "Report reason is too long" },
        { status: 400 }
      );
    }

    if (details.length > MAX_DETAILS_LENGTH) {
      return NextResponse.json(
        { error: "Report details are too long" },
        { status: 400 }
      );
    }

    if (targetType === "TUTOR") {
      const tutor = await prisma.tutorProfile.findFirst({
        where: {
          id: targetId,
          status: {
            not: "DELETED",
          },
        },
        select: {
          id: true,
        },
      });

      if (!tutor) {
        return NextResponse.json(
          { error: "Tutor profile not found" },
          { status: 404 }
        );
      }
    }

    if (targetType === "TUTOR_REVIEW") {
      const review = await prisma.tutorReview.findFirst({
        where: {
          id: targetId,
          isRemoved: false,
        },
        select: {
          id: true,
        },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 }
        );
      }
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        targetType,
        targetId,
        status: "OPEN",
      },
      select: {
        id: true,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You already have an open report for this item" },
        { status: 409 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType,
        targetId,
        reason,
        details: details || null,
        status: "OPEN",
      },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Home Tuition report POST error:", error);

    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}