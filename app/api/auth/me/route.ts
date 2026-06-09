import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any =
      verifyToken(token);

    const user =
      await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,

        emailVerified:
          user.emailVerified,

        studentVerified:
          user.studentVerified,

        studentVerificationStatus:
          user.studentVerificationStatus,

        college:
          user.college,
          
        phone:
          user.phone,
      
        profileImageUrl:
          user.profileImageUrl,

        collegeIdNumber:
          user.collegeIdNumber,

        collegeIdImageUrl:
          user.collegeIdImageUrl,

        isSuspended:
          user.isSuspended,

        createdAt:
          user.createdAt,
      },
    });

  } catch (error) {

    console.log(
      "AUTH ME ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch user",
      },
      {
        status: 500,
      }
    );

  }
}