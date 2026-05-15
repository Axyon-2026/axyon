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

    let userId: string | null = null;

    if (token) {
      try {
        const decoded: any = verifyToken(token);
        userId = decoded.id;
      } catch {
        userId = null;
      }
    }

    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "Please fill all fields" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        name,
        email,
        subject,
        message,
      },
    });

    await resend.emails.send({
      from: "Axyon Support <support@axyon.in>",
      to: email,
      subject: `Support Ticket Created - ${ticket.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>We received your support request</h2>
          <p>Hi ${name},</p>
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
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>

          <hr/>

          <p><strong>Message:</strong></p>
          <p>${message}</p>

          <p style="margin-top: 24px;">
            Open admin panel: http://localhost:3000/admin/support
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message: "Support ticket submitted successfully. Confirmation email sent.",
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