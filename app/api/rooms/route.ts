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
      {
        message: "Failed to load rooms",
      },
      {
        status: 500,
      }
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

    const decoded: any = verifyToken(token);

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
          message:
            "Admins cannot create room listings.",
        },
        {
          status: 403,
        }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        {
          message:
            "Your account is suspended.",
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
      String(
        formData.get("title") || ""
      ).trim();

    const description =
      String(
        formData.get("description") || ""
      ).trim();

    const roomType =
      String(
        formData.get("roomType") || ""
      );

    const rent =
      Number(formData.get("rent"));

    const depositValue =
      formData.get("deposit");

    const deposit =
      depositValue === null ||
      String(depositValue).trim() === ""
        ? 0
        : Number(depositValue);

    const address =
      String(
        formData.get("address") || ""
      ).trim();

    const landmark =
      String(
        formData.get("landmark") || ""
      ).trim();

    const college =
      String(
        formData.get("college") || ""
      ).trim();

    const contactNumber =
      String(
        formData.get("contactNumber") || ""
      ).trim();

    const amenities =
      String(
        formData.get("amenities") || ""
      )
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const files =
      formData.getAll(
        "images"
      ) as File[];

    const validFiles =
      files.filter(
        (file) =>
          file &&
          file.name &&
          file.size > 0
      );

    /*
     * Required listing fields.
     */

    if (!title) {
      return NextResponse.json(
        {
          message:
            "Title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          message:
            "Description is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!roomType) {
      return NextResponse.json(
        {
          message:
            "Accommodation type is required.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedRoomTypes = [
      "SINGLE",
      "SHARED",
      "PG",
      "HOSTEL",
      "APARTMENT",
    ];

    if (
      !allowedRoomTypes.includes(
        roomType
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid accommodation type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(rent) ||
      rent < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Monthly rent must be at least ₹1.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(deposit) ||
      deposit < 0
    ) {
      return NextResponse.json(
        {
          message:
            "Deposit cannot be negative.",
        },
        {
          status: 400,
        }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          message:
            "Address is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!college) {
      return NextResponse.json(
        {
          message:
            "College is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Accommodation must have at least
     * one image and cannot exceed five.
     */

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          message:
            "Please upload at least one image.",
        },
        {
          status: 400,
        }
      );
    }

    if (validFiles.length > 5) {
      return NextResponse.json(
        {
          message:
            "You can upload a maximum of 5 images.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Contact number is optional.
     * If supplied, keep it as listing-specific
     * contact information.
     */

    if (
      contactNumber &&
      contactNumber.length > 30
    ) {
      return NextResponse.json(
        {
          message:
            "Contact number is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const imageUrls =
      await Promise.all(
        validFiles.map((file) =>
          uploadToCloudinary(file)
        )
      );

    const room =
      await prisma.room.create({
        data: {
          ownerId: user.id,

          title,

          description,

          roomType:
            roomType as RoomType,

          rent,

          deposit,

          address,

          landmark:
            landmark || null,

          college,

          contactNumber:
            contactNumber || null,

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