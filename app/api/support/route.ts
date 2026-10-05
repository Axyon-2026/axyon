import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  try {
    const decoded: any = verifyToken(token);

    return await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Please login first to contact support.",
        },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        {
          message:
            "Your account is suspended.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!subject || !message) {
      return NextResponse.json(
        {
          message:
            "Please fill all fields.",
        },
        { status: 400 }
      );
    }

    if (subject.length > 150) {
      return NextResponse.json(
        {
          message:
            "Subject is too long.",
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          message:
            "Message is too long. Please keep it under 5000 characters.",
        },
        { status: 400 }
      );
    }

    const marketplace =
      user.marketplaceType === "SCHOOL"
        ? "SCHOOL MARKETPLACE"
        : "CAMPUS MARKETPLACE";

    const ticketMessage = `[${marketplace}]\n\n${message}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        subject,
        message: ticketMessage,
      },
    });

    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "Axyon Support <support@axyon.in>",
          to: user.email,
          subject: `Support Ticket Created - ${ticket.id}`,
          html: `
            <div style="font-family:Arial,sans-serif;padding:24px;color:#111827">
              <h2>We received your support request</h2>
              <p>Hi ${user.name},</p>
              <p>Your support ticket has been created successfully.</p>

              <p>
                <strong>Ticket ID:</strong>
                ${ticket.id}
              </p>

              <p>
                <strong>Marketplace:</strong>
                ${marketplace}
              </p>

              <p>
                <strong>Subject:</strong>
                ${subject}
              </p>

              <p>
                Our support team will review your issue and respond as soon as possible.
              </p>

              <p style="margin-top:24px">
                Thanks,<br/>
                Axyon Support Team
              </p>
            </div>
          `,
        });

        await resend.emails.send({
          from: "Axyon Support <support@axyon.in>",
          to: "asa.axyon@gmail.com",
          subject: `New ${marketplace} Support Ticket - ${subject}`,
          html: `
            <div style="font-family:Arial,sans-serif;padding:24px;color:#111827">
              <h2>New Support Ticket Received</h2>

              <p>
                <strong>Ticket ID:</strong>
                ${ticket.id}
              </p>

              <p>
                <strong>Marketplace:</strong>
                ${marketplace}
              </p>

              <p>
                <strong>Name:</strong>
                ${user.name}
              </p>

              <p>
                <strong>Email:</strong>
                ${user.email}
              </p>

              <p>
                <strong>Subject:</strong>
                ${subject}
              </p>

              <hr/>

              <p><strong>Message:</strong></p>

              <p style="white-space:pre-wrap">
                ${message}
              </p>

              <p style="margin-top:24px">
                Open Admin Support:
                https://www.axyon.in/admin/support
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error(
        "SUPPORT EMAIL ERROR:",
        emailError
      );
      // Ticket is already saved, so email failure
      // must not make the support request fail.
    }

    return NextResponse.json(
      {
        message:
          "Support ticket submitted successfully.",
        ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "SUPPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to submit support ticket.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Admin access only.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const ticketId = String(
      body.ticketId || ""
    ).trim();

    if (!ticketId) {
      return NextResponse.json(
        {
          message:
            "Ticket ID is required.",
        },
        { status: 400 }
      );
    }

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
            "Support ticket not found.",
        },
        { status: 404 }
      );
    }

    const ticket =
      await prisma.supportTicket.update({
        where: {
          id: ticketId,
        },
        data: {
          status: "RESOLVED",
        },
      });

    return NextResponse.json({
      message:
        "Ticket marked as resolved.",
      ticket,
    });
  } catch (error) {
    console.error(
      "SUPPORT RESOLVE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to resolve ticket.",
      },
      { status: 500 }
    );
  }
}