import { prisma } from "@/lib/prisma";
import {
  getAdminUser,
  logAdminAction,
} from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const rooms = await prisma.room.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            college: true,
            studentVerified: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error(
      "ADMIN ROOMS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load accommodation listings.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await req.json();

    const roomId =
      typeof body?.roomId === "string"
        ? body.roomId.trim()
        : "";

    const action =
      typeof body?.action === "string"
        ? body.action.trim().toUpperCase()
        : "";

    if (!roomId || !action) {
      return NextResponse.json(
        {
          message:
            "Room ID and action are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Admin moderation is REMOVE-only.
    if (action !== "REMOVE") {
      return NextResponse.json(
        {
          message:
            "Admins can only remove accommodation listings.",
        },
        {
          status: 403,
        }
      );
    }

    const room =
      await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

    if (!room) {
      return NextResponse.json(
        {
          message:
            "Accommodation not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (room.status === "REMOVED") {
      return NextResponse.json(
        {
          message:
            "This accommodation has already been removed.",
        },
        {
          status: 409,
        }
      );
    }

    const updatedRoom =
      await prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          status: "REMOVED",
        },
      });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "REMOVE_ACCOMMODATION",
      targetType: "ROOM",
      targetId: room.id,
      details:
        `Accommodation "${room.title}" was removed by admin.`,
    });

    return NextResponse.json({
      success: true,
      message:
        "Accommodation removed successfully.",
      room: updatedRoom,
    });
  } catch (error) {
    console.error(
      "ADMIN ROOMS PATCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to remove accommodation.",
      },
      {
        status: 500,
      }
    );
  }
}