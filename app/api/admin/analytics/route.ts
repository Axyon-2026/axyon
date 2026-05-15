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

    const categoryStats = products.reduce((acc: any, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        verifiedStudents: users.filter((u) => u.studentVerified).length,
        pendingStudentVerifications: users.filter(
          (u) => u.studentVerificationStatus === "PENDING"
        ).length,
        suspendedUsers: users.filter((u) => u.isSuspended).length,

        totalListings: products.length,
        activeListings: products.filter((p) => p.status === "AVAILABLE").length,
        removedListings: products.filter((p) => p.status === "REMOVED").length,

        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.paymentStatus === "PENDING")
          .length,
        successfulOrders: orders.filter((o) => o.paymentStatus === "SUCCESS")
          .length,
        cancelledOrders: orders.filter((o) => o.paymentStatus === "CANCELLED")
          .length,

        openTickets: tickets.filter((t) => t.status === "OPEN").length,
        openReports: reports.filter((r) => r.status === "OPEN").length,
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