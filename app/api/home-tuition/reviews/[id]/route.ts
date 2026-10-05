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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.tutorReview.findUnique({
      where: { id },
      select: {
        id: true,
        reviewerId: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (existingReview.reviewerId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own review" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const comment = clean(body.comment);
    const rating = Number(body.rating);

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

    const review = await prisma.tutorReview.update({
      where: { id },
      data: {
        rating,
        comment,
        isPublished: true,
        isRemoved: false,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Home Tuition review PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.tutorReview.findUnique({
      where: { id },
      select: {
        id: true,
        reviewerId: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (existingReview.reviewerId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own review" },
        { status: 403 }
      );
    }

    await prisma.tutorReview.update({
      where: { id },
      data: {
        isRemoved: true,
        isPublished: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review removed successfully",
    });
  } catch (error) {
    console.error("Home Tuition review DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to remove review" },
      { status: 500 }
    );
  }
}