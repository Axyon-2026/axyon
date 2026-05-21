import { prisma } from "@/lib/prisma";

type NotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
};

export async function createNotification(
  data: NotificationInput
) {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      },
    });
  } catch (error) {
    console.log(
      "NOTIFICATION CREATE ERROR:",
      error
    );
  }
}