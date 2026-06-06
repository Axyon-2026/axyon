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

    const totalUsers = users.length;
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalSupportTickets = tickets.length;
    const totalReports = reports.length;

    const verifiedUsers = users.filter(
      (user) =>
        user.studentVerified ||
        user.studentVerificationStatus === "APPROVED"
    ).length;

    const totalAdmins = users.filter(
      (user) => user.role === "ADMIN"
    ).length;

    const openReports = reports.filter(
      (report) => report.status === "OPEN"
    ).length;

    const openSupportTickets = tickets.filter(
      (ticket) => ticket.status === "OPEN"
    ).length;

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSupportTickets,
      totalReports,
      verifiedUsers,
      totalAdmins,
      openReports,
      openSupportTickets,

      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSupportTickets,
        totalReports,
        verifiedUsers,
        totalAdmins,
        openReports,
        openSupportTickets,
      },
    });
  } catch (error) {
    console.log("ADMIN ANALYTICS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load analytics" },
      { status: 500 }
    );
  }
}