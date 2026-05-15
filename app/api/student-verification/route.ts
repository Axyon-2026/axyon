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
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any =
      verifyToken(token);

    const {
      collegeIdNumber,
      collegeIdImageUrl,
    } = await req.json();

    if (
      !collegeIdNumber ||
      !collegeIdImageUrl
    ) {
      return NextResponse.json(
        {
          message:
            "College ID number and image are required",
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser =
      await prisma.user.update({
        where: {
          id: decoded.id,
        },

        data: {
          collegeIdNumber,
          collegeIdImageUrl,

          studentVerified: false,

          studentVerificationStatus:
            "PENDING",
        },
      });

    return NextResponse.json({
      message:
        "Verification submitted successfully",
      user: updatedUser,
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
      {
        status: 500,
      }
    );
  }
}