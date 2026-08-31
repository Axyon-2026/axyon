import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Axyon <noreply@axyon.in>";

type NotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;

  // Set to false when you only want the
  // in-app notification.
  sendEmail?: boolean;
};

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function createNotification(
  data: NotificationInput
) {
  try {
    /*
     * Always create the in-app notification first.
     */
    await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      },
    });

    /*
     * Email is optional.
     *
     * This means existing notification calls continue
     * working even when they don't request email.
     */
    if (!data.sendEmail) {
      return;
    }

    /*
     * Get recipient email/name from the database.
     */
    const recipient = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
      select: {
        name: true,
        email: true,
      },
    });

    if (!recipient?.email) {
      console.error(
        "NOTIFICATION EMAIL ERROR: recipient email not found"
      );

      return;
    }

    const safeName = escapeHtml(
      recipient.name || "there"
    );

    const safeTitle = escapeHtml(data.title);

    const safeMessage = escapeHtml(
      data.message
    );

    const destination = data.link
      ? `${getAppUrl()}${data.link}`
      : getAppUrl();

    const { error } =
      await resend.emails.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject: data.title,

        html: `
          <div
            style="
              margin:0;
              padding:40px 20px;
              background:#071019;
              font-family:Arial,Helvetica,sans-serif;
            "
          >
            <div
              style="
                max-width:560px;
                margin:0 auto;
                background:#0f1722;
                border:1px solid #1e293b;
                border-radius:24px;
                padding:32px;
                color:#ffffff;
              "
            >

              <div
                style="
                  font-size:24px;
                  font-weight:900;
                  letter-spacing:2px;
                  margin-bottom:28px;
                "
              >
                <span style="color:#22c55e;">●</span>
                AXYON
              </div>

              <h1
                style="
                  margin:0;
                  font-size:24px;
                  line-height:1.3;
                  color:#ffffff;
                "
              >
                ${safeTitle}
              </h1>

              <p
                style="
                  margin-top:18px;
                  margin-bottom:0;
                  font-size:16px;
                  line-height:1.7;
                  color:#cbd5e1;
                "
              >
                Hi ${safeName},
              </p>

              <p
                style="
                  margin-top:12px;
                  font-size:16px;
                  line-height:1.7;
                  color:#cbd5e1;
                "
              >
                ${safeMessage}
              </p>

              <div style="margin-top:28px;">
                <a
                  href="${destination}"
                  style="
                    display:inline-block;
                    padding:14px 24px;
                    border-radius:999px;
                    background:#22c55e;
                    color:#000000;
                    font-weight:800;
                    text-decoration:none;
                  "
                >
                  Open Axyon
                </a>
              </div>

              <p
                style="
                  margin-top:32px;
                  font-size:12px;
                  line-height:1.6;
                  color:#64748b;
                "
              >
                You are receiving this email because there is
                activity related to your Axyon account.
              </p>

            </div>
          </div>
        `,
      });

    if (error) {
      console.error(
        "NOTIFICATION EMAIL ERROR:",
        error
      );
    }
  } catch (error) {
    /*
     * Notification failure must NEVER break the main
     * operation such as sending a chat message.
     */
    console.error(
      "NOTIFICATION CREATE ERROR:",
      error
    );
  }
}