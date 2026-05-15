import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const colleges = await prisma.college.findMany({
    where: {
      isApproved: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json({ colleges });
}