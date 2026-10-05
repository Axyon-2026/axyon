import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, logAdminAction } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
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
    const body = await request.json();

    const action = body?.action;

    if (action !== "SUSPEND" && action !== "UNSUSPEND") {
      return NextResponse.json(
        {
          error:
            "Invalid action. Use SUSPEND or UNSUSPEND.",
        },
        { status: 400 }
      );
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        displayName: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!tutor) {
      return NextResponse.json(
        { error: "Tutor profile not found." },
        { status: 404 }
      );
    }

    if (
      tutor.deletedAt ||
      tutor.status === "DELETED"
    ) {
      return NextResponse.json(
        {
          error:
            "Deleted tutor profiles cannot be restored here.",
        },
        { status: 400 }
      );
    }

    if (action === "SUSPEND") {
      const now = new Date();

      const updatedTutor = await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.tutorProfile.update({
              where: { id },
              data: {
                status: "SUSPENDED",
                pausedAt: now,
              },
              select: {
                id: true,
                status: true,
                pausedAt: true,
              },
            });

          await tx.tutorSubscription.updateMany({
            where: {
              tutorProfileId: id,
              status: "PENDING",
            },
            data: {
              status: "CANCELLED",
              cancelledAt: now,
            },
          });

          return updated;
        }
      );

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "HOME_TUITION_TUTOR_SUSPENDED",
        targetType: "TutorProfile",
        targetId: id,
        details: `Tutor ${tutor.displayName} suspended by admin.`,
      });

      return NextResponse.json({
        success: true,
        action,
        tutor: updatedTutor,
      });
    }

    const activeSubscription =
      await prisma.tutorSubscription.findFirst({
        where: {
          tutorProfileId: id,
          status: "ACTIVE",
          OR: [
            { expiresAt: null },
            {
              expiresAt: {
                gt: new Date(),
              },
            },
          ],
        },
        orderBy: {
          expiresAt: "desc",
        },
        select: {
          id: true,
        },
      });

    const newStatus = activeSubscription
      ? "ACTIVE"
      : "PAUSED";

    const updatedTutor =
      await prisma.tutorProfile.update({
        where: { id },
        data: {
          status: newStatus,
          pausedAt:
            newStatus === "PAUSED"
              ? new Date()
              : null,
          publishedAt:
            newStatus === "ACTIVE"
              ? undefined
              : null,
        },
        select: {
          id: true,
          status: true,
          pausedAt: true,
          publishedAt: true,
        },
      });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "HOME_TUITION_TUTOR_UNSUSPENDED",
      targetType: "TutorProfile",
      targetId: id,
      details: `Tutor ${tutor.displayName} unsuspended by admin. Resulting status: ${newStatus}.`,
    });

    return NextResponse.json({
      success: true,
      action,
      tutor: updatedTutor,
    });
  } catch (error) {
    console.error(
      "HOME_TUITION_ADMIN_TUTOR_STATUS_ERROR",
      error
    );

    return NextResponse.json(
      { error: "Unable to update tutor status." },
      { status: 500 }
    );
  }
}