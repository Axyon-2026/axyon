import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
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

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: decoded.id }, { sellerId: decoded.id }],
      },
      include: {
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

    return NextResponse.json({ conversations });
  } catch (error) {
    console.log("CHAT FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load chats" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const { sellerId, productId, text, conversationId } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { message: "Message cannot be empty" },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (currentUser.isSuspended) {
      return NextResponse.json(
        { message: "Your account is suspended." },
        { status: 403 }
      );
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ buyerId: decoded.id }, { sellerId: decoded.id }],
        },
      });

      if (!conversation) {
        return NextResponse.json(
          { message: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      if (!sellerId || !productId) {
        return NextResponse.json(
          { message: "Missing required fields" },
          { status: 400 }
        );
      }

      if (sellerId === decoded.id) {
        return NextResponse.json(
          { message: "You cannot start chat with yourself" },
          { status: 400 }
        );
      }

      conversation = await prisma.conversation.findFirst({
        where: {
          productId,
          buyerId: decoded.id,
          sellerId,
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            buyerId: decoded.id,
            sellerId,
            productId,
          },
        });
      }
    }

    const createdMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: decoded.id,
        text: text.trim(),
      },
    });

    const updatedConversation = await prisma.conversation.findUnique({
      where: {
        id: conversation.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      message: "Message sent successfully",
      conversation: updatedConversation,
      data: createdMessage,
    });
  } catch (error) {
    console.log("CHAT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}