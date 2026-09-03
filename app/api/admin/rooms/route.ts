import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) {
    return null;
  }

  const decoded: any = verifyToken(token);

  if (!decoded?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const admin = await getAdmin();

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
    console.error("ADMIN ROOMS GET ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load accommodation listings.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdmin();

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

    if (!roomId) {
      return NextResponse.json(
        {
          message: "Room ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (action !== "REMOVE" && action !== "RESTORE") {
      return NextResponse.json(
        {
          message: "Invalid action.",
        },
        {
          status: 400,
        }
      );
    }

    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          message: "Accommodation not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedRoom = await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        status:
          action === "REMOVE"
            ? "REMOVED"
            : "AVAILABLE",
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action:
          action === "REMOVE"
            ? "REMOVE_ACCOMMODATION"
            : "RESTORE_ACCOMMODATION",
        targetType: "ROOM",
        targetId: room.id,
        details:
          action === "REMOVE"
            ? `Accommodation "${room.title}" was removed by admin.`
            : `Accommodation "${room.title}" was restored by admin.`,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        action === "REMOVE"
          ? "Accommodation removed successfully."
          : "Accommodation restored successfully.",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("ADMIN ROOMS PATCH ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update accommodation.",
      },
      {
        status: 500,
      }
    );
  }
}