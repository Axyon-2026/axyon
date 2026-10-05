import { prisma } from "@/lib/prisma";
import {
  getAdminUser,
  logAdminAction,
} from "@/lib/admin";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_ACTIONS = [
  "APPROVE",
  "REJECT",
] as const;

type VerificationAction =
  (typeof ALLOWED_ACTIONS)[number];

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin access only",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const userId =
      typeof body?.userId === "string"
        ? body.userId.trim()
        : "";

    const requestedAction =
      typeof body?.action === "string"
        ? body.action.trim().toUpperCase()
        : "";

    if (!userId || !requestedAction) {
      return NextResponse.json(
        {
          message:
            "User ID and action are required",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_ACTIONS.includes(
        requestedAction as VerificationAction
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid verification action",
        },
        { status: 400 }
      );
    }

    const action =
      requestedAction as VerificationAction;

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
        { status: 404 }
      );
    }

    if (
      !targetUser.collegeIdNumber ||
      !targetUser.collegeIdImageUrl
    ) {
      return NextResponse.json(
        {
          message:
            "User has not submitted college ID verification",
        },
        { status: 400 }
      );
    }

    if (
      action === "APPROVE" &&
      targetUser.studentVerificationStatus ===
        "APPROVED"
    ) {
      return NextResponse.json({
        message:
          "Student verification is already approved",
        user: targetUser,
      });
    }

    if (
      action === "REJECT" &&
      targetUser.studentVerificationStatus ===
        "REJECTED"
    ) {
      return NextResponse.json({
        message:
          "Student verification is already rejected",
        user: targetUser,
      });
    }

    const updatedUser =
      await prisma.user.update({
        where: {
          id: userId,
        },
        data:
          action === "APPROVE"
            ? {
                studentVerified: true,
                studentVerificationStatus:
                  "APPROVED",
              }
            : {
                studentVerified: false,
                studentVerificationStatus:
                  "REJECTED",
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
      details:
        `${action} college ID verification for ${targetUser.email}`,
    });

    // Email the student without allowing email failure
    // to break the verification action.
    try {
      if (process.env.RESEND_API_KEY) {
        const isApproved =
          action === "APPROVE";

        await resend.emails.send({
          from: "Axyon Support <support@axyon.in>",
          to: targetUser.email,
          subject: isApproved
            ? "Axyon Student Verification Approved 🎉"
            : "Axyon Student Verification Update",
          html: isApproved
            ? `
              <div style="font-family:Arial,sans-serif;padding:24px;color:#111827;line-height:1.6">
                <h2 style="margin-bottom:8px">
                  Student Verification Approved 🎉
                </h2>

                <p>Hi ${targetUser.name},</p>

                <p>
                  Your Axyon student verification has been
                  <strong>approved</strong>.
                </p>

                <p>
                  You can now access the verified student
                  features on Axyon.
                </p>

                <p style="margin-top:24px">
                  Thanks,<br/>
                  Axyon Team
                </p>
              </div>
            `
            : `
              <div style="font-family:Arial,sans-serif;padding:24px;color:#111827;line-height:1.6">
                <h2 style="margin-bottom:8px">
                  Student Verification Update
                </h2>

                <p>Hi ${targetUser.name},</p>

                <p>
                  Your Axyon student verification request
                  was <strong>not approved</strong>.
                </p>

                <p>
                  Please review your submitted information
                  and documents. If you believe this was
                  incorrect or need assistance, please
                  contact Axyon Support.
                </p>

                <p style="margin-top:24px">
                  Thanks,<br/>
                  Axyon Support Team
                </p>
              </div>
            `,
        });
      }
    } catch (emailError) {
      console.error(
        "STUDENT VERIFICATION EMAIL ERROR:",
        emailError
      );
    }

    return NextResponse.json({
      message:
        action === "APPROVE"
          ? "Student verification approved"
          : "Student verification rejected",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "STUDENT VERIFY ADMIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update student verification",
      },
      { status: 500 }
    );
  }
}