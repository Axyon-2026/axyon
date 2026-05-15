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

    return NextResponse.json({ listings });
  } catch (error) {
    console.log("ADMIN LISTINGS FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load listings" },
      { status: 500 }
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

    const { productId, action } = await req.json();

    if (!productId || !action) {
      return NextResponse.json(
        { message: "Product ID and action are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    if (action === "REMOVE") {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          status: "REMOVED",
        },
      });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "REMOVE_LISTING",
        targetType: "PRODUCT",
        targetId: productId,
        details: `Removed listing "${product.title}" by seller ${product.seller?.email}`,
      });

      return NextResponse.json({
        message: "Listing removed successfully",
        product: updatedProduct,
      });
    }

    if (action === "RESTORE") {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          status: "AVAILABLE",
        },
      });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "RESTORE_LISTING",
        targetType: "PRODUCT",
        targetId: productId,
        details: `Restored listing "${product.title}"`,
      });

      return NextResponse.json({
        message: "Listing restored successfully",
        product: updatedProduct,
      });
    }

    return NextResponse.json(
      { message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.log("ADMIN LISTINGS ACTION ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update listing" },
      { status: 500 }
    );
  }
}