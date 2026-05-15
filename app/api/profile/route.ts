import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    const { name, phone, college, profileImageUrl } = await req.json();

    if (!name || !phone || !college) {
      return NextResponse.json(
        { message: "Name, phone, and college are required" },
        { status: 400 }
      );
    }

    if (phone.length < 10) {
      return NextResponse.json(
        { message: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: decoded.id,
      },
      data: {
        phone,
        name,
        college,
        profileImageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        college: true,
        role: true,
        profileImageUrl: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}