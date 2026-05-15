import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("axyon_token")?.value;

    let reporterId: string | null = null;

    if (token) {
      try {
        const decoded: any = verifyToken(token);
        reporterId = decoded.id;
      } catch {
        reporterId = null;
      }
    }

    const { targetType, targetId, reason, details } = await req.json();

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { message: "Target, reason, and report type are required" },
        { status: 400 }
      );
    }

    const allowedTargetTypes = ["USER", "PRODUCT", "ORDER", "CHAT"];

    if (!allowedTargetTypes.includes(targetType)) {
      return NextResponse.json(
        { message: "Invalid report type" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason,
        details,
      },
    });

    return NextResponse.json(
      {
        message: "Report submitted successfully",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("REPORT CREATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to submit report" },
      { status: 500 }
    );
  }
}