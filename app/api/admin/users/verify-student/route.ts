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

    const allowedActions = ["APPROVE", "REJECT"];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { message: "Invalid verification action" },
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

    if (!targetUser.collegeIdNumber || !targetUser.collegeIdImageUrl) {
      return NextResponse.json(
        { message: "User has not submitted college ID verification" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data:
        action === "APPROVE"
          ? {
              studentVerified: true,
              studentVerificationStatus: "APPROVED",
            }
          : {
              studentVerified: false,
              studentVerificationStatus: "REJECTED",
            },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action:
        action === "APPROVE"
          ? "APPROVE_STUDENT_VERIFICATION"
          : "REJECT_STUDENT_VERIFICATION",
      targetType: "USER",
      targetId: userId,
      details: `${action} college ID verification for ${targetUser.email}`,
    });

    return NextResponse.json({
      message:
        action === "APPROVE"
          ? "Student verification approved"
          : "Student verification rejected",
      user: updatedUser,
    });
  } catch (error) {
    console.log("STUDENT VERIFY ADMIN ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update student verification" },
      { status: 500 }
    );
  }
}