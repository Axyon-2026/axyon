import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        {
          message: "Verification token is missing",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await prisma.user.findFirst({
        where: {
          verifyToken: token,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Invalid or expired verification link",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        verifyToken: null,
      },
    });

    return NextResponse.json({
      message:
        "Email verified successfully",
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        message:
          "Something went wrong during verification",
      },
      {
        status: 500,
      }
    );

  }
}