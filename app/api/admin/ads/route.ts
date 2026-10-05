import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { getAdminUser, logAdminAction } from "@/lib/admin";
import { NextResponse } from "next/server";

async function uploadToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "axyon/ads",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

/* =========================
   GET — LIST ADS
========================= */

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const ads = await prisma.adBanner.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("ADMIN ADS FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load ads" },
      { status: 500 }
    );
  }
}

/* =========================
   POST — CREATE AD
========================= */

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const contentType =
      req.headers.get("content-type") || "";

    let title = "";
    let description = "";
    let buttonText = "";
    let buttonLink = "";
    let badge = "";
    let emoji = "";
    let imageUrl = "";

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
      const formData = await req.formData();

      title = String(
        formData.get("title") || ""
      );

      description = String(
        formData.get("description") || ""
      );

      buttonText = String(
        formData.get("buttonText") || ""
      );

      buttonLink = String(
        formData.get("buttonLink") || ""
      );

      badge = String(
        formData.get("badge") || ""
      );

      emoji = String(
        formData.get("emoji") || ""
      );

      const image = formData.get(
        "image"
      ) as File | null;

      if (
        image &&
        image.name &&
        image.size > 0
      ) {
        if (
          !image.type.startsWith("image/")
        ) {
          return NextResponse.json(
            {
              message:
                "Only image files are allowed",
            },
            { status: 400 }
          );
        }

        if (
          image.size >
          5 * 1024 * 1024
        ) {
          return NextResponse.json(
            {
              message:
                "Ad image must be under 5MB",
            },
            { status: 400 }
          );
        }

        imageUrl =
          await uploadToCloudinary(image);
      }
    } else {
      const body = await req.json();

      title = body.title || "";
      description =
        body.description || "";
      buttonText =
        body.buttonText || "";
      buttonLink =
        body.buttonLink || "";
      badge = body.badge || "";
      emoji = body.emoji || "";
      imageUrl =
        body.imageUrl || "";
    }

    title = String(title).trim();
    description =
      String(description).trim();
    buttonText =
      String(buttonText).trim();
    buttonLink =
      String(buttonLink).trim();
    badge = String(badge).trim();
    emoji = String(emoji).trim();
    imageUrl =
      String(imageUrl).trim();

    if (!title || !description) {
      return NextResponse.json(
        {
          message:
            "Title and description are required",
        },
        { status: 400 }
      );
    }

    const ad =
      await prisma.adBanner.create({
        data: {
          title,
          description,
          buttonText:
            buttonText || null,
          buttonLink:
            buttonLink || null,
          badge:
            badge || "SPONSORED",
          emoji:
            emoji || "✨",
          imageUrl,
          isActive: true,
        },
      });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "CREATE_AD_BANNER",
      targetType: "AD",
      targetId: ad.id,
      details:
        `Created ad banner "${ad.title}"`,
    });

    return NextResponse.json({
      message:
        "Ad banner created successfully",
      ad,
    });
  } catch (error) {
    console.error(
      "ADMIN AD CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create ad banner",
      },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH — AD ACTIONS
========================= */

export async function PATCH(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const adId = body.adId;
    const action = body.action;

    if (!adId || !action) {
      return NextResponse.json(
        {
          message:
            "Ad ID and action are required",
        },
        { status: 400 }
      );
    }

    const existingAd =
      await prisma.adBanner.findUnique({
        where: {
          id: adId,
        },
      });

    if (!existingAd) {
      return NextResponse.json(
        {
          message:
            "Ad banner not found",
        },
        { status: 404 }
      );
    }

    /* REMOVE */

    if (action === "REMOVE") {
      const ad =
        await prisma.adBanner.update({
          where: {
            id: adId,
          },
          data: {
            isActive: false,
          },
        });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "REMOVE_AD_BANNER",
        targetType: "AD",
        targetId: adId,
        details:
          `Removed ad banner "${ad.title}"`,
      });

      return NextResponse.json({
        message:
          "Ad banner removed from homepage",
        ad,
      });
    }

    /* ACTIVATE */

    if (action === "ACTIVATE") {
      await prisma.adBanner.updateMany({
        where: {
          isActive: true,
          id: {
            not: adId,
          },
        },
        data: {
          isActive: false,
        },
      });

      const ad =
        await prisma.adBanner.update({
          where: {
            id: adId,
          },
          data: {
            isActive: true,
          },
        });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action:
          "ACTIVATE_AD_BANNER",
        targetType: "AD",
        targetId: adId,
        details:
          `Activated ad banner "${ad.title}"`,
      });

      return NextResponse.json({
        message:
          "Ad banner activated",
        ad,
      });
    }

    /* DELETE */

    if (action === "DELETE") {
      await prisma.adBanner.delete({
        where: {
          id: adId,
        },
      });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action:
          "DELETE_AD_BANNER",
        targetType: "AD",
        targetId: adId,
        details:
          `Deleted ad banner "${existingAd.title}"`,
      });

      return NextResponse.json({
        message:
          "Ad banner deleted permanently",
      });
    }

    return NextResponse.json(
      {
        message: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "ADMIN AD ACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update ad banner",
      },
      { status: 500 }
    );
  }
}