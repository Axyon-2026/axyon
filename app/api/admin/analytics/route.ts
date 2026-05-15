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

    for (const product of products) {
      const category = product.category || "Uncategorized";
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    }

    const stats = {
      totalUsers: users.length,
      verifiedStudents: users.filter((user) => user.studentVerified).length,
      pendingStudentVerifications: users.filter(
        (user) => user.studentVerificationStatus === "PENDING"
      ).length,
      suspendedUsers: users.filter((user) => user.isSuspended).length,

      totalListings: products.length,
      activeListings: products.filter(
        (product) => product.status === "AVAILABLE"
      ).length,
      removedListings: products.filter(
        (product) => product.status === "REMOVED"
      ).length,

      totalOrders: orders.length,
      pendingOrders: orders.filter(
        (order) => order.paymentStatus === "PENDING"
      ).length,
      successfulOrders: orders.filter(
        (order) => order.paymentStatus === "SUCCESS"
      ).length,
      cancelledOrders: orders.filter(
        (order) => order.paymentStatus === "CANCELLED"
      ).length,

      openTickets: tickets.filter((ticket) => ticket.status === "OPEN").length,
      openReports: reports.filter((report) => report.status === "OPEN").length,
    };

    return NextResponse.json({
      stats,
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