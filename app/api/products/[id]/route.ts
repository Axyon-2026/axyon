import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            college: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.log("PRODUCT FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.sellerId !== decoded.id) {
      return NextResponse.json(
        { message: "You can edit only your own product" },
        { status: 403 }
      );
    }

    if (product.status !== "AVAILABLE") {
      return NextResponse.json(
        { message: "Only available products can be edited" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        productId: id,
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        {
          message:
            "This product has an active order. Editing is blocked until the order is resolved.",
        },
        { status: 400 }
      );
    }

    const { title, description, price, category, condition, imageUrls } =
      await req.json();

    if (!title || !description || !price || !category || !condition) {
      return NextResponse.json(
        { message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { message: "Please upload at least one product image" },
        { status: 400 }
      );
    }

    if (Number(price) <= 0) {
      return NextResponse.json(
        { message: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price: Number(price),
        category,
        condition,
        imageUrls,
      },
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log("PRODUCT UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.sellerId !== decoded.id) {
      return NextResponse.json(
        { message: "You can delete only your own product" },
        { status: 403 }
      );
    }

    if (product.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message:
            "This product cannot be deleted because it is already sold or removed.",
        },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        productId: id,
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        {
          message:
            "This product has an active order. Cancel or resolve the order before deleting.",
        },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { id },
      data: {
        status: "REMOVED",
      },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}