import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _req: Request,
  context: RouteContext
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    let userId: string;

    try {
      const decoded: any = verifyToken(token);

      if (!decoded?.id) {
        throw new Error("Invalid token");
      }

      userId = decoded.id;
    } catch {
      return NextResponse.json(
        { message: "Invalid session." },
        { status: 401 }
      );
    }

    const { id: conversationId } = await context.params;

    if (!conversationId) {
      return NextResponse.json(
        { message: "Conversation is required." },
        { status: 400 }
      );
    }

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },

        select: {
          id: true,
          buyerId: true,
          sellerId: true,
          isArchived: true,
        },
      });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found." },
        { status: 404 }
      );
    }

    const isBuyer =
      conversation.buyerId === userId;

    const isSeller =
      conversation.sellerId === userId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        {
          message:
            "You do not have access to this conversation.",
        },
        { status: 403 }
      );
    }

    /*
     * Mark only messages sent by the OTHER user as read.
     * Opening one chat never changes unread state in another chat.
     */
    if (isBuyer) {
      await prisma.message.updateMany({
        where: {
          conversationId: conversation.id,
          senderId: {
            not: userId,
          },
          readByBuyer: false,
        },

        data: {
          readByBuyer: true,
        },
      });
    } else {
      await prisma.message.updateMany({
        where: {
          conversationId: conversation.id,
          senderId: {
            not: userId,
          },
          readBySeller: false,
        },

        data: {
          readBySeller: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("MARK CHAT READ ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to mark conversation as read.",
      },
      {
        status: 500,
      }
    );
  }
}