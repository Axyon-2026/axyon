import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("axyon_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyToken(token);

    const formData =
      await req.formData();

    const collegeId =
      formData.get("collegeId") as File | null;

    const selfie =
      formData.get("selfie") as File | null;

    if (!collegeId || !selfie) {
      return NextResponse.json(
        {
          message:
            "College ID and selfie are required",
        },
        { status: 400 }
      );
    }

    const collegeIdImageUrl =
      collegeId.name;

    const selfieImageUrl =
      selfie.name;

    const updatedUser =
      await prisma.user.update({
        where: {
          id: decoded.id,
        },

        data: {
          collegeIdNumber: `ID-${Date.now()}`,

          collegeIdImageUrl,

          selfieImageUrl,

          studentVerified: false,

          studentVerificationStatus:
            "PENDING",
        },
      });

    await prisma.notification.create({
  data: {
    userId: decoded.id,
    title: "Verification Submitted",
    message:
      "Your student verification has been submitted successfully and is waiting for admin approval.",
    type: "STUDENT_VERIFICATION",
    isRead: false,
    link: "/student-verification",
  },
});
await resend.emails.send({
  from: "Axyon Verification <support@axyon.in>",
  to: "asa.axyon@gmail.com",

  subject: "New Student Verification Request",

  html: `
    <div style="font-family: Arial, sans-serif; padding: 24px;">

      <h2>New Student Verification Submitted</h2>

      <p>
        A new student verification request has been submitted on Axyon.
      </p>

      <hr />

      <p><strong>Name:</strong> ${updatedUser.name}</p>

      <p><strong>Email:</strong> ${updatedUser.email}</p>

      <p><strong>College:</strong> ${updatedUser.college || "Not added"}</p>

      <p><strong>User ID:</strong> ${updatedUser.id}</p>

      <p style="margin-top: 24px;">
        Review request in admin panel:
      </p>

      <a
        href="https://www.axyon.in/admin/users"
        style="
          display:inline-block;
          padding:12px 20px;
          background:#16a34a;
          color:white;
          border-radius:12px;
          text-decoration:none;
          font-weight:bold;
        "
      >
        Open Admin Verification Panel
      </a>

    </div>
  `,
});
    console.log(`
NEW VERIFICATION REQUEST

User ID: ${decoded.id}
Time: ${new Date().toISOString()}
`);

    return NextResponse.json({
      message:
        "Verification submitted successfully. Please wait for admin approval before accessing marketplace features.",

      user: updatedUser,

      selfieImageUrl,
    });

  } catch (error) {

    console.log(
      "STUDENT VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to submit verification",
      },
      { status: 500 }
    );
  }
}