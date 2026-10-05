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
        role: true,
        marketplaceType: true,
        schoolVerified: true,
        schoolVerificationStatus: true,
        isSuspended: true,
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

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSchoolUser();

    if (!user) {
      return NextResponse.json(
        { message: "School Marketplace access denied." },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Conversation ID is required." },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        marketplaceType: true,
        isArchived: true,
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
        { message: "Invalid School conversation." },
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
      return NextResponse.json({
        message: "Conversation is archived.",
      });
    }

    if (conversation.buyerId === user.id) {
      await prisma.message.updateMany({
        where: {
          conversationId: conversation.id,
          senderId: {
            not: user.id,
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
            not: user.id,
          },
          readBySeller: false,
        },
        data: {
          readBySeller: true,
        },
      });
    }

    return NextResponse.json({
      message: "Messages marked as read.",
    });
  } catch (error) {
    console.error("SCHOOL CHAT READ ERROR:", error);

    return NextResponse.json(
      { message: "Unable to update read status." },
      { status: 500 }
    );
  }
}