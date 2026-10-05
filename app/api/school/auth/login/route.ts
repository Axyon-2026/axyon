import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user || user.marketplaceType !== "SCHOOL") {
      return NextResponse.json(
        { message: "Invalid School Marketplace credentials" },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Invalid School Marketplace credentials" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { message: "Your account has been suspended by Axyon admin." },
        { status: 403 }
      );
    }

    if (user.schoolVerificationStatus === "PENDING") {
      return NextResponse.json(
        {
          message:
            "Your School account is waiting for Axyon admin verification.",
          status: "PENDING",
        },
        { status: 403 }
      );
    }

    if (
      user.schoolVerificationStatus !== "APPROVED" ||
      !user.schoolVerified
    ) {
      return NextResponse.json(
        {
          message:
            "Your School account has not been approved for the School Marketplace.",
          status: user.schoolVerificationStatus,
        },
        { status: 403 }
      );
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();

    cookieStore.set("axyon_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({
      message: "School login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        marketplaceType: user.marketplaceType,
        schoolName: user.schoolName,
        schoolCity: user.schoolCity,
        classLevel: user.classLevel,
      },
    });
  } catch (error) {
    console.log("SCHOOL LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong during School login" },
      { status: 500 }
    );
  }
}