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

    const users = await prisma.user.findMany({
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
        createdAt: true,
      },
    });

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    const supportTickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
    });

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
    });

    let verifiedUsers = 0;
    let openTickets = 0;
    let openReports = 0;

    for (const user of users) {
      if (user.emailVerified) verifiedUsers++;
    }

    for (const ticket of supportTickets) {
      if (ticket.status === "OPEN") openTickets++;
    }

    for (const report of reports) {
      if (report.status === "OPEN") openReports++;
    }

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        verifiedUsers,
        openTickets,
        openReports,
      },
      users,
      products,
      orders,
      supportTickets,
      reports,
    });
  } catch (error) {
    console.log("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load admin dashboard" },
      { status: 500 }
    );
  }
}