import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type SchoolGuardResult =
  | {
      allowed: true;
      user: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>;
    }
  | {
      allowed: false;
      reason: string;
      redirectTo: string;
    };

export async function schoolMarketplaceGuard(): Promise<SchoolGuardResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) {
    return {
      allowed: false,
      reason: "LOGIN_REQUIRED",
      redirectTo: "/school-marketplace/login",
    };
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return {
      allowed: false,
      reason: "INVALID_TOKEN",
      redirectTo: "/school-marketplace/login",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user) {
    return {
      allowed: false,
      reason: "ACCOUNT_NOT_FOUND",
      redirectTo: "/school-marketplace",
    };
  }

  if (user.marketplaceType !== "SCHOOL") {
    return {
      allowed: false,
      reason: "WRONG_MARKETPLACE",
      redirectTo: "/",
    };
  }

  if (user.isSuspended) {
    return {
      allowed: false,
      reason: "ACCOUNT_SUSPENDED",
      redirectTo: "/school-marketplace",
    };
  }

  if (
    user.schoolVerificationStatus !== "APPROVED" ||
    !user.schoolVerified
  ) {
    return {
      allowed: false,
      reason: "VERIFICATION_REQUIRED",
      redirectTo: "/school-marketplace",
    };
  }

  return {
    allowed: true,
    user,
  };
}