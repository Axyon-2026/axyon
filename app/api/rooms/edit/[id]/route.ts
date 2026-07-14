import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Params = Promise<{
  id: string;
}>;

export async function GET(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      return NextResponse.json(
        { message: "Accommodation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.log("ROOM FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load accommodation." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyToken(token);

    const { id } = await params;

    const room =
      await prisma.room.findUnique({
        where: {
          id,
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
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message:
            "Only available accommodation can be edited.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await req.json();

    const updated =
      await prisma.room.update({
        where: {
          id,
        },
        data: {
          title: body.title,
          description: body.description,
          roomType: body.roomType,
          rent: Number(body.rent),
          deposit: Number(body.deposit),
          address: body.address,
          landmark: body.landmark,
          college: body.college,
          amenities: body.amenities,
        },
      });

    return NextResponse.json({
      success: true,
      room: updated,
    });
  } catch (error) {
    console.log("ROOM UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update accommodation." },
      { status: 500 }
    );
  }
}