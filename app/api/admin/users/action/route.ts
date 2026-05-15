import { prisma } from "@/lib/prisma";
import { getAdminUser, logAdminAction } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { message: "User ID and action are required" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { message: "Admin users cannot be modified here" },
        { status: 400 }
      );
    }

    if (action === "WARN") {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          strikeCount: {
            increment: 1,
          },
          isSuspended: targetUser.strikeCount + 1 >= 3,
        },
      });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "WARN_USER",
        targetType: "USER",
        targetId: userId,
        details: `Warned user ${targetUser.email}`,
      });

      return NextResponse.json({
        message: updatedUser.isSuspended
          ? "User warned and auto-suspended after 3 strikes"
          : "User warned successfully",
        user: updatedUser,
      });
    }

    if (action === "SUSPEND") {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
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
        details: `Suspended user ${targetUser.email}`,
      });

      return NextResponse.json({
        message: "User suspended successfully",
        user: updatedUser,
      });
    }

    if (action === "UNSUSPEND") {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
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
        details: `Unsuspended user ${targetUser.email}`,
      });

      return NextResponse.json({
        message: "User unsuspended successfully",
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.log("ADMIN USER ACTION ERROR:", error);

    return NextResponse.json(
      { message: "Failed to perform user action" },
      { status: 500 }
    );
  }
}