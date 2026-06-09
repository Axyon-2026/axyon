import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        college: true,
        role: true,
        emailVerified: true,
        isVerified: true,
        createdAt: true,
        profileImageUrl: true,

        strikeCount: true,
        isSuspended: true,

        collegeIdNumber: true,
        collegeIdImageUrl: true,
        selfieImageUrl: true,
        studentVerified: true,
        studentVerificationStatus: true,
      },
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.log("ADMIN USERS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load users" },
      { status: 500 }
    );
  }
}