import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim().toUpperCase();
    const targetType = searchParams.get("targetType")?.trim().toUpperCase();

    const where: {
      status?: string;
      targetType?: string;
    } = {};

    if (status) {
      where.status = status;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    const reports = await prisma.report.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

    const reporterIds = Array.from(
      new Set(
        reports
          .map((report) => report.reporterId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const tutorIds = Array.from(
      new Set(
        reports
          .filter((report) => report.targetType === "TUTOR")
          .map((report) => report.targetId),
      ),
    );

    const reviewIds = Array.from(
      new Set(
        reports
          .filter((report) => report.targetType === "TUTOR_REVIEW")
          .map((report) => report.targetId),
      ),
    );

    const [reporters, tutors, reviews] = await Promise.all([
      reporterIds.length
        ? prisma.user.findMany({
            where: {
              id: {
                in: reporterIds,
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
              marketplaceType: true,
              isSuspended: true,
            },
          })
        : [],

      tutorIds.length
        ? prisma.tutorProfile.findMany({
            where: {
              id: {
                in: tutorIds,
              },
            },
            select: {
              id: true,
              displayName: true,
              photoUrl: true,
              institution: true,
              college: true,
              status: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  isSuspended: true,
                },
              },
            },
          })
        : [],

      reviewIds.length
        ? prisma.tutorReview.findMany({
            where: {
              id: {
                in: reviewIds,
              },
            },
            select: {
              id: true,
              rating: true,
              comment: true,
              isPublished: true,
              isRemoved: true,
              createdAt: true,
              tutorProfile: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          })
        : [],
    ]);

    const reporterMap = new Map(
      reporters.map((reporter) => [reporter.id, reporter]),
    );

    const tutorMap = new Map(
      tutors.map((tutor) => [tutor.id, tutor]),
    );

    const reviewMap = new Map(
      reviews.map((review) => [review.id, review]),
    );

    const enrichedReports = reports.map((report) => {
      const tutor =
        report.targetType === "TUTOR"
          ? tutorMap.get(report.targetId) ?? null
          : null;

      const review =
        report.targetType === "TUTOR_REVIEW"
          ? reviewMap.get(report.targetId) ?? null
          : null;

      return {
        id: report.id,
        targetType: report.targetType,
        targetId: report.targetId,
        reason: report.reason,
        details: report.details,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        reporter: report.reporterId
          ? reporterMap.get(report.reporterId) ?? null
          : null,
        tutor,
        review,
        target: tutor ?? review,
      };
    });

    const counts = {
      total: reports.length,
      open: reports.filter((report) => report.status === "OPEN").length,
      resolved: reports.filter((report) => report.status === "RESOLVED")
        .length,
      dismissed: reports.filter((report) => report.status === "DISMISSED")
        .length,
      withdrawn: reports.filter((report) => report.status === "WITHDRAWN")
        .length,
    };

    return NextResponse.json({
      reports: enrichedReports,
      counts,
    });
  } catch (error) {
    console.error("Admin Home Tuition reports GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to load Home Tuition reports",
      },
      { status: 500 },
    );
  }
}
