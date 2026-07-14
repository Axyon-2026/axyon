import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    const { roomId } = await req.json();

    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      return NextResponse.json(
        { message: "Accommodation not found." },
        { status: 404 }
      );
    }

    if (room.ownerId !== decoded.id) {
      return NextResponse.json(
        { message: "You can only remove your own accommodation." },
        { status: 403 }
      );
    }

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message: "Only available accommodation can be removed.",
        },
        {
          status: 400,
        }
      );
    }

    const updated = await prisma.room.update({
      where: {
        id: room.id,
      },
      data: {
        status: "REMOVED",
      },
    });

    return NextResponse.json({
      success: true,
      room: updated,
    });

  } catch (error) {
    console.log("DELETE ROOM ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}