import { prisma } from "@/lib/prisma";
import { getAdminUser, logAdminAction } from "@/lib/admin";
import { NextResponse } from "next/server";

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
    console.log("ADMIN ADS FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load ads" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      buttonText,
      buttonLink,
      badge,
      emoji,
    } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    await prisma.adBanner.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const ad = await prisma.adBanner.create({
      data: {
        title,
        description,
        buttonText: buttonText || "Learn More",
        buttonLink: buttonLink || "/support",
        badge: badge || "SPONSORED",
        emoji: emoji || "✨",
        isActive: true,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "CREATE_AD_BANNER",
      targetType: "AD",
      targetId: ad.id,
      details: `Created ad banner "${ad.title}"`,
    });

    return NextResponse.json({
      message: "Ad banner created successfully",
      ad,
    });
  } catch (error) {
    console.log("ADMIN AD CREATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create ad banner" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const { adId, action } = await req.json();

    if (!adId || !action) {
      return NextResponse.json(
        { message: "Ad ID and action are required" },
        { status: 400 }
      );
    }

    if (action === "REMOVE") {
      const ad = await prisma.adBanner.update({
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
        details: `Removed ad banner "${ad.title}"`,
      });

      return NextResponse.json({
        message: "Ad banner removed from homepage",
        ad,
      });
    }

    if (action === "ACTIVATE") {
      await prisma.adBanner.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      const ad = await prisma.adBanner.update({
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
        action: "ACTIVATE_AD_BANNER",
        targetType: "AD",
        targetId: adId,
        details: `Activated ad banner "${ad.title}"`,
      });

      return NextResponse.json({
        message: "Ad banner activated",
        ad,
      });
    }

    return NextResponse.json(
      { message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.log("ADMIN AD ACTION ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update ad banner" },
      { status: 500 }
    );
  }
}