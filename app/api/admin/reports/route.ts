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

    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      reports,
    });
  } catch (error) {
    console.log("ADMIN REPORTS FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load reports" },
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

    const { reportId, status } = await req.json();

    if (!reportId || !status) {
      return NextResponse.json(
        { message: "Report ID and status are required" },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "OPEN",
      "REVIEWING",
      "RESOLVED",
      "DISMISSED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid report status" },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "UPDATE_REPORT_STATUS",
      targetType: "REPORT",
      targetId: reportId,
      details: `Changed report status to ${status}`,
    });

    return NextResponse.json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.log("ADMIN REPORT UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update report" },
      { status: 500 }
    );
  }
}