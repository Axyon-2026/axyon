import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getSchoolUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  try {
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        marketplaceType: true,
        schoolId: true,
        schoolName: true,
        schoolCity: true,
        classLevel: true,
        schoolVerified: true,
        schoolVerificationStatus: true,
        isSuspended: true,
        profileImageUrl: true,
      },
    });

    if (!user) return null;

    if (
      user.role === "ADMIN" ||
      user.marketplaceType !== "SCHOOL" ||
      user.isSuspended ||
      !user.schoolVerified ||
      user.schoolVerificationStatus !== "APPROVED"
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * GET
 * Returns ONLY School Marketplace conversations
 * belonging to the authenticated School student.
 */
export async function GET() {
  try {
    const user = await getSchoolUser();

    if (!user) {
      return NextResponse.json(
        { message: "School Marketplace access denied." },
        { status: 403 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        marketplaceType: "SCHOOL",
        isArchived: false,
        OR: [
          { buyerId: user.id },
          { sellerId: user.id },
        ],
        product: {
          marketplaceType: "SCHOOL",
        },
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            imageUrls: true,
            status: true,
            marketplaceType: true,
            schoolName: true,
            schoolCity: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            conversationId: true,
            senderId: true,
            text: true,
            createdAt: true,
            readByBuyer: true,
            readBySeller: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const participantIds = Array.from(
      new Set(
        conversations.flatMap((conversation) => [
          conversation.buyerId,
          conversation.sellerId,
        ])
      )
    );

    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
        schoolName: true,
        schoolCity: true,
        classLevel: true,
        schoolVerified: true,
        marketplaceType: true,
        isSuspended: true,
      },
    });

    const participantMap = new Map(
      participants.map((participant) => [participant.id, participant])
    );

    const safeConversations = conversations
      .filter(
        (conversation) =>
          conversation.product?.marketplaceType === "SCHOOL"
      )
      .map((conversation) => ({
        ...conversation,
        buyer: participantMap.get(conversation.buyerId) ?? null,
        seller: participantMap.get(conversation.sellerId) ?? null,
      }));

    return NextResponse.json({
      currentUserId: user.id,
      user: {
        id: user.id,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
        schoolName: user.schoolName,
        schoolCity: user.schoolCity,
        classLevel: user.classLevel,
        schoolVerified: user.schoolVerified,
      },
      conversations: safeConversations,
    });
  } catch (error) {
    console.error("SCHOOL CHAT GET ERROR:", error);

    return NextResponse.json(
      { message: "Unable to load School Chat." },
      { status: 500 }
    );
  }
}

/**
 * POST
 * Sends a message only inside a valid School Marketplace conversation.
 */
export async function POST(req: Request) {
  try {
    const user = await getSchoolUser();

    if (!user) {
      return NextResponse.json(
        { message: "School Marketplace access denied." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const conversationId =
      typeof body.conversationId === "string"
        ? body.conversationId.trim()
        : "";

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    if (!conversationId) {
      return NextResponse.json(
        { message: "Conversation is required." },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { message: "Message cannot be empty." },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { message: "Message is too long." },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            marketplaceType: true,
            status: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found." },
        { status: 404 }
      );
    }

    if (conversation.marketplaceType !== "SCHOOL") {
      return NextResponse.json(
        { message: "This is not a School Marketplace conversation." },
        { status: 403 }
      );
    }

    if (!conversation.product) {
      return NextResponse.json(
        { message: "This conversation has no School Marketplace product." },
        { status: 400 }
      );
    }

    if (conversation.product.marketplaceType !== "SCHOOL") {
      return NextResponse.json(
        { message: "Invalid School Marketplace conversation." },
        { status: 403 }
      );
    }

    if (
      conversation.buyerId !== user.id &&
      conversation.sellerId !== user.id
    ) {
      return NextResponse.json(
        { message: "You are not a participant in this conversation." },
        { status: 403 }
      );
    }

    if (conversation.isArchived) {
      return NextResponse.json(
        { message: "This conversation is no longer available." },
        { status: 410 }
      );
    }

    const recipientId =
      conversation.buyerId === user.id
        ? conversation.sellerId
        : conversation.buyerId;

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        text,
        readByBuyer: conversation.buyerId === user.id,
        readBySeller: conversation.sellerId === user.id,
      },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        text: true,
        createdAt: true,
        readByBuyer: true,
        readBySeller: true,
      },
    });

    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    /*
     * Notification is intentionally kept defensive here.
     * Chat messaging must succeed even if notification delivery fails.
     */
    try {
      const notificationModel = (prisma as any).notification;

      if (notificationModel) {
        await notificationModel.create({
          data: {
            userId: recipientId,
            title: "New School Chat message",
            message:
              text.length > 120
                ? `${text.slice(0, 117)}...`
                : text,
            type: "SCHOOL_CHAT",
            link: `/school-marketplace/chat/${conversation.id}`,
          },
        });
      }
    } catch (notificationError) {
      console.error(
        "SCHOOL CHAT NOTIFICATION ERROR:",
        notificationError
      );
    }

    return NextResponse.json({
      message: "Message sent.",
      data: message,
    });
  } catch (error) {
    console.error("SCHOOL CHAT POST ERROR:", error);

    return NextResponse.json(
      { message: "Unable to send message. Please try again." },
      { status: 500 }
    );
  }
}