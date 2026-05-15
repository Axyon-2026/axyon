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
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any =
      verifyToken(token);

    const user =
      await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (user.role !== "ADMIN") {
      if (
        user.studentVerificationStatus !==
        "APPROVED"
      ) {
        return NextResponse.json(
          {
            message:
              "You must complete student verification before listing products.",
          },
          {
            status: 403,
          }
        );
      }
    }

    const {
      title,
      description,
      price,
      category,
      condition,
      imageUrls,
    } = await req.json();

    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !condition
    ) {
      return NextResponse.json(
        {
          message:
            "All required fields must be filled",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await prisma.product.create({
        data: {
          title,
          description,
          price: Number(price),
          category,
          condition,
          imageUrls:
            imageUrls || [],
          sellerId: user.id,
          status: "AVAILABLE",
        },
      });

    return NextResponse.json({
      message:
        "Product listed successfully",
      product,
    });
  } catch (error) {
    console.log(
      "CREATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}