import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message:
            "Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any =
      verifyToken(token);

    const {
      sellerId,
      productId,
      text,
    } = await req.json();

    if (
      !sellerId ||
      !productId ||
      !text
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    let conversation =
      await prisma.conversation.findFirst({
        where: {
          buyerId: decoded.id,
          sellerId,
          productId,
        },
      });

    if (!conversation) {
      conversation =
        await prisma.conversation.create({
          data: {
            buyerId: decoded.id,
            sellerId,
            productId,
          },
        });
    }

    const message =
      await prisma.message.create({
        data: {
          conversationId:
            conversation.id,

          senderId:
            decoded.id,

          text,
        },
      });

    return NextResponse.json({
      message:
        "Message sent successfully",

      conversation,
      data: message,
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
      {
        status: 500,
      }
    );

  }
}

export async function GET(req: Request) {

  try {

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "axyon_token"
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          message:
            "Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any =
      verifyToken(token);

    const conversations =
      await prisma.conversation.findMany({
        where: {
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

    return NextResponse.json({
      conversations,
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
      {
        status: 500,
      }
    );

  }
}