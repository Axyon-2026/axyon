import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token);

    if (!decoded?.id || decoded.role !== "ADMIN") {
      return null;
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return null;
    }

    return admin;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const students = await prisma.user.findMany({
      where: {
        marketplaceType: "SCHOOL",
      },
      select: {
        id: true,
        name: true,
        email: true,
        schoolName: true,
        schoolCity: true,
        classLevel: true,
        schoolStudentPhotoUrl: true,
        schoolIdImageUrl: true,
        schoolVerificationStatus: true,
        schoolVerified: true,
        isSuspended: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pending = students.filter(
      (student) =>
        student.schoolVerificationStatus === "PENDING"
    ).length;

    const approved = students.filter(
      (student) =>
        student.schoolVerificationStatus === "APPROVED" &&
        student.schoolVerified
    ).length;

    const rejected = students.filter(
      (student) =>
        student.schoolVerificationStatus === "REJECTED" ||
        (!student.schoolVerified &&
          student.schoolVerificationStatus !== "PENDING")
    ).length;

    const suspended = students.filter(
      (student) => student.isSuspended
    ).length;

    return NextResponse.json({
      students,
      stats: {
        total: students.length,
        pending,
        approved,
        rejected,
        suspended,
      },
    });
  } catch (error) {
    console.error(
      "SCHOOL VERIFICATION GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load School Marketplace users.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const userId = String(
      body.userId || ""
    ).trim();

    const action = String(
      body.action || ""
    )
      .trim()
      .toUpperCase();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (
      ![
        "APPROVE",
        "REJECT",
        "SUSPEND",
        "UNSUSPEND",
      ].includes(action)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid School Marketplace action.",
        },
        { status: 400 }
      );
    }

    const student =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!student) {
      return NextResponse.json(
        {
          error:
            "School student account not found.",
        },
        { status: 404 }
      );
    }

    if (
      student.marketplaceType !== "SCHOOL"
    ) {
      return NextResponse.json(
        {
          error:
            "This is not a School Marketplace account.",
        },
        { status: 400 }
      );
    }

    if (action === "SUSPEND") {
      const updatedStudent =
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isSuspended: true,
          },
          select: {
            id: true,
            name: true,
            email: true,
            schoolVerificationStatus: true,
            schoolVerified: true,
            isSuspended: true,
          },
        });

      await prisma.adminLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: "SUSPENDED SCHOOL STUDENT",
          targetType: "SCHOOL_USER",
          targetId: student.id,
          details: `Suspended School Marketplace account for ${student.name} (${student.email}).`,
        },
      });

      return NextResponse.json({
        message:
          "School student suspended.",
        student: updatedStudent,
      });
    }

    if (action === "UNSUSPEND") {
      const updatedStudent =
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isSuspended: false,
          },
          select: {
            id: true,
            name: true,
            email: true,
            schoolVerificationStatus: true,
            schoolVerified: true,
            isSuspended: true,
          },
        });

      await prisma.adminLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action:
            "UNSUSPENDED SCHOOL STUDENT",
          targetType: "SCHOOL_USER",
          targetId: student.id,
          details: `Unsuspended School Marketplace account for ${student.name} (${student.email}).`,
        },
      });

      return NextResponse.json({
        message:
          "School student unsuspended.",
        student: updatedStudent,
      });
    }

    if (student.isSuspended) {
      return NextResponse.json(
        {
          error:
            "Unsuspend this School account before changing verification.",
        },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      if (
        !student.schoolIdImageUrl ||
        !student.schoolStudentPhotoUrl
      ) {
        return NextResponse.json(
          {
            error:
              "Student verification documents are incomplete. Both the student photo and school ID are required.",
          },
          { status: 400 }
        );
      }

      const updatedStudent =
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            schoolVerificationStatus:
              "APPROVED",
            schoolVerified: true,
          },
          select: {
            id: true,
            name: true,
            email: true,
            schoolName: true,
            schoolCity: true,
            classLevel: true,
            schoolVerificationStatus: true,
            schoolVerified: true,
            isSuspended: true,
          },
        });

      await prisma.adminLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action:
            "APPROVED SCHOOL STUDENT",
          targetType: "SCHOOL_USER",
          targetId: student.id,
          details: `Approved School Marketplace verification for ${student.name} (${student.email}).`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: student.id,
          title:
            "School Account Approved",
          message:
            "Your School Marketplace verification has been approved. You can now enter the School Marketplace.",
          type:
            "SCHOOL_VERIFICATION_APPROVED",
          link:
            "/school-marketplace/home",
        },
      });

      try {
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from:
              "Axyon Support <support@axyon.in>",
            to: student.email,
            subject:
              "Your Axyon School Account Has Been Approved",
            html: `
              <div style="font-family:Arial,sans-serif;padding:24px;color:#111827;line-height:1.6">
                <h2>School Account Approved</h2>
                <p>Hi ${student.name},</p>
                <p>
                  Your Axyon School Marketplace verification has been
                  <strong>approved</strong>.
                </p>
                <p>
                  You can now log in and access the School Marketplace.
                </p>
                <p style="margin-top:24px">
                  Thanks,<br/>
                  Axyon Team
                </p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error(
          "SCHOOL APPROVAL EMAIL ERROR:",
          emailError
        );
      }

      return NextResponse.json({
        message:
          "School student approved successfully.",
        student: updatedStudent,
      });
    }

    const updatedStudent =
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          schoolVerificationStatus:
            "REJECTED",
          schoolVerified: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          schoolName: true,
          schoolCity: true,
          classLevel: true,
          schoolVerificationStatus: true,
          schoolVerified: true,
          isSuspended: true,
        },
      });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action:
          "REJECTED SCHOOL STUDENT",
        targetType: "SCHOOL_USER",
        targetId: student.id,
        details: `Rejected School Marketplace verification for ${student.name} (${student.email}).`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: student.id,
        title:
          "School Verification Update",
        message:
          "Your School Marketplace verification was not approved. Please review your information and contact Axyon support if you need help.",
        type:
          "SCHOOL_VERIFICATION_REJECTED",
        link:
          "/school-marketplace",
      },
    });

    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from:
            "Axyon Support <support@axyon.in>",
          to: student.email,
          subject:
            "Axyon School Verification Update",
          html: `
            <div style="font-family:Arial,sans-serif;padding:24px;color:#111827;line-height:1.6">
              <h2>School Verification Update</h2>
              <p>Hi ${student.name},</p>
              <p>
                Your Axyon School Marketplace verification request was
                <strong>not approved</strong>.
              </p>
              <p>
                Please review your submitted information and documents.
                If you need assistance, please contact Axyon Support.
              </p>
              <p style="margin-top:24px">
                Thanks,<br/>
                Axyon Support Team
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error(
        "SCHOOL REJECTION EMAIL ERROR:",
        emailError
      );
    }

    return NextResponse.json({
      message:
        "School student rejected.",
      student: updatedStudent,
    });
  } catch (error) {
    console.error(
      "SCHOOL VERIFICATION PATCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update School Marketplace user.",
      },
      { status: 500 }
    );
  }
}