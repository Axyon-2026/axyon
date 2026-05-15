import { prisma } from "@/lib/prisma";
import { getAdminUser, logAdminAction } from "@/lib/admin";
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

    const tickets = await prisma.supportTicket.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.log("ADMIN SUPPORT FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load support tickets" },
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

    const { ticketId, status } = await req.json();

    if (!ticketId || !status) {
      return NextResponse.json(
        { message: "Ticket ID and status are required" },
        { status: 400 }
      );
    }

    const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid ticket status" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        status,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "UPDATE_SUPPORT_TICKET_STATUS",
      targetType: "SUPPORT_TICKET",
      targetId: ticketId,
      details: `Changed support ticket status to ${status}`,
    });

    return NextResponse.json({
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    console.log("ADMIN SUPPORT UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update ticket" },
      { status: 500 }
    );
  }
}