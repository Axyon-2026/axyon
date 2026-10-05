import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 8 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Image must be 8MB or smaller" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadToCloudinary(
      buffer,
      "axyon/announcements"
    );

    if (!result?.secure_url) {
      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id ?? null,
    });
  } catch (error) {
    console.error(
      "Announcement image upload error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}