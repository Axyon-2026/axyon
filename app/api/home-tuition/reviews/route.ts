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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorProfileId = clean(searchParams.get("tutorProfileId"));

    if (!tutorProfileId) {
      return NextResponse.json(
        { error: "Tutor profile ID is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.tutorReview.findMany({
      where: {
        tutorProfileId,
        isPublished: true,
        isRemoved: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      reviews: reviews.map((item) => ({
        id: item.id,
        rating: item.rating,
        comment: item.comment,
        createdAt: item.createdAt,
        reviewerName: item.reviewer.name,
      })),
    });
  } catch (error) {
    console.error("Home Tuition reviews GET error:", error);

    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

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

    const tutorProfileId = clean(body.tutorProfileId);
    const comment = clean(body.comment);
    const rating = Number(body.rating);

    if (!tutorProfileId) {
      return NextResponse.json(
        { error: "Tutor profile ID is required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!comment || comment.length < 5) {
      return NextResponse.json(
        { error: "Review must contain at least 5 characters" },
        { status: 400 }
      );
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        { error: "Review cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    const tutor = await prisma.tutorProfile.findFirst({
      where: {
        id: tutorProfileId,
        status: {
          not: "DELETED",
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!tutor) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    if (tutor.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot review your own tutor profile" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.tutorReview.findUnique({
      where: {
        tutorProfileId_reviewerId: {
          tutorProfileId,
          reviewerId: user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this tutor" },
        { status: 409 }
      );
    }

    const review = await prisma.tutorReview.create({
      data: {
        tutorProfileId,
        reviewerId: user.id,
        rating,
        comment,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          reviewerName: review.reviewer.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Home Tuition review POST error:", error);

    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}