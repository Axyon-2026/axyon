import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Tutor ID is required" },
        { status: 400 }
      );
    }

    const now = new Date();

    const tutor = await prisma.tutorProfile.findFirst({
      where: {
        id,
        status: "ACTIVE",

        user: {
          marketplaceType: "CAMPUS",
          isSuspended: false,
          studentVerified: true,
        },

        subscriptions: {
          some: {
            status: "ACTIVE",
            startsAt: {
              lte: now,
            },
            expiresAt: {
              gt: now,
            },
          },
        },
      },

      select: {
        id: true,
        displayName: true,
        photoUrl: true,
        institution: true,
        college: true,
        bio: true,
        subjects: true,
        classes: true,
        teachingMode: true,
        location: true,
        maxTravelDistance: true,
        availability: true,
        languages: true,
        hourlyFee: true,
        demoAvailable: true,
        demoDetails: true,
        publicPhone: true,
        phoneVisibilityConfirmed: true,
        publishedAt: true,

        reviews: {
          where: {
            isPublished: true,
            isRemoved: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
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
        },
      },
    });

    if (!tutor) {
      return NextResponse.json(
        { error: "Tutor not found or unavailable" },
        { status: 404 }
      );
    }

    const ratings = tutor.reviews.map(
      (review) => review.rating
    );

    const reviewCount = ratings.length;

    const averageRating =
      reviewCount > 0
        ? Number(
            (
              ratings.reduce(
                (sum, rating) => sum + rating,
                0
              ) / reviewCount
            ).toFixed(1)
          )
        : null;

    return NextResponse.json({
      tutor: {
        id: tutor.id,
        displayName: tutor.displayName,
        photoUrl: tutor.photoUrl,
        institution: tutor.institution,
        college: tutor.college,
        bio: tutor.bio,
        subjects: tutor.subjects,
        classes: tutor.classes,
        teachingMode: tutor.teachingMode,
        location: tutor.location,
        maxTravelDistance: tutor.maxTravelDistance,
        availability: tutor.availability,
        languages: tutor.languages,
        hourlyFee: tutor.hourlyFee,
        demoAvailable: tutor.demoAvailable,
        demoDetails: tutor.demoDetails,
        publishedAt: tutor.publishedAt,

        rating: averageRating,
        reviewCount,

        contact: {
          callAvailable:
            tutor.phoneVisibilityConfirmed === true &&
            Boolean(tutor.publicPhone),

          whatsappAvailable:
            tutor.phoneVisibilityConfirmed === true &&
            Boolean(tutor.publicPhone),
        },

        reviews: tutor.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          reviewerName: review.reviewer.name,
        })),
      },
    });
  } catch (error) {
    console.error("Home Tuition tutor detail GET error:", error);

    return NextResponse.json(
      { error: "Failed to load tutor" },
      { status: 500 }
    );
  }
}