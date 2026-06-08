import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyToken(token);

    const formData =
      await req.formData();

    const collegeId =
      formData.get("collegeId") as File | null;

    const selfie =
      formData.get("selfie") as File | null;

    if (!collegeId || !selfie) {
      return NextResponse.json(
        {
          message:
            "College ID and selfie are required",
        },
        { status: 400 }
      );
    }

    const collegeIdImageUrl =
      collegeId.name;

    const selfieImageUrl =
      selfie.name;

    const updatedUser =
      await prisma.user.update({
        where: {
          id: decoded.id,
        },

        data: {
          collegeIdNumber: `ID-${Date.now()}`,

          collegeIdImageUrl,

          selfieImageUrl,

          studentVerified: false,

          studentVerificationStatus:
            "PENDING",
        },
      });

    await prisma.notification.create({
  data: {
    userId: decoded.id,
    title: "Verification Submitted",
    message:
      "Your student verification has been submitted successfully and is waiting for admin approval.",
    type: "STUDENT_VERIFICATION",
    isRead: false,
    link: "/student-verification",
  },
});

    console.log(`
NEW VERIFICATION REQUEST

User ID: ${decoded.id}
Time: ${new Date().toISOString()}
`);

    return NextResponse.json({
      message:
        "Verification submitted successfully. Please wait for admin approval before accessing marketplace features.",

      user: updatedUser,

      selfieImageUrl,
    });

  } catch (error) {

    console.log(
      "STUDENT VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to submit verification",
      },
      { status: 500 }
    );
  }
}