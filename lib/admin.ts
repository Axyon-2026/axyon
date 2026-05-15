import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const ADMIN_EMAIL = "asa.axyon@gmail.com";

export async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  const decoded: any = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user) return null;

  if (user.role !== "ADMIN") return null;

  if (user.email !== ADMIN_EMAIL) return null;

  return user;
}

export async function logAdminAction({
  adminId,
  adminEmail,
  action,
  targetType,
  targetId,
  details,
}: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
}) {
  await prisma.adminLog.create({
    data: {
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      details,
    },
  });
}