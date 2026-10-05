import { prisma } from "@/lib/prisma";
import { getAdminUser, logAdminAction } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const listings = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            college: true,
            strikeCount: true,
            isSuspended: true,
          },
        },
      },
    });

    return NextResponse.json({
      listings,
    });
  } catch (error) {
    console.error(
      "ADMIN LISTINGS FETCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load listings",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const productId = body.productId;
    const action = body.action;

    if (!productId || !action) {
      return NextResponse.json(
        {
          message:
            "Product ID and action are required",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Admin marketplace permissions:
     *
     * Admins are moderators only.
     *
     * Allowed:
     * - Remove inappropriate listings
     *
     * Not allowed:
     * - Create listings
     * - Edit listings
     * - Buy listings
     * - Sell listings
     * - Restore removed listings
     */

    if (action !== "REMOVE") {
      return NextResponse.json(
        {
          message:
            "Admins can only remove inappropriate listings",
        },
        {
          status: 403,
        }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          message: "Listing not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      String(product.status).toUpperCase() ===
      "REMOVED"
    ) {
      return NextResponse.json(
        {
          message:
            "Listing is already removed",
        },
        {
          status: 400,
        }
      );
    }

    const updatedProduct =
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          status: "REMOVED",
        },
      });

    /*
     * Archive active conversations connected
     * to the removed listing.
     */
    await prisma.conversation.updateMany({
      where: {
        productId,
        isArchived: false,
      },
      data: {
        isArchived: true,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "REMOVE_LISTING",
      targetType: "PRODUCT",
      targetId: productId,
      details:
        `Removed listing "${product.title}" by seller ${
          product.seller?.email || "unknown"
        } from ${
          product.marketplaceType || "unknown"
        } marketplace`,
    });

    return NextResponse.json({
      message:
        "Listing removed successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "ADMIN LISTINGS ACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to remove listing",
      },
      {
        status: 500,
      }
    );
  }
}