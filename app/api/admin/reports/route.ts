import { prisma } from "@/lib/prisma";
import { getAdminUser, logAdminAction } from "@/lib/admin";
import { NextResponse } from "next/server";

const ALLOWED_STATUSES = [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
] as const;

type ReportStatus = (typeof ALLOWED_STATUSES)[number];

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
    console.error(
      "ADMIN REPORTS FETCH ERROR:",
      error
    );

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

    const body = await req.json();

    const reportId =
      typeof body?.reportId === "string"
        ? body.reportId.trim()
        : "";

    const requestedStatus =
      typeof body?.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (!reportId || !requestedStatus) {
      return NextResponse.json(
        {
          message:
            "Report ID and status are required",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_STATUSES.includes(
        requestedStatus as ReportStatus
      )
    ) {
      return NextResponse.json(
        {
          message: "Invalid report status",
        },
        { status: 400 }
      );
    }

    const status =
      requestedStatus as ReportStatus;

    const existingReport =
      await prisma.report.findUnique({
        where: {
          id: reportId,
        },
      });

    if (!existingReport) {
      return NextResponse.json(
        {
          message: "Report not found",
        },
        { status: 404 }
      );
    }

    if (existingReport.status === status) {
      return NextResponse.json({
        message:
          "Report already has this status",
        report: existingReport,
      });
    }

    const report =
      await prisma.report.update({
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
      details:
        `Changed report status from ${existingReport.status} to ${status}`,
    });

    return NextResponse.json({
      message:
        "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error(
      "ADMIN REPORT UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to update report",
      },
      { status: 500 }
    );
  }
}