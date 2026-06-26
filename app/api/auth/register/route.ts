import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, phone, college, password } = body;

    if (!name || !email || !phone || !college || !password) {
      return NextResponse.json(
        { message: "Please fill all fields" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
  return NextResponse.json(
    {
      message:
        "Please enter a valid Indian mobile number",
    },
    {
      status: 400,
    }
  );
}
if (/^(\d)\1+$/.test(phone)) {
  return NextResponse.json(
    {
      message:
        "Invalid phone number",
    },
    {
      status: 400,
    }
  );
}

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        college,
        password: hashedPassword,
        verifyToken,
      },
    });

    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verifyToken}`;

    const { error } = await resend.emails.send({
      from: "Axyon <noreply@axyon.in>",
      to: email,
      subject: "Verify your Axyon account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Welcome to Axyon</h2>
          <p>Hi ${name},</p>
          <p>Click the button below to verify your email address.</p>

          <a 
            href="${verifyLink}" 
            style="display:inline-block;background:#2563eb;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;margin-top:12px;"
          >
            Verify Email
          </a>

          <p style="margin-top:20px;">If the button does not work, copy this link:</p>
          <p>${verifyLink}</p>
        </div>
      `,
    });

    if (error) {
      console.log("EMAIL ERROR:", error);

      return NextResponse.json(
        {
          message:
            "Account created, but verification email could not be sent. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          college: user.college,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}