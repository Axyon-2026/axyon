import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded: any = verifyToken(token);

    return decoded?.id || null;
  } catch {
    return null;
  }
}

/* =========================================================
   GET — LOAD CHAT INBOX + CONVERSATIONS
   ========================================================= */

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const conversations =
      await prisma.conversation.findMany({
        where: {
          isArchived: false,

          OR: [
            {
              buyerId: userId,
            },
            {
              sellerId: userId,
            },
          ],
        },

        include: {
          product: true,

          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    const userIds = new Set<string>();

    for (const conversation of conversations) {
      userIds.add(conversation.buyerId);
      userIds.add(conversation.sellerId);
    }

    const users =
      userIds.size > 0
        ? await prisma.user.findMany({
            where: {
              id: {
                in: Array.from(userIds),
              },
            },

            select: {
              id: true,
              name: true,
              profileImageUrl: true,
              studentVerified: true,
              college: true,
            },
          })
        : [];

    const userMap = new Map(
      users.map((user) => [user.id, user])
    );

    const enrichedConversations =
      conversations.map((conversation) => ({
        ...conversation,

        buyer:
          userMap.get(conversation.buyerId) ||
          null,

        seller:
          userMap.get(conversation.sellerId) ||
          null,
      }));

    return NextResponse.json({
      success: true,
      conversations: enrichedConversations,
    });
  } catch (error) {
    console.error("GET CHAT ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load conversations.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST — SEND MESSAGE
   ========================================================= */

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const conversationId =
      typeof body?.conversationId === "string"
        ? body.conversationId.trim()
        : "";

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    if (!conversationId) {
      return NextResponse.json(
        {
          message: "Conversation is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!text) {
      return NextResponse.json(
        {
          message: "Message cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        {
          message:
            "Message cannot exceed 2000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },

        include: {
          product: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

    if (!conversation) {
      return NextResponse.json(
        {
          message: "Conversation not found.",
        },
        {
          status: 404,
        }
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
        {
          status: 403,
        }
      );
    }

    if (conversation.isArchived) {
      return NextResponse.json(
        {
          message:
            "This conversation is no longer active.",
        },
        {
          status: 400,
        }
      );
    }

    const recipientId = isBuyer
      ? conversation.sellerId
      : conversation.buyerId;

    const sender = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        name: true,
      },
    });

    const message =
      await prisma.message.create({
        data: {
          conversationId:
            conversation.id,

          senderId: userId,

          text,

          // Sender has obviously seen their own message.
          readByBuyer: isBuyer,
          readBySeller: isSeller,
        },
      });

    /*
     * Prisma's @updatedAt does not change when a related
     * Message is created, so explicitly touch the conversation.
     * This keeps the newest active chat at the top of the inbox.
     */
    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },

      data: {
        updatedAt: new Date(),
      },
    });

    try {
      await prisma.notification.create({
        data: {
          userId: recipientId,

          title:
            sender?.name
              ? `New message from ${sender.name}`
              : "New message",

          message:
            text.length > 100
              ? `${text.slice(0, 100)}…`
              : text,

          type: "CHAT_MESSAGE",

          link: `/chat/${conversation.id}`,
        },
      });
    } catch (notificationError) {
      /*
       * A notification failure should not make a successfully
       * created chat message appear to have failed.
       */
      console.error(
        "CHAT NOTIFICATION ERROR:",
        notificationError
      );
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("POST CHAT ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to send message.",
      },
      {
        status: 500,
      }
    );
  }
}