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

    const users = await prisma.user.findMany();
    const products = await prisma.product.findMany();
    const orders = await prisma.order.findMany();
    const tickets = await prisma.supportTicket.findMany();
    const reports = await prisma.report.findMany();

    const categoryStats: Record<string, number> = {};

    let verifiedStudents = 0;
    let pendingStudentVerifications = 0;
    let suspendedUsers = 0;

    let activeListings = 0;
    let removedListings = 0;

    let pendingOrders = 0;
    let successfulOrders = 0;
    let cancelledOrders = 0;

    let openTickets = 0;
    let openReports = 0;

    for (const user of users) {
      if (user.studentVerified) verifiedStudents++;
      if (user.studentVerificationStatus === "PENDING") {
        pendingStudentVerifications++;
      }
      if (user.isSuspended) suspendedUsers++;
    }

    for (const product of products) {
      const category = product.category || "Uncategorized";
      categoryStats[category] = (categoryStats[category] || 0) + 1;

      if (product.status === "AVAILABLE") activeListings++;
      if (product.status === "REMOVED") removedListings++;
    }

    for (const order of orders) {
      if (order.paymentStatus === "PENDING") pendingOrders++;
      if (order.paymentStatus === "SUCCESS") successfulOrders++;
      if (order.paymentStatus === "CANCELLED") cancelledOrders++;
    }

    for (const ticket of tickets) {
      if (ticket.status === "OPEN") openTickets++;
    }

    for (const report of reports) {
      if (report.status === "OPEN") openReports++;
    }

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        verifiedStudents,
        pendingStudentVerifications,
        suspendedUsers,

        totalListings: products.length,
        activeListings,
        removedListings,

        totalOrders: orders.length,
        pendingOrders,
        successfulOrders,
        cancelledOrders,

        openTickets,
        openReports,
      },
      categoryStats,
    });
  } catch (error) {
    console.log("ADMIN ANALYTICS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load analytics" },
      { status: 500 }
    );
  }
}