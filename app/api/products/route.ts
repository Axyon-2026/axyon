import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
          },
        },
      },
    });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.log("PRODUCTS FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { message: "Your account is suspended." },
        { status: 403 }
      );
    }

   if (user.role === "ADMIN") {
  return NextResponse.json(
    { message: "Admins cannot create marketplace listings." },
    { status: 403 }
  );
}

if (user.studentVerificationStatus !== "APPROVED") {
  return NextResponse.json(
    {
      message:
        "You must complete student verification before listing products.",
    },
    { status: 403 }
  );
}

    const {
      title,
      description,
      price,
      category,
      condition,
      imageUrls,
    } = await req.json();

    if (!title || !description || !price || !category || !condition) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        category,
        condition,
        imageUrls: imageUrls || [],
        sellerId: user.id,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json(
      {
        message: "Product listed successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}