import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
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

    const [
      users,
      products,
      orders,
      tickets,
      reports,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          role: true,
          studentVerified: true,
          studentVerificationStatus: true,
          marketplaceType: true,
          isSuspended: true,
        },
      }),

      prisma.product.findMany({
        select: {
          id: true,
          status: true,
          marketplaceType: true,
        },
      }),

      prisma.order.findMany({
        select: {
          id: true,
        },
      }),

      prisma.supportTicket.findMany({
        select: {
          id: true,
          status: true,
        },
      }),

      prisma.report.findMany({
        select: {
          id: true,
          status: true,
        },
      }),
    ]);

    /* ---------------- USERS ---------------- */

    const totalUsers = users.length;

    const verifiedUsers = users.filter(
      (user) =>
        user.studentVerified ||
        user.studentVerificationStatus === "APPROVED"
    ).length;

    const totalAdmins = users.filter(
      (user) => user.role === "ADMIN"
    ).length;

    const suspendedUsers = users.filter(
      (user) => user.isSuspended
    ).length;

    const activeUsers =
      totalUsers - suspendedUsers;

    const campusUsers = users.filter(
      (user) =>
        user.marketplaceType === "CAMPUS"
    ).length;

    const schoolUsers = users.filter(
      (user) =>
        user.marketplaceType === "SCHOOL"
    ).length;

    const pendingVerifications =
      users.filter(
        (user) =>
          user.studentVerificationStatus ===
          "PENDING"
      ).length;

    /* ---------------- PRODUCTS ---------------- */

    const totalProducts = products.length;

    const activeProducts = products.filter(
      (product) =>
        product.status === "AVAILABLE"
    ).length;

    const soldProducts = products.filter(
      (product) =>
        product.status === "SOLD"
    ).length;

    const removedProducts =
      products.filter(
        (product) =>
          product.status === "REMOVED"
      ).length;

    const campusProducts =
      products.filter(
        (product) =>
          product.marketplaceType === "CAMPUS"
      ).length;

    const schoolProducts =
      products.filter(
        (product) =>
          product.marketplaceType === "SCHOOL"
      ).length;

    /* ---------------- SUPPORT ---------------- */

    const totalSupportTickets =
      tickets.length;

    const openSupportTickets =
      tickets.filter(
        (ticket) =>
          ticket.status === "OPEN"
      ).length;

    const resolvedSupportTickets =
      tickets.filter(
        (ticket) =>
          ticket.status === "RESOLVED"
      ).length;

    /* ---------------- REPORTS ---------------- */

    const totalReports = reports.length;

    const openReports = reports.filter(
      (report) =>
        report.status === "OPEN"
    ).length;

    const resolvedReports =
      reports.filter(
        (report) =>
          report.status === "RESOLVED"
      ).length;

    /* ---------------- ANALYTICS ---------------- */

    const verificationRate =
      totalUsers > 0
        ? Math.round(
            (verifiedUsers / totalUsers) *
              100
          )
        : 0;

    return NextResponse.json({
      /* Existing response fields */

      totalUsers,
      totalProducts,
      totalOrders: orders.length,
      totalSupportTickets,
      totalReports,
      verifiedUsers,
      totalAdmins,
      openReports,
      openSupportTickets,

      /* Extended analytics */

      activeUsers,
      suspendedUsers,
      pendingVerifications,

      activeProducts,
      soldProducts,
      removedProducts,

      campusUsers,
      schoolUsers,

      campusProducts,
      schoolProducts,

      resolvedSupportTickets,
      resolvedReports,

      verificationRate,

      /* Page-compatible stats object */

      stats: {
        totalUsers,
        totalProducts,
        totalOrders: orders.length,

        totalSupportTickets,
        totalReports,

        verifiedUsers,
        totalAdmins,

        openReports,
        openSupportTickets,

        activeUsers,
        suspendedUsers,
        pendingVerifications,

        activeProducts,
        soldProducts,
        removedProducts,

        campusUsers,
        schoolUsers,

        campusProducts,
        schoolProducts,

        resolvedSupportTickets,
        resolvedReports,

        verificationRate,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN ANALYTICS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load analytics",
      },
      {
        status: 500,
      }
    );
  }
}