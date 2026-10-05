import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        marketplaceType: true,
        studentVerified: true,
        isSuspended: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 401 },
      );
    }

    if (user.marketplaceType !== "CAMPUS") {
      return NextResponse.json(
        { error: "Home Tuition is available to Campus users only." },
        { status: 403 },
      );
    }

    if (!user.studentVerified || user.isSuspended) {
      return NextResponse.json(
        { error: "Your Campus account must be verified and active." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select an image." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadToCloudinary(
      buffer,
      "axyon/home-tuition/tutors",
    );

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Tutor photo upload error:", error);

    return NextResponse.json(
      { error: "Unable to upload photo." },
      { status: 500 },
    );
  }
}