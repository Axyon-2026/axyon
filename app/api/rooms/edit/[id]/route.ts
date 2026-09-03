import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { RoomType } from "@prisma/client";

type Params = Promise<{
  id: string;
}>;

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

export async function GET(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          message: "Accommodation not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.log("ROOM FETCH ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load accommodation.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("axyon_token")?.value;

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

    const decoded: any = verifyToken(token);

    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          message: "Accommodation not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (room.ownerId !== decoded.id) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message:
            "Only available accommodation can be edited.",
        },
        {
          status: 400,
        }
      );
    }

    const contentType =
      req.headers.get("content-type") || "";

    let title = room.title;
    let description = room.description;

    // IMPORTANT:
    // Keep this typed as Prisma RoomType.
    let roomType: RoomType = room.roomType;

    let rent = room.rent;
    let deposit = room.deposit ?? 0;
    let address = room.address;
    let landmark = room.landmark ?? "";
    let college = room.college;
    let contactNumber = room.contactNumber ?? "";
    let amenities = room.amenities;

    let existingImages = room.imageUrls;

    const newFiles: File[] = [];

    /*
     * FORM DATA UPDATE
     */

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      title = String(
        formData.get("title") || ""
      ).trim();

      description = String(
        formData.get("description") || ""
      ).trim();

      /*
       * Cast the incoming string to Prisma RoomType.
       */
      roomType = String(
        formData.get("roomType") || ""
      ) as RoomType;

      rent = Number(
        formData.get("rent")
      );

      const depositValue = formData.get("deposit");

      deposit =
        depositValue === null ||
        String(depositValue).trim() === ""
          ? 0
          : Number(depositValue);

      address = String(
        formData.get("address") || ""
      ).trim();

      landmark = String(
        formData.get("landmark") || ""
      ).trim();

      college = String(
        formData.get("college") || ""
      ).trim();

      contactNumber = String(
        formData.get("contactNumber") || ""
      ).trim();

      amenities = String(
        formData.get("amenities") || ""
      )
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const existingImagesValue = String(
        formData.get("existingImages") || "[]"
      );

      try {
        const parsed = JSON.parse(
          existingImagesValue
        );

        if (Array.isArray(parsed)) {
          existingImages = parsed.filter(
            (image): image is string =>
              typeof image === "string" &&
              image.trim().length > 0
          );
        }
      } catch {
        return NextResponse.json(
          {
            message: "Invalid image data.",
          },
          {
            status: 400,
          }
        );
      }

      const files = formData.getAll(
        "images"
      ) as File[];

      newFiles.push(
        ...files.filter(
          (file) =>
            file &&
            file.name &&
            file.size > 0
        )
      );
    }

    /*
     * JSON UPDATE
     *
     * Keep this so existing callers
     * don't break.
     */

    else {
      const body = await req.json();

      title =
        typeof body.title === "string"
          ? body.title.trim()
          : room.title;

      description =
        typeof body.description === "string"
          ? body.description.trim()
          : room.description;

      if (
        typeof body.roomType === "string"
      ) {
        roomType =
          body.roomType as RoomType;
      }

      rent = Number(body.rent);

      deposit =
        body.deposit === "" ||
        body.deposit === null ||
        body.deposit === undefined
          ? 0
          : Number(body.deposit);

      address =
        typeof body.address === "string"
          ? body.address.trim()
          : room.address;

      landmark =
        typeof body.landmark === "string"
          ? body.landmark.trim()
          : "";

      college =
        typeof body.college === "string"
          ? body.college.trim()
          : room.college;

      contactNumber =
        typeof body.contactNumber === "string"
          ? body.contactNumber.trim()
          : "";

      amenities = Array.isArray(
        body.amenities
      )
        ? body.amenities
            .map((item: unknown) =>
              String(item).trim()
            )
            .filter(Boolean)
        : room.amenities;

      if (
        Array.isArray(
          body.existingImages
        )
      ) {
        existingImages =
          body.existingImages.filter(
            (image: unknown): image is string =>
              typeof image === "string" &&
              image.trim().length > 0
          );
      }
    }

    /*
     * VALIDATION
     */

    const allowedRoomTypes: RoomType[] = [
      "SINGLE",
      "SHARED",
      "PG",
      "HOSTEL",
      "APARTMENT",
    ];

    if (!title) {
      return NextResponse.json(
        {
          message: "Title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          message: "Description is required.",
        },
        {
          status: 400,
        }
      );
    }

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

    if (
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

    /*
     * Remove duplicate existing images.
     */

    existingImages = Array.from(
      new Set(existingImages)
    );

    /*
     * Maximum 5 images total.
     */

    if (
      existingImages.length +
        newFiles.length >
      5
    ) {
      return NextResponse.json(
        {
          message:
            "You can have a maximum of 5 images.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * At least one image must remain.
     */

    if (
      existingImages.length === 0 &&
      newFiles.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Accommodation must have at least one image.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Upload newly added images.
     */

    const uploadedImages =
      newFiles.length > 0
        ? await Promise.all(
            newFiles.map((file) =>
              uploadToCloudinary(file)
            )
          )
        : [];

    const finalImages = [
      ...existingImages,
      ...uploadedImages,
    ];

    if (finalImages.length === 0) {
      return NextResponse.json(
        {
          message:
            "Accommodation must have at least one image.",
        },
        {
          status: 400,
        }
      );
    }

    if (finalImages.length > 5) {
      return NextResponse.json(
        {
          message:
            "You can have a maximum of 5 images.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * UPDATE
     */

    const updated =
      await prisma.room.update({
        where: {
          id,
        },
        data: {
          title,
          description,
          roomType,
          rent,
          deposit,
          address,
          landmark:
            landmark || null,
          college,
          contactNumber:
            contactNumber || null,
          amenities,
          imageUrls: finalImages,
        },
      });

    return NextResponse.json({
      success: true,
      room: updated,
    });
  } catch (error) {
    console.log(
      "ROOM UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update accommodation.",
      },
      {
        status: 500,
      }
    );
  }
}