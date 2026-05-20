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
            studentVerified: true,
          },
        },
      },
    });

    return NextResponse.json({ products });
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
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Admins cannot list marketplace products." },
        { status: 403 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { message: "Your account is suspended." },
        { status: 403 }
      );
    }

    if (user.studentVerificationStatus !== "APPROVED") {
      return NextResponse.json(
        { message: "Please complete student verification before listing." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      title,
      description,
      price,
      category,
      condition,
      imageUrls,
    } = body;

    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { message: "Title must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { message: "Please provide a proper description." },
        { status: 400 }
      );
    }

    if (!price || Number(price) < 1) {
      return NextResponse.json(
        { message: "Price must be at least ₹1." },
        { status: 400 }
      );
    }

    if (Number(price) > 500000) {
      return NextResponse.json(
        { message: "Price cannot exceed ₹5,00,000." },
        { status: 400 }
      );
    }

    if (!category || !condition) {
      return NextResponse.json(
        { message: "Category and condition are required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        condition,
        imageUrls: imageUrls || [],
        status: "AVAILABLE",
        sellerId: user.id,
      },
    });

    return NextResponse.json({
      message: "Product listed successfully",
      product,
    });
  } catch (error) {
    console.log("PRODUCT CREATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}