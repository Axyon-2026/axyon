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
      supportTickets,
      reports,
      ads,
    ] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          college: true,
          role: true,
          emailVerified: true,
          isVerified: true,
          studentVerified: true,
          studentVerificationStatus: true,
          isSuspended: true,
          strikeCount: true,
          createdAt: true,
        },
      }),

      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),

      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
      }),

      prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
      }),

      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
      }),

      prisma.adBanner.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalUsers = users.length;

    const totalAdmins = users.filter(
      (user) => user.role === "ADMIN"
    ).length;

    const verifiedUsers = users.filter(
      (user) =>
        user.studentVerified ||
        user.studentVerificationStatus === "APPROVED"
    ).length;

    const pendingVerifications = users.filter(
      (user) =>
        user.studentVerificationStatus === "PENDING"
    ).length;

    const suspendedUsers = users.filter(
      (user) => user.isSuspended
    ).length;

    const activeProducts = products.filter(
      (product) => product.status === "AVAILABLE"
    ).length;

    const soldProducts = products.filter(
      (product) => product.status === "SOLD"
    ).length;

    const removedProducts = products.filter(
      (product) => product.status === "REMOVED"
    ).length;

    const successfulOrders = orders.filter(
      (order) => order.paymentStatus === "SUCCESS"
    ).length;

    const pendingOrders = orders.filter(
      (order) => order.paymentStatus === "PENDING"
    ).length;

    const openTickets = supportTickets.filter(
      (ticket) => ticket.status === "OPEN"
    ).length;

    const openReports = reports.filter(
      (report) => report.status === "OPEN"
    ).length;

    const activeAds = ads.filter(
      (ad) => ad.isActive
    ).length;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAdmins,

        verifiedUsers,
        pendingVerifications,
        suspendedUsers,

        totalProducts: products.length,
        activeProducts,
        soldProducts,
        removedProducts,

        totalOrders: orders.length,
        successfulOrders,
        pendingOrders,

        totalSupportTickets: supportTickets.length,
        openTickets,

        totalReports: reports.length,
        openReports,

        totalAds: ads.length,
        activeAds,
      },

      users,
      products,
      orders,
      supportTickets,
      reports,
      ads,
    });
  } catch (error) {
    console.log("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load admin dashboard" },
      { status: 500 }
    );
  }
}