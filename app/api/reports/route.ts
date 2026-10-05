import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("axyon_token")?.value;

    let reporterId: string | null = null;
    let marketplaceType:
      | "SCHOOL"
      | "CAMPUS"
      | null = null;

    if (token) {
      try {
        const decoded: any =
          verifyToken(token);

        reporterId = decoded.id;

        const reporter =
          await prisma.user.findUnique({
            where: {
              id: decoded.id,
            },
            select: {
              marketplaceType: true,
              isSuspended: true,
            },
          });

        if (
          reporter?.isSuspended
        ) {
          return NextResponse.json(
            {
              message:
                "Your account is suspended.",
            },
            { status: 403 }
          );
        }

        if (
          reporter?.marketplaceType ===
          "SCHOOL"
        ) {
          marketplaceType = "SCHOOL";
        } else {
          marketplaceType = "CAMPUS";
        }
      } catch {
        reporterId = null;
      }
    }

    const body = await req.json();

    const targetType = String(
      body.targetType || ""
    ).toUpperCase();

    const targetId = String(
      body.targetId || ""
    ).trim();

    const reason = String(
      body.reason || ""
    ).trim();

    const details = String(
      body.details || ""
    ).trim();

    if (
      !targetType ||
      !targetId ||
      !reason
    ) {
      return NextResponse.json(
        {
          message:
            "Target, reason, and report type are required.",
        },
        { status: 400 }
      );
    }

    const allowedTargetTypes = [
      "USER",
      "PRODUCT",
      "ORDER",
      "CHAT",
    ];

    if (
      !allowedTargetTypes.includes(
        targetType
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid report type.",
        },
        { status: 400 }
      );
    }

    if (reason.length > 200) {
      return NextResponse.json(
        {
          message:
            "Report reason is too long.",
        },
        { status: 400 }
      );
    }

    if (details.length > 5000) {
      return NextResponse.json(
        {
          message:
            "Report details are too long.",
        },
        { status: 400 }
      );
    }

    let finalDetails = details;

    if (marketplaceType) {
      finalDetails =
        `[${marketplaceType} MARKETPLACE]\n\n${details}`;
    }

    const report =
      await prisma.report.create({
        data: {
          reporterId,
          targetType,
          targetId,
          reason,
          details: finalDetails,
        },
      });

    return NextResponse.json(
      {
        message:
          "Report submitted successfully.",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "REPORT CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to submit report.",
      },
      { status: 500 }
    );
  }
}