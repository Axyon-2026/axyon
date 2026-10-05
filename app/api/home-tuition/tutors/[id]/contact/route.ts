import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ContactMethod = "call" | "whatsapp";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfter: 0,
    };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    retryAfter: 0,
  };
}

function cleanupRateLimitStore() {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const method = request.nextUrl.searchParams.get("method") as
      | ContactMethod
      | null;

    if (method !== "call" && method !== "whatsapp") {
      return NextResponse.json(
        { error: "Invalid contact method." },
        { status: 400 }
      );
    }

    cleanupRateLimitStore();

    const clientIdentifier = getClientIdentifier(request);
    const rateLimitKey = `${clientIdentifier}:${id}:${method}`;
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many contact requests. Please try again after a few minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        }
      );
    }

    const now = new Date();

    const tutor = await prisma.tutorProfile.findFirst({
      where: {
        id,
        status: "ACTIVE",
        deletedAt: null,
        user: {
          marketplaceType: "CAMPUS",
          studentVerified: true,
          isSuspended: false,
        },
      },
      select: {
        publicPhone: true,
        phoneVisibilityConfirmed: true,
        subscriptions: {
          where: {
            status: "ACTIVE",
            startsAt: { lte: now },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!tutor) {
      return NextResponse.json(
        { error: "Tutor is not available." },
        { status: 404 }
      );
    }

    if (
      !tutor.publicPhone ||
      !tutor.phoneVisibilityConfirmed ||
      tutor.subscriptions.length === 0
    ) {
      return NextResponse.json(
        { error: "This contact option is currently unavailable." },
        { status: 404 }
      );
    }

    const phone = tutor.publicPhone.replace(/[^\d+]/g, "");

    if (!phone) {
      return NextResponse.json(
        { error: "This contact option is currently unavailable." },
        { status: 404 }
      );
    }

    const url =
      method === "call"
        ? `tel:${phone}`
        : `https://wa.me/${phone.replace(/^\+/, "")}`;

    return NextResponse.json({
      success: true,
      method,
      url,
    });
  } catch (error) {
    console.error("Home tuition contact error:", error);

    return NextResponse.json(
      { error: "Unable to process contact request." },
      { status: 500 }
    );
  }
}