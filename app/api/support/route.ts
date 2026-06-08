import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first to contact support." },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { message: "Your account is suspended." },
        { status: 403 }
      );
    }

    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { message: "Please fill all fields" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        subject,
        message,
      },
    });

    await resend.emails.send({
      from: "Axyon Support <support@axyon.in>",
      to: user.email,
      subject: `Support Ticket Created - ${ticket.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>We received your support request</h2>
          <p>Hi ${user.name},</p>
          <p>Your support ticket has been created successfully.</p>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p>Our support team will review your issue and respond as soon as possible.</p>
          <p style="margin-top: 24px;">Thanks,<br/>Axyon Support Team</p>
        </div>
      `,
    });

    await resend.emails.send({
      from: "Axyon Support <support@axyon.in>",
      to: "asa.axyon@gmail.com",
      subject: `New Support Ticket - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>New Support Ticket Received</h2>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p style="margin-top: 24px;">
            Open admin panel: https://www.axyon.in/admin/support
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message: "Support ticket submitted successfully.",
        ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("SUPPORT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to submit support ticket" },
      { status: 500 }
    );
  }
}
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const decoded: any = verifyToken(token);

    const admin = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const { ticketId } = await req.json();

    if (!ticketId) {
      return NextResponse.json(
        { message: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: "RESOLVED",
      },
    });

    return NextResponse.json({
      message: "Ticket marked as resolved",
      ticket,
    });

  } catch (error) {

    console.log(
      "SUPPORT RESOLVE ERROR:",
      error
    );

    return NextResponse.json(
      { message: "Failed to resolve ticket" },
      { status: 500 }
    );
  }
}