import { prisma } from "@/lib/prisma";
import {
  getAdminUser,
  logAdminAction,
} from "@/lib/admin";
import { NextResponse } from "next/server";

const ALLOWED_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

type SupportTicketStatus =
  (typeof ALLOWED_STATUSES)[number];

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin access only",
        },
        {
          status: 403,
        }
      );
    }

    const tickets =
      await prisma.supportTicket.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      tickets,
    });
  } catch (error) {
    console.error(
      "ADMIN SUPPORT FETCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load support tickets",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin access only",
        },
        {
          status: 403,
        }
      );
    }

    const body = await req.json();

    const ticketId =
      typeof body?.ticketId === "string"
        ? body.ticketId.trim()
        : "";

    const requestedStatus =
      typeof body?.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (!ticketId || !requestedStatus) {
      return NextResponse.json(
        {
          message:
            "Ticket ID and status are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ALLOWED_STATUSES.includes(
        requestedStatus as SupportTicketStatus
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid ticket status",
        },
        {
          status: 400,
        }
      );
    }

    const status =
      requestedStatus as SupportTicketStatus;

    const existingTicket =
      await prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!existingTicket) {
      return NextResponse.json(
        {
          message:
            "Support ticket not found",
        },
        {
          status: 404,
        }
      );
    }

    if (existingTicket.status === status) {
      return NextResponse.json({
        message:
          "Ticket already has this status",
        ticket: existingTicket,
      });
    }

    const ticket =
      await prisma.supportTicket.update({
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
      action:
        "UPDATE_SUPPORT_TICKET_STATUS",
      targetType: "SUPPORT_TICKET",
      targetId: ticketId,
      details:
        `Changed support ticket status from ${existingTicket.status} to ${status}`,
    });

    return NextResponse.json({
      message:
        "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    console.error(
      "ADMIN SUPPORT UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update ticket",
      },
      {
        status: 500,
      }
    );
  }
}