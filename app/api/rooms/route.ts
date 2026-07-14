import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { RoomType } from "@prisma/client";

async function uploadToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "axyon/rooms",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            college: true,
            studentVerified: true,
          },
        },
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.log("ROOM FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load rooms" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Please login first",
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

    if (user.role === "ADMIN") {
      return NextResponse.json(
        {
          message: "Admins cannot create room listings.",
        },
        {
          status: 403,
        }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        {
          message: "Your account is suspended.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      user.studentVerificationStatus !==
      "APPROVED"
    ) {
      return NextResponse.json(
        {
          message:
            "Student verification is required.",
        },
        {
          status: 403,
        }
      );
    }

    const formData =
      await req.formData();

    const title =
      String(formData.get("title") || "");

    const description =
      String(
        formData.get("description") || ""
      );

    const roomType =
      String(formData.get("roomType") || "");

    const rent =
      Number(formData.get("rent"));

    const deposit =
      Number(formData.get("deposit")) || 0;

    const address =
      String(formData.get("address") || "");

    const landmark =
      String(formData.get("landmark") || "");

    const college =
      String(formData.get("college") || "");

    const amenities =
      String(
        formData.get("amenities") || ""
      )
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const files =
      formData.getAll("images") as File[];

    const validFiles =
      files.filter(
        (file) =>
          file &&
          file.name &&
          file.size > 0
      );

    const imageUrls =
      await Promise.all(
        validFiles.map((file) =>
          uploadToCloudinary(file)
        )
      );

    if (
      !title ||
      !description ||
      !roomType ||
      !rent ||
      !address ||
      !college
    ) {
      return NextResponse.json(
        {
          message:
            "Please fill all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    const room =
      await prisma.room.create({
        data: {
          ownerId: user.id,

          title,

          description,

          roomType: roomType as RoomType,

          rent,

          deposit,

          address,

          landmark,

          college,

          amenities,

          imageUrls,

          status: "AVAILABLE",
        },
      });

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.log(
      "ROOM CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create room.",
      },
      {
        status: 500,
      }
    );
  }
}