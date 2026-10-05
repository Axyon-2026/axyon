import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getSchoolUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (
    !user ||
    user.role === "ADMIN" ||
    user.marketplaceType !== "SCHOOL" ||
    user.isSuspended ||
    user.schoolVerificationStatus !== "APPROVED" ||
    !user.schoolVerified
  ) {
    return null;
  }

  return user;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSchoolUser();

    if (!user) {
      return NextResponse.json(
        { message: "School Marketplace access required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        marketplaceType: "SCHOOL",
        status: "AVAILABLE",
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            schoolName: true,
            schoolCity: true,
            classLevel: true,
            schoolVerified: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "School Marketplace product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
      currentUserId: user.id,
    });
  } catch (error) {
    console.log("SCHOOL PRODUCT FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load School Marketplace product." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSchoolUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Approved School Marketplace account required.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        marketplaceType: "SCHOOL",
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          message: "School Marketplace product not found.",
        },
        { status: 404 }
      );
    }

    if (product.sellerId !== user.id) {
      return NextResponse.json(
        {
          message: "You can edit only your own listing.",
        },
        { status: 403 }
      );
    }

    if (product.status === "SOLD") {
      return NextResponse.json(
        {
          message: "Sold products cannot be edited.",
        },
        { status: 400 }
      );
    }

    if (product.status === "REMOVED") {
      return NextResponse.json(
        {
          message: "Removed listings cannot be edited.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const condition =
      typeof body.condition === "string"
        ? body.condition.trim()
        : "";

    const price = Number(body.price);

    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter(
          (url: unknown): url is string =>
            typeof url === "string" && url.trim().length > 0
        )
      : product.imageUrls;

    if (!title) {
      return NextResponse.json(
        { message: "Title is required." },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { message: "Description is required." },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { message: "Category is required." },
        { status: 400 }
      );
    }

    if (!condition) {
      return NextResponse.json(
        { message: "Condition is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { message: "Please enter a valid price." },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        title,
        description,
        price,
        category,
        condition,
        imageUrls,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully.",
      product: updated,
    });
  } catch (error) {
    console.log("SCHOOL PRODUCT UPDATE ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while updating the listing.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSchoolUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Approved School Marketplace account required.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        marketplaceType: "SCHOOL",
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          message: "School Marketplace product not found.",
        },
        { status: 404 }
      );
    }

    if (product.sellerId !== user.id) {
      return NextResponse.json(
        {
          message:
            "You can remove only your own listing.",
        },
        { status: 403 }
      );
    }

    if (product.status === "SOLD") {
      return NextResponse.json(
        {
          message:
            "Sold products cannot be removed.",
        },
        { status: 400 }
      );
    }

    if (product.status === "REMOVED") {
      return NextResponse.json(
        {
          message: "Listing already removed.",
        },
        { status: 400 }
      );
    }

    await prisma.conversation.updateMany({
      where: {
        productId: product.id,
        marketplaceType: "SCHOOL",
      },
      data: {
        isArchived: true,
      },
    });

    const updated = await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        status: "REMOVED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Listing removed successfully.",
      product: updated,
    });
  } catch (error) {
    console.log(
      "SCHOOL PRODUCT DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while removing the listing.",
      },
      { status: 500 }
    );
  }
}