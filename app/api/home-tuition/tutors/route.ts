import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const subject = searchParams.get("subject")?.trim() || "";
    const classLevel = searchParams.get("class")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const teachingMode = searchParams.get("teachingMode")?.trim() || "";
    const availability = searchParams.get("availability")?.trim() || "";
    const maxFeeParam = searchParams.get("maxFee");

    const maxFee = maxFeeParam
      ? Number(maxFeeParam)
      : undefined;

    const now = new Date();

    const tutors = await prisma.tutorProfile.findMany({
      where: {
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

        ...(search
          ? {
              OR: [
                {
                  displayName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  institution: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  college: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  bio: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(subject
          ? {
              subjects: {
                has: subject,
              },
            }
          : {}),

        ...(classLevel
          ? {
              classes: {
                has: classLevel,
              },
            }
          : {}),

        ...(location
          ? {
              location: {
                contains: location,
                mode: "insensitive",
              },
            }
          : {}),

        ...(teachingMode &&
        ["ONLINE", "OFFLINE", "BOTH"].includes(teachingMode)
          ? {
              teachingMode: teachingMode as
                | "ONLINE"
                | "OFFLINE"
                | "BOTH",
            }
          : {}),

        ...(availability
          ? {
              availability: {
                contains: availability,
                mode: "insensitive",
              },
            }
          : {}),

        ...(typeof maxFee === "number" &&
        Number.isFinite(maxFee) &&
        maxFee >= 0
          ? {
              hourlyFee: {
                lte: Math.floor(maxFee),
              },
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 100,

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
          select: {
            rating: true,
          },
        },
      },
    });

    const result = tutors.map((tutor) => {
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

      return {
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
      };
    });

    return NextResponse.json({
      tutors: result,
    });
  } catch (error) {
    console.error("Home Tuition tutors GET error:", error);

    return NextResponse.json(
      { error: "Failed to load tutors" },
      { status: 500 }
    );
  }
}