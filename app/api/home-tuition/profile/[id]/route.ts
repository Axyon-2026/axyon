import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const HOME_TUITION_TERMS_VERSION = "1.0";
const HOME_TUITION_SAFETY_VERSION = "1.0";

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
        studentVerified: true,
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

export async function PATCH(
  request: Request,
  context: RouteContext
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

    if (!user.studentVerified) {
      return NextResponse.json(
        { error: "Campus student verification is required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const profile = await prisma.tutorProfile.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        termsAcceptedAt: true,
        termsVersion: true,
        safetyAcceptedAt: true,
        safetyVersion: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    if (profile.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to modify this profile" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const action = String(body.action ?? "")
      .trim()
      .toUpperCase();

    if (action === "PAUSE") {
      if (profile.status === "DELETED") {
        return NextResponse.json(
          { error: "Deleted tutor profiles cannot be paused" },
          { status: 400 }
        );
      }

      const updated = await prisma.tutorProfile.update({
        where: { id },
        data: {
          status: "PAUSED",
        },
        select: {
          id: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        profile: updated,
      });
    }

    if (action === "UNPUBLISH") {
      if (profile.status === "DELETED") {
        return NextResponse.json(
          { error: "Deleted tutor profiles cannot be unpublished" },
          { status: 400 }
        );
      }

      const updated = await prisma.tutorProfile.update({
        where: { id },
        data: {
          status: "PAUSED",
        },
        select: {
          id: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        profile: updated,
      });
    }

    if (action === "DELETE") {
      if (profile.status === "DELETED") {
        return NextResponse.json({
          success: true,
          message: "Tutor profile is already deleted",
        });
      }

      // Soft delete only. Subscription/payment records remain intact.
      const updated = await prisma.tutorProfile.update({
        where: { id },
        data: {
          status: "DELETED",
        },
        select: {
          id: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        profile: updated,
        message:
          "Tutor profile removed from the public directory. Subscription and payment records were preserved.",
      });
    }

    if (action === "REPUBLISH") {
      const activeSubscription =
        await prisma.tutorSubscription.findFirst({
          where: {
            tutorProfileId: id,
            status: "ACTIVE",
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            expiresAt: "desc",
          },
          select: {
            id: true,
            expiresAt: true,
          },
        });

      if (!activeSubscription) {
        return NextResponse.json(
          {
            error:
              "An active subscription is required before republishing your tutor profile",
          },
          { status: 403 }
        );
      }

      const hasCurrentTermsAcceptance =
        Boolean(profile.termsAcceptedAt) &&
        profile.termsVersion === HOME_TUITION_TERMS_VERSION;

      const hasCurrentSafetyAcceptance =
        Boolean(profile.safetyAcceptedAt) &&
        profile.safetyVersion === HOME_TUITION_SAFETY_VERSION;

      if (!hasCurrentTermsAcceptance || !hasCurrentSafetyAcceptance) {
        return NextResponse.json(
          {
            error:
              "Current Home Tuition Terms and Safety requirements must be accepted before republishing your tutor profile",
          },
          { status: 403 }
        );
      }

      const updated = await prisma.tutorProfile.update({
        where: { id },
        data: {
          status: "ACTIVE",
        },
        select: {
          id: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        profile: updated,
      });
    }

    return NextResponse.json(
      {
        error:
          "Invalid action. Use PAUSE, UNPUBLISH, DELETE, or REPUBLISH.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Home Tuition profile action error:", error);

    return NextResponse.json(
      { error: "Failed to update tutor profile" },
      { status: 500 }
    );
  }
}