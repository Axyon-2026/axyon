import { prisma } from "@/lib/prisma";
import {
  getAdminUser,
  logAdminAction,
} from "@/lib/admin";
import { NextResponse } from "next/server";

const ALLOWED_ACTIONS = [
  "WARN",
  "SUSPEND",
  "UNSUSPEND",
] as const;

type UserAction =
  (typeof ALLOWED_ACTIONS)[number];

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin access only",
        },
        {
          status: 403,
        }
      );
    }

    const body = await req.json();

    const userId =
      typeof body?.userId === "string"
        ? body.userId.trim()
        : "";

    const action =
      typeof body?.action === "string"
        ? body.action.trim().toUpperCase()
        : "";

    if (!userId || !action) {
      return NextResponse.json(
        {
          message:
            "User ID and action are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ALLOWED_ACTIONS.includes(
        action as UserAction
      )
    ) {
      return NextResponse.json(
        {
          message: "Invalid action",
        },
        {
          status: 400,
        }
      );
    }

    const targetUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!targetUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Admin accounts cannot be modified
    // through the user moderation panel.
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Admin users cannot be modified here",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedAction =
      action as UserAction;

    /* =========================
       WARN
    ========================= */

    if (normalizedAction === "WARN") {
      const newStrikeCount =
        targetUser.strikeCount + 1;

      const shouldSuspend =
        newStrikeCount >= 3;

      const updatedUser =
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            strikeCount: {
              increment: 1,
            },
            isSuspended:
              shouldSuspend,
          },
        });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "WARN_USER",
        targetType: "USER",
        targetId: userId,
        details:
          `Warned user ${targetUser.email}. Strike count: ${newStrikeCount}.`,
      });

      if (shouldSuspend) {
        await logAdminAction({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "AUTO_SUSPEND_USER",
          targetType: "USER",
          targetId: userId,
          details:
            `User ${targetUser.email} was automatically suspended after reaching 3 strikes.`,
        });
      }

      return NextResponse.json({
        message: shouldSuspend
          ? "User warned and auto-suspended after 3 strikes"
          : "User warned successfully",
        user: updatedUser,
      });
    }

    /* =========================
       SUSPEND
    ========================= */

    if (normalizedAction === "SUSPEND") {
      if (targetUser.isSuspended) {
        return NextResponse.json({
          message:
            "User is already suspended",
          user: targetUser,
        });
      }

      const updatedUser =
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isSuspended: true,
          },
        });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "SUSPEND_USER",
        targetType: "USER",
        targetId: userId,
        details:
          `Suspended user ${targetUser.email}`,
      });

      return NextResponse.json({
        message:
          "User suspended successfully",
        user: updatedUser,
      });
    }

    /* =========================
       UNSUSPEND
    ========================= */

    if (
      normalizedAction ===
      "UNSUSPEND"
    ) {
      if (!targetUser.isSuspended) {
        return NextResponse.json({
          message:
            "User is not currently suspended",
          user: targetUser,
        });
      }

      const updatedUser =
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isSuspended: false,
          },
        });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "UNSUSPEND_USER",
        targetType: "USER",
        targetId: userId,
        details:
          `Unsuspended user ${targetUser.email}`,
      });

      return NextResponse.json({
        message:
          "User unsuspended successfully",
        user: updatedUser,
      });
    }

    return NextResponse.json(
      {
        message: "Invalid action",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "ADMIN USER ACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to perform user action",
      },
      {
        status: 500,
      }
    );
  }
}