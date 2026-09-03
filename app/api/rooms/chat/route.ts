import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any =
      verifyToken(token);

    const userId = decoded?.id;

    if (!userId) {
      return NextResponse.json(
        {
          message: "Invalid session.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const roomId =
      typeof body?.roomId === "string"
        ? body.roomId.trim()
        : "";

    if (!roomId) {
      return NextResponse.json(
        {
          message:
            "Accommodation is required.",
        },
        {
          status: 400,
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

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message:
            "This accommodation is no longer available.",
        },
        {
          status: 400,
        }
      );
    }

    if (room.ownerId === userId) {
      return NextResponse.json(
        {
          message:
            "You cannot contact yourself.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Find an existing room conversation.
     *
     * We use buyerId for the interested student
     * and sellerId for the accommodation owner.
     *
     * productId is not available for rooms, so this
     * route requires the Conversation schema to have
     * an optional roomId field.
     */

    let conversation =
      await prisma.conversation.findFirst({
        where: {
          roomId,
          buyerId: userId,
          sellerId: room.ownerId,
        },
      });

    /*
     * If there isn't already a conversation,
     * create one.
     */

    if (!conversation) {
      conversation =
        await prisma.conversation.create({
          data: {
            roomId,
            buyerId: userId,
            sellerId: room.ownerId,

            /*
             * Product conversations already require
             * productId in the current schema.
             *
             * This route assumes productId has been
             * changed to optional for room chats.
             */
          },
        });
    }

    return NextResponse.json({
      success: true,
      conversationId:
        conversation.id,
    });
  } catch (error) {
    console.error(
      "ROOM CHAT OPEN ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to open accommodation chat.",
      },
      {
        status: 500
      }
    );
  }
}