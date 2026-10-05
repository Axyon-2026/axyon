import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, logAdminAction } from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const body = await request.json();
    const status = String(body.status || "")
      .trim()
      .toUpperCase();

    if (!["OPEN", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json(
        {
          error: "Status must be RESOLVED or DISMISSED",
        },
        { status: 400 },
      );
    }

    const report = await prisma.report.findUnique({
      where: {
        id,
      },
    });

    if (!report) {
      return NextResponse.json(
        {
          error: "Report not found",
        },
        { status: 404 },
      );
    }

    if (report.status === "WITHDRAWN") {
      return NextResponse.json(
        {
          error: "Withdrawn reports cannot be changed",
        },
        { status: 400 },
      );
    }

    if (report.status === status) {
      return NextResponse.json({
        success: true,
        report,
      });
    }

    const updatedReport = await prisma.report.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action:
        status === "RESOLVED"
          ? "HOME_TUITION_REPORT_RESOLVED"
          : status === "DISMISSED"
            ? "HOME_TUITION_REPORT_DISMISSED"
            : "HOME_TUITION_REPORT_REOPENED",
      targetType: "HOME_TUITION_REPORT",
      targetId: report.id,
      details: `Report ${report.id} changed from ${report.status} to ${status}. Target type: ${report.targetType}, target ID: ${report.targetId}.`,
    });

    return NextResponse.json({
      success: true,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Admin Home Tuition report PATCH error:", error);

    return NextResponse.json(
      {
        error: "Failed to update report",
      },
      { status: 500 },
    );
  }
}
