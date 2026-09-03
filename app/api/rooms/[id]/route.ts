import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Params = Promise<{
  id: string;
}>;

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
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            college: true,
            studentVerified: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          message: "Room not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      room,
    });
  } catch (error) {
    console.log("ROOM DETAILS ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load room",
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

    const decoded: any = verifyToken(token);

    const { id } = await params;

    const room =
      await prisma.room.findUnique({
        where: {
          id,
        },
      });

    if (!room) {
      return NextResponse.json(
        {
          message:
            "Accommodation not found.",
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

    const body = await req.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const roomType =
      typeof body.roomType === "string"
        ? body.roomType
        : "";

    const rent = Number(body.rent);

    const deposit =
      body.deposit === "" ||
      body.deposit === null ||
      body.deposit === undefined
        ? 0
        : Number(body.deposit);

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    const landmark =
      typeof body.landmark === "string"
        ? body.landmark.trim()
        : "";

    const college =
      typeof body.college === "string"
        ? body.college.trim()
        : "";

    const contactNumber =
      typeof body.contactNumber === "string"
        ? body.contactNumber.trim()
        : "";

    const amenities = Array.isArray(
      body.amenities
    )
      ? body.amenities
          .map((item: unknown) =>
            String(item).trim()
          )
          .filter(Boolean)
      : [];

    const allowedRoomTypes = [
      "SINGLE",
      "SHARED",
      "PG",
      "HOSTEL",
      "APARTMENT",
    ];

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

    if (!allowedRoomTypes.includes(roomType)) {
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

    if (!Number.isFinite(rent) || rent < 1) {
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
     * Keep the existing images untouched here.
     *
     * Image replacement/removal will be handled
     * separately in the edit UI/API so existing
     * listings do not accidentally lose images.
     */
    const updated =
      await prisma.room.update({
        where: {
          id,
        },
        data: {
          title,
          description,
          roomType: roomType as any,
          rent,
          deposit,
          address,
          landmark:
            landmark || null,
          college,
          contactNumber:
            contactNumber || null,
          amenities,
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