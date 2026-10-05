import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const HOME_TUITION_TERMS_VERSION = "1.0";
const HOME_TUITION_SAFETY_VERSION = "1.0";

async function getCampusUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        marketplaceType: true,
        studentVerified: true,
        isSuspended: true,
        phone: true,
      },
    });

    if (!user) return null;

    if (user.marketplaceType !== "CAMPUS") return null;

    return user;
  } catch {
    return null;
  }
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function parseTeachingMode(value: unknown) {
  const mode = clean(value).toUpperCase();

  if (!["ONLINE", "OFFLINE", "BOTH"].includes(mode)) {
    return null;
  }

  return mode as "ONLINE" | "OFFLINE" | "BOTH";
}

function parseNonNegativeInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    return null;
  }

  return number;
}

function validateProfile(body: Record<string, unknown>) {
  const displayName = clean(body.displayName);
  const photoUrl = clean(body.photoUrl);
  const institution = clean(body.institution);
  const college = clean(body.college);
  const bio = clean(body.bio);
  const subjects = parseArray(body.subjects);
  const classes = parseArray(body.classes);
  const teachingMode = parseTeachingMode(body.teachingMode);
  const location = clean(body.location);
  const maxTravelDistance = parseNonNegativeInt(
    body.maxTravelDistance
  );
  const availability = clean(body.availability);
  const languages = parseArray(body.languages);
  const hourlyFee = Number(body.hourlyFee);
  const demoAvailable = Boolean(body.demoAvailable);
  const demoDetails = clean(body.demoDetails);

  if (!displayName || displayName.length > 100) {
    return {
      error:
        "Display name is required and must be under 100 characters",
    };
  }

  if (!bio || bio.length < 20 || bio.length > 2000) {
    return {
      error: "Bio must be between 20 and 2000 characters",
    };
  }

  if (subjects.length === 0) {
    return { error: "Add at least one subject" };
  }

  if (classes.length === 0) {
    return { error: "Add at least one class" };
  }

  if (!teachingMode) {
    return { error: "Select a valid teaching mode" };
  }

  if (!availability || availability.length > 1000) {
    return {
      error:
        "Availability is required and must be under 1000 characters",
    };
  }

  if (languages.length === 0) {
    return { error: "Add at least one language" };
  }

  if (!Number.isInteger(hourlyFee) || hourlyFee <= 0) {
    return {
      error: "Hourly fee must be a positive integer",
    };
  }

  if (hourlyFee > 100000) {
    return { error: "Hourly fee is too high" };
  }

  if (maxTravelDistance !== null && maxTravelDistance > 500) {
    return {
      error: "Maximum travel distance cannot exceed 500 km",
    };
  }

  if (photoUrl.length > 2000) {
    return { error: "Photo URL is too long" };
  }

  if (institution.length > 200) {
    return { error: "Institution name is too long" };
  }

  if (college.length > 200) {
    return { error: "College name is too long" };
  }

  if (location.length > 200) {
    return { error: "Location is too long" };
  }

  if (demoDetails.length > 1000) {
    return { error: "Demo details are too long" };
  }

  return {
    data: {
      displayName,
      photoUrl: photoUrl || null,
      institution: institution || null,
      college: college || null,
      bio,
      subjects,
      classes,
      teachingMode,
      location: location || null,
      maxTravelDistance,
      availability,
      languages,
      hourlyFee,
      demoAvailable,
      demoDetails: demoDetails || null,
    },
  };
}

function serializeProfile(profile: any) {
  return {
    id: profile.id,
    displayName: profile.displayName,
    photoUrl: profile.photoUrl,
    institution: profile.institution,
    college: profile.college,
    bio: profile.bio,
    subjects: profile.subjects,
    classes: profile.classes,
    teachingMode: profile.teachingMode,
    location: profile.location,
    maxTravelDistance: profile.maxTravelDistance,
    availability: profile.availability,
    languages: profile.languages,
    hourlyFee: profile.hourlyFee,
    demoAvailable: profile.demoAvailable,
    demoDetails: profile.demoDetails,
    status: profile.status,
    termsAcceptedAt: profile.termsAcceptedAt,
    termsVersion: profile.termsVersion,
    safetyAcceptedAt: profile.safetyAcceptedAt,
    safetyVersion: profile.safetyVersion,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function GET() {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    const profile = await prisma.tutorProfile.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        displayName: true,
        photoUrl: true,
        institution: true,
        college: true,
        bio: true,
        subjects: true,
        classes: true,
        teachingMode: true,
        location: true,
        maxTravelDistance: true,
        availability: true,
        languages: true,
        hourlyFee: true,
        demoAvailable: true,
        demoDetails: true,
        status: true,
        termsAcceptedAt: true,
        termsVersion: true,
        safetyAcceptedAt: true,
        safetyVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      profile: profile ? serializeProfile(profile) : null,
      studentVerified: user.studentVerified,
      termsVersion: HOME_TUITION_TERMS_VERSION,
      safetyVersion: HOME_TUITION_SAFETY_VERSION,
    });
  } catch (error) {
    console.error("Home Tuition profile GET error:", error);

    return NextResponse.json(
      { error: "Failed to load tutor profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account is suspended" },
        { status: 403 }
      );
    }

    if (!user.studentVerified) {
      return NextResponse.json(
        {
          error:
            "Campus student verification is required before creating a tutor profile",
        },
        { status: 403 }
      );
    }

    const existingProfile = await prisma.tutorProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Tutor profile already exists" },
        { status: 409 }
      );
    }

    const body = await request.json();

    if (
      body.termsAccepted !== true ||
      body.safetyAccepted !== true
    ) {
      return NextResponse.json(
        {
          error:
            "You must accept the Home Tuition terms and safety rules",
        },
        { status: 400 }
      );
    }

    if (!body.phoneVisibilityConfirmed) {
      return NextResponse.json(
        {
          error:
            "You must explicitly confirm whether your phone number can be shown publicly",
        },
        { status: 400 }
      );
    }

    const validation = validateProfile(body);

    if ("error" in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const publicPhone =
      body.publicPhone === true ? user.phone : null;

    const termsAcceptedAt = new Date();
    const safetyAcceptedAt = new Date();

    const profile = await prisma.tutorProfile.create({
      data: {
        userId: user.id,
        ...validation.data,
        publicPhone,
        phoneVisibilityConfirmed: true,
        termsAcceptedAt,
        termsVersion: HOME_TUITION_TERMS_VERSION,
        safetyAcceptedAt,
        safetyVersion: HOME_TUITION_SAFETY_VERSION,
        status: "DRAFT",
      },
      select: {
        id: true,
        displayName: true,
        photoUrl: true,
        institution: true,
        college: true,
        bio: true,
        subjects: true,
        classes: true,
        teachingMode: true,
        location: true,
        maxTravelDistance: true,
        availability: true,
        languages: true,
        hourlyFee: true,
        demoAvailable: true,
        demoDetails: true,
        status: true,
        termsAcceptedAt: true,
        termsVersion: true,
        safetyAcceptedAt: true,
        safetyVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        profile: serializeProfile(profile),
        message:
          "Tutor profile created. Choose a subscription to publish it.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Home Tuition profile POST error:", error);

    return NextResponse.json(
      { error: "Failed to create tutor profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCampusUser();

    if (!user) {
      return NextResponse.json(
        { error: "Campus login required" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account is suspended" },
        { status: 403 }
      );
    }

    if (!user.studentVerified) {
      return NextResponse.json(
        { error: "Campus student verification is required" },
        { status: 403 }
      );
    }

    const profile = await prisma.tutorProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (
      body.termsAccepted !== undefined &&
      body.termsAccepted !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Home Tuition terms must remain accepted",
        },
        { status: 400 }
      );
    }

    if (
      body.safetyAccepted !== undefined &&
      body.safetyAccepted !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Home Tuition safety rules must remain accepted",
        },
        { status: 400 }
      );
    }

    if (
      body.phoneVisibilityConfirmed !== undefined &&
      body.phoneVisibilityConfirmed !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Phone visibility confirmation cannot be removed from an active tutor profile",
        },
        { status: 400 }
      );
    }

    const validation = validateProfile(body);

    if ("error" in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    let publicPhone = profile.publicPhone;

    if (body.publicPhone !== undefined) {
      publicPhone = body.publicPhone === true ? user.phone : null;
    }

    const updatedProfile = await prisma.tutorProfile.update({
      where: {
        id: profile.id,
      },
      data: {
        ...validation.data,
        publicPhone,
        phoneVisibilityConfirmed: true,

        termsAcceptedAt:
          profile.termsAcceptedAt ??
          (body.termsAccepted === true
            ? new Date()
            : null),

        termsVersion:
          profile.termsVersion ??
          (body.termsAccepted === true
            ? HOME_TUITION_TERMS_VERSION
            : null),

        safetyAcceptedAt:
          profile.safetyAcceptedAt ??
          (body.safetyAccepted === true
            ? new Date()
            : null),

        safetyVersion:
          profile.safetyVersion ??
          (body.safetyAccepted === true
            ? HOME_TUITION_SAFETY_VERSION
            : null),

        // Editing an already published profile does not automatically
        // publish or renew it.
        status:
          profile.status === "ACTIVE"
            ? "ACTIVE"
            : profile.status,
      },
      select: {
        id: true,
        displayName: true,
        photoUrl: true,
        institution: true,
        college: true,
        bio: true,
        subjects: true,
        classes: true,
        teachingMode: true,
        location: true,
        maxTravelDistance: true,
        availability: true,
        languages: true,
        hourlyFee: true,
        demoAvailable: true,
        demoDetails: true,
        status: true,
        termsAcceptedAt: true,
        termsVersion: true,
        safetyAcceptedAt: true,
        safetyVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      profile: serializeProfile(updatedProfile),
    });
  } catch (error) {
    console.error("Home Tuition profile PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update tutor profile" },
      { status: 500 }
    );
  }
}