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

    const decoded: any = verifyToken(token);

    const body = await req.json();

    const productId =
      typeof body?.productId === "string"
        ? body.productId.trim()
        : "";

    const roomId =
      typeof body?.roomId === "string"
        ? body.roomId.trim()
        : "";

    /*
     * ROOM CHAT
     */
    if (roomId) {
      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

      if (!room) {
        return NextResponse.json(
          {
            message: "Accommodation not found.",
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

      if (room.ownerId === decoded.id) {
        return NextResponse.json(
          {
            message:
              "You cannot chat with yourself.",
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
            sellerId: room.ownerId,
            roomId: room.id,
            productId: null,
            isArchived: false,
          },
        });

      if (!conversation) {
        conversation =
          await prisma.conversation.create({
            data: {
              buyerId: decoded.id,
              sellerId: room.ownerId,
              roomId: room.id,
            },
          });
      }

      return NextResponse.json({
        success: true,
        conversationId:
          conversation.id,
      });
    }

    /*
     * EXISTING PRODUCT CHAT
     *
     * Keep the existing product behavior.
     */
    if (productId) {
      const product =
        await prisma.product.findUnique({
          where: {
            id: productId,
          },
        });

      if (!product) {
        return NextResponse.json(
          {
            message: "Product not found.",
          },
          {
            status: 404,
          }
        );
      }

      if (product.sellerId === decoded.id) {
        return NextResponse.json(
          {
            message:
              "You cannot chat with yourself.",
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
            sellerId: product.sellerId,
            productId: product.id,
            roomId: null,
            isArchived: false,
          },
        });

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

      return NextResponse.json({
        success: true,
        conversationId:
          conversation.id,
      });
    }

    return NextResponse.json(
      {
        message:
          "Product or accommodation is required.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.log(
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