import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";

import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tutors = await prisma.tutorProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userId: true,
        displayName: true,
        photoUrl: true,
        institution: true,
        college: true,
        subjects: true,
        classes: true,
        teachingMode: true,
        location: true,
        hourlyFee: true,
        demoAvailable: true,
        publicPhone: true,
        phoneVisibilityConfirmed: true,
        status: true,
        termsAcceptedAt: true,
        termsVersion: true,
        safetyAcceptedAt: true,
        safetyVersion: true,
        publishedAt: true,
        pausedAt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            marketplaceType: true,
            isSuspended: true,
            studentVerified: true,
            studentVerificationStatus: true,
          },
        },
        subscriptions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
          select: {
            id: true,
            purchasedPlanType: true,
            purchasedPrice: true,
            durationDays: true,
            status: true,
            startsAt: true,
            expiresAt: true,
            activatedAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json({
      tutors,
      counts: {
        total: tutors.length,
        draft: tutors.filter((t) => t.status === "DRAFT").length,
        active: tutors.filter((t) => t.status === "ACTIVE").length,
        paused: tutors.filter((t) => t.status === "PAUSED").length,
        suspended: tutors.filter((t) => t.status === "SUSPENDED").length,
        deleted: tutors.filter((t) => t.status === "DELETED").length,
      },
    });
  } catch (error) {
    console.error(
      "HOME_TUITION_ADMIN_TUTORS_GET_ERROR",
      error
    );

    return NextResponse.json(
      { error: "Unable to load tutor profiles." },
      { status: 500 }
    );
  }
}
