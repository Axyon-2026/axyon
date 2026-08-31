import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    const body = await req.json();

    const productId =
      typeof body?.productId === "string"
        ? body.productId.trim()
        : "";

    const action =
      body?.action === "PAY_VIA_MEET"
        ? "PAY_VIA_MEET"
        : "CHAT";

    if (!productId) {
      return NextResponse.json(
        { message: "Product is required." },
        { status: 400 }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        select: {
          id: true,
          title: true,
          sellerId: true,
          status: true,
        },
      });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    if (product.sellerId === decoded.id) {
      return NextResponse.json(
        {
          message:
            "You cannot chat with yourself.",
        },
        { status: 400 }
      );
    }

    if (product.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message:
            "This listing is no longer available.",
        },
        { status: 400 }
      );
    }

    /*
     * Find the existing conversation for this
     * buyer + seller + product combination.
     */
    let conversation =
      await prisma.conversation.findFirst({
        where: {
          buyerId: decoded.id,
          sellerId: product.sellerId,
          productId: product.id,
        },
      });

    const isNewConversation = !conversation;

    /*
     * Create conversation when necessary.
     */
    if (!conversation) {
      conversation =
        await prisma.conversation.create({
          data: {
            buyerId: decoded.id,
            sellerId: product.sellerId,
            productId: product.id,
          },
        });
    }

    /*
     * Get buyer information for the seller
     * notification.
     */
    const buyer =
      await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },

        select: {
          name: true,
        },
      });

    /*
     * -------------------------------------------------------
     * NORMAL CHAT
     * -------------------------------------------------------
     *
     * Only notify the seller when the conversation is
     * actually being started for the first time.
     *
     * Reopening an existing chat does not send another
     * "interested" notification.
     */
    if (
      action === "CHAT" &&
      isNewConversation
    ) {
      await createNotification({
        userId: product.sellerId,

        title: buyer?.name
          ? `${buyer.name} is interested in your listing`
          : "Someone is interested in your listing",

        message: buyer?.name
          ? `${buyer.name} started a conversation about "${product.title}".`
          : `Someone started a conversation about "${product.title}".`,

        type: "CHAT_INTEREST",

        link: `/chat/${conversation.id}`,

        sendEmail: true,
      });
    }

    
     
    if (action === "PAY_VIA_MEET") {
      const existingInterest =
        await prisma.message.findFirst({
          where: {
            conversationId:
              conversation.id,

            senderId: decoded.id,

            text: {
              startsWith:
                "🤝 I'm interested in completing this deal through Pay via Meet.",
            },
          },
        });

      if (!existingInterest) {
        await prisma.message.create({
          data: {
            conversationId:
              conversation.id,

            senderId: decoded.id,

            text:
              "🤝 I'm interested in completing this deal through Pay via Meet.",

            readByBuyer: true,

            readBySeller: false,
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

        
        await createNotification({
          userId: product.sellerId,

          title: buyer?.name
            ? `${buyer.name} is interested in Pay via Meet`
            : "New Pay via Meet interest",

          message: buyer?.name
            ? `${buyer.name} wants to discuss completing "${product.title}" through Pay via Meet.`
            : `A buyer wants to discuss completing "${product.title}" through Pay via Meet.`,

          type: "PAY_VIA_MEET_INTEREST",

          link: `/chat/${conversation.id}`,

          sendEmail: true,
        });
      }
    }

    return NextResponse.json({
      success: true,

      conversationId:
        conversation.id,

      isNewConversation,

      action,
    });
  } catch (error) {
    console.error(
      "CHAT OPEN ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to open chat.",
      },
      {
        status: 500,
      }
    );
  }
}