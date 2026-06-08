import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")
        ?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyToken(token);

    const conversations =
      await prisma.conversation.findMany({
        where: {
          OR: [
            {
              buyerId: decoded.id,
            },
            {
              sellerId: decoded.id,
            },
          ],
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

    // auto mark messages as read
    for (const conversation of conversations) {

      if (
        conversation.buyerId ===
        decoded.id
      ) {
        await prisma.message.updateMany({
          where: {
            conversationId:
              conversation.id,

            senderId: {
              not: decoded.id,
            },

            readByBuyer: false,
          },

          data: {
            readByBuyer: true,
          },
        });
      }

      if (
        conversation.sellerId ===
        decoded.id
      ) {
        await prisma.message.updateMany({
          where: {
            conversationId:
              conversation.id,

            senderId: {
              not: decoded.id,
            },

            readBySeller: false,
          },

          data: {
            readBySeller: true,
          },
        });
      }
    }

    const refreshedConversations =
      await prisma.conversation.findMany({
        where: {
          OR: [
            {
              buyerId: decoded.id,
            },
            {
              sellerId: decoded.id,
            },
          ],
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

    const userIds = Array.from(
      new Set(
        refreshedConversations.flatMap(
          (conversation) => [
            conversation.buyerId,
            conversation.sellerId,
          ]
        )
      )
    );

    const productIds = Array.from(
      new Set(
        refreshedConversations.map(
          (conversation) =>
            conversation.productId
        )
      )
    );

    const users =
      await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },

        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          studentVerified: true,
        },
      });

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },

        select: {
          id: true,
          title: true,
          price: true,
          imageUrls: true,
          status: true,
        },
      });

    const userMap = new Map(
      users.map((user) => [
        user.id,
        user,
      ])
    );

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    const enrichedConversations =
      refreshedConversations.map(
        (conversation) => {

          const unreadCount =
            conversation.messages.filter(
              (message) => {

                if (
                  message.senderId ===
                  decoded.id
                ) {
                  return false;
                }

                if (
                  conversation.buyerId ===
                  decoded.id
                ) {
                  return (
                    !message.readByBuyer
                  );
                }

                return (
                  !message.readBySeller
                );
              }
            ).length;

          return {
            ...conversation,

            unreadCount,

            buyer:
              userMap.get(
                conversation.buyerId
              ) || null,

            seller:
              userMap.get(
                conversation.sellerId
              ) || null,

            product:
              productMap.get(
                conversation.productId
              ) || null,
          };
        }
      );

    return NextResponse.json({
      conversations:
        enrichedConversations,
    });

  } catch (error) {

    console.log(
      "CHAT FETCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load chats",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")
        ?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyToken(token);

    const {
      sellerId,
      productId,
      text,
      conversationId,
    } = await req.json();

    if (
      !text ||
      text.trim().length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Message cannot be empty",
        },
        { status: 400 }
      );
    }

    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },

        select: {
          id: true,
          name: true,
          isSuspended: true,
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
        {
          message:
            "Your account is suspended.",
        },
        { status: 403 }
      );
    }

    let conversation;

    if (conversationId) {

      conversation =
        await prisma.conversation.findFirst({
          where: {
            id: conversationId,

            OR: [
              {
                buyerId:
                  decoded.id,
              },
              {
                sellerId:
                  decoded.id,
              },
            ],
          },
        });

      if (!conversation) {
        return NextResponse.json(
          {
            message:
              "Conversation not found",
          },
          { status: 404 }
        );
      }

    } else {

      if (
        !sellerId ||
        !productId
      ) {
        return NextResponse.json(
          {
            message:
              "Missing required fields",
          },
          { status: 400 }
        );
      }

      if (
        sellerId === decoded.id
      ) {
        return NextResponse.json(
          {
            message:
              "You cannot start chat with yourself",
          },
          { status: 400 }
        );
      }

      conversation =
        await prisma.conversation.findFirst({
          where: {
            productId,
            buyerId:
              decoded.id,
            sellerId,
          },
        });

      if (!conversation) {
        conversation =
          await prisma.conversation.create({
            data: {
              buyerId:
                decoded.id,
              sellerId,
              productId,
            },
          });
      }
    }

    const isBuyer =
      conversation.buyerId ===
      decoded.id;

    
     

if (
  !conversation ||
  (
    conversation.buyerId !== decoded.id &&
    conversation.sellerId !== decoded.id
  )
) {
  return NextResponse.json(
    { message: "Unauthorized chat access" },
    { status: 403 }
  );
}
      const createdMessage =
      await prisma.message.create({
        data: {
          conversationId:
            conversation.id,

          senderId: decoded.id,

          text: text.trim(),

          readByBuyer: isBuyer,
          readBySeller: !isBuyer,
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

    const receiverId =
      conversation.buyerId ===
      decoded.id
        ? conversation.sellerId
        : conversation.buyerId;

    const product =
      await prisma.product.findUnique({
        where: {
          id: conversation.productId,
        },

        select: {
          id: true,
          title: true,
        },
      });

    await createNotification({
      userId: receiverId,

      title: "New Message",

      message: `${currentUser.name} sent you a message${
        product?.title
          ? ` about "${product.title}"`
          : ""
      }.`,

      type: "CHAT_MESSAGE",

      link: "/chat",
    });

    const updatedConversation =
      await prisma.conversation.findUnique({
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
      message:
        "Message sent successfully",

      conversation:
        updatedConversation,

      data: createdMessage,
    });

  } catch (error) {

    console.log(
      "CHAT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to send message",
      },
      { status: 500 }
    );
  }
}