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

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        createdAt: true,
        role: true,
        studentVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // ==========================
    // PRODUCTS
    // ==========================

    const listedProducts = await prisma.product.findMany({
      where: {
        sellerId: decoded.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const activeListings = listedProducts.filter(
      (p) => p.status === "AVAILABLE"
    );

    const soldListings = listedProducts.filter(
      (p) => p.status === "SOLD"
    );

    const removedListings = listedProducts.filter(
      (p) => p.status === "REMOVED"
    );

    // ==========================
    // ACCOMMODATION
    // ==========================

    const roomListings = await prisma.room.findMany({
      where: {
        ownerId: decoded.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const availableRooms = roomListings.filter(
      (r) => r.status === "AVAILABLE"
    );

    const occupiedRooms = roomListings.filter(
      (r) => r.status === "OCCUPIED"
    );

    const removedRooms = roomListings.filter(
      (r) => r.status === "REMOVED"
    );

    // ==========================
    // PURCHASES
    // ==========================

    const purchasedProducts =
      await prisma.product.findMany({
        where: {
          buyerId: decoded.id,
          status: "SOLD",
        },
        orderBy: {
          soldAt: "desc",
        },
      });

    // ==========================
    // CONVERSATIONS
    // ==========================

    const conversations =
      await prisma.conversation.findMany({
        where: {
          isArchived: false,
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

    // ==========================
    // NOTIFICATIONS
    // ==========================

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: decoded.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

    return NextResponse.json({
      user,

      listedProducts,
      activeListings,
      soldListings,
      removedListings,

      roomListings,
      availableRooms,
      occupiedRooms,
      removedRooms,

      purchasedProducts,

      conversations,

      notifications,
    });

  } catch (error) {
    console.log("DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load dashboard",
      },
      {
        status: 500,
      }
    );
  }
}