import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function marketplaceGuard() {
  const cookieStore = await cookies();

  const token = cookieStore.get("axyon_token")?.value;

  if (!token) {
    return {
      allowed: false,
      reason: "LOGIN_REQUIRED",
      redirectTo: "/login",
    };
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return {
      allowed: false,
      reason: "INVALID_TOKEN",
      redirectTo: "/login",
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
      reason: "REGISTER_REQUIRED",
      redirectTo: "/register",
    };
  }

  if (user.isSuspended) {
    return {
      allowed: false,
      reason: "ACCOUNT_SUSPENDED",
      redirectTo: "/",
    };
  }

  if (!user.studentVerified) {
    return {
      allowed: false,
      reason: "VERIFICATION_REQUIRED",
      redirectTo: "/verification",
    };
  }

  return {
    allowed: true,
    user,
  };
}