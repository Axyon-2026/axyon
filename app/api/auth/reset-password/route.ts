import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        {
          message: "Token and password are required",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await prisma.user.findFirst({
        where: {
          resetToken: token,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Invalid or expired reset link",
        },
        {
          status: 400,
        }
      );
    }

    if (
      user.resetExpiresAt &&
      new Date() > user.resetExpiresAt
    ) {
      return NextResponse.json(
        {
          message:
            "Reset link has expired",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpiresAt: null,
      },
    });

    return NextResponse.json({
      message:
        "Password reset successful. Redirecting to login...",
    });

  } catch (error) {

    console.log(
      "RESET PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Server error. Please try again later.",
      },
      {
        status: 500,
      }
    );

  }
}