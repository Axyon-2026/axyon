import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: {
        id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            studentVerified: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          message: "Room not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      room,
    });
  } catch (error) {
    console.log("ROOM DETAILS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load room",
      },
      {
        status: 500,
      }
    );
  }
}