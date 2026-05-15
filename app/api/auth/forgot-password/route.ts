import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 }
      );
    }

    const resetToken = crypto.randomUUID();
    const resetExpiresAt = new Date(Date.now() + 1000 * 60 * 15);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetExpiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const { error } = await resend.emails.send({
      from: "Axyon <noreply@axyon.in>",
      to: email,
      subject: "Reset your Axyon password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Reset your Axyon password</h2>
          <p>Click the button below to reset your password.</p>
          <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;">
            Reset Password
          </a>
          <p>This link expires in 15 minutes.</p>
          <p>${resetLink}</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json(
        { message: "Reset email could not be sent" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}