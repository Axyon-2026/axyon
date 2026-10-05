import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getCampusUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        marketplaceType: true,
        isSuspended: true,
      },
    });

    if (!user || user.marketplaceType !== "CAMPUS") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const report = await prisma.report.findFirst({
      where: {
        id,
        reporterId: user.id,
      },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Home Tuition report GET error:", error);

    return NextResponse.json(
      { error: "Failed to load report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account is suspended" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const report = await prisma.report.findFirst({
      where: {
        id,
        reporterId: user.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.status !== "OPEN") {
      return NextResponse.json(
        { error: "Only open reports can be withdrawn" },
        { status: 400 }
      );
    }

    await prisma.report.update({
      where: { id },
      data: {
        status: "WITHDRAWN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report withdrawn successfully",
    });
  } catch (error) {
    console.error("Home Tuition report DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to withdraw report" },
      { status: 500 }
    );
  }
}