import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

const ALLOWED_CLASSES = ["9", "10", "11", "12"];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") || "").trim();
    const schoolName = String(formData.get("schoolName") || "").trim();
    const schoolCity = String(formData.get("schoolCity") || "").trim();
    const classLevel = String(formData.get("classLevel") || "").trim();

    const studentPhoto = formData.get("studentPhoto");
    const schoolIdFile = formData.get("schoolId");

    if (
      !name ||
      !email ||
      !password ||
      !schoolName ||
      !schoolCity ||
      !classLevel
    ) {
      return NextResponse.json(
        {
          error: "Please fill all required fields.",
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_CLASSES.includes(classLevel)) {
      return NextResponse.json(
        {
          error: "School Marketplace is available for Classes 9–12 only.",
        },
        { status: 400 },
      );
    }

    if (!(studentPhoto instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload your student photo.",
        },
        { status: 400 },
      );
    }

    if (!(schoolIdFile instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload your school ID.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(studentPhoto.type)) {
      return NextResponse.json(
        {
          error: "Student photo must be JPG, PNG, or WEBP.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(schoolIdFile.type)) {
      return NextResponse.json(
        {
          error: "School ID must be JPG, PNG, or WEBP.",
        },
        { status: 400 },
      );
    }

    if (studentPhoto.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Student photo must be smaller than 5 MB.",
        },
        { status: 400 },
      );
    }

    if (schoolIdFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "School ID must be smaller than 5 MB.",
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const studentPhotoBuffer = Buffer.from(await studentPhoto.arrayBuffer());

    const schoolIdBuffer = Buffer.from(await schoolIdFile.arrayBuffer());

    const studentPhotoUpload = await uploadToCloudinary(
      studentPhotoBuffer,
      "axyon/school/students",
    );

    const schoolIdUpload = await uploadToCloudinary(
      schoolIdBuffer,
      "axyon/school/ids",
    );

    const school = await prisma.school.upsert({
      where: {
        name_city: {
          name: schoolName,
          city: schoolCity,
        },
      },
      update: {},
      create: {
        name: schoolName,
        city: schoolCity,
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,

        marketplaceType: "SCHOOL",

        schoolId: school.id,
        schoolName: school.name,
        schoolCity: school.city,
        classLevel,

        schoolStudentPhotoUrl: studentPhotoUpload.secure_url,
        schoolIdImageUrl: schoolIdUpload.secure_url,

        schoolVerificationStatus: "PENDING",
        schoolVerified: false,

        emailVerified: false,
        isVerified: false,
      },
    });
    const admin = await prisma.user.findUnique({
      where: {
        email: "asa.axyon@gmail.com",
      },
      select: {
        id: true,
      },
    });

    if (admin) {
      await createNotification({
        userId: admin.id,
        title: "New School Verification Submitted",
        message: `${user.name} has submitted a School Marketplace verification request for ${school.name}, ${school.city}, Class ${classLevel}. Please review the student's documents.`,
        type: "SCHOOL_VERIFICATION",
        link: "/admin",
        sendEmail: true,
      });
    }
    return NextResponse.json(
      {
        message:
          "School account created successfully. Your verification is now under review by Axyon.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          marketplaceType: user.marketplaceType,
          schoolName: user.schoolName,
          schoolCity: user.schoolCity,
          classLevel: user.classLevel,
          schoolVerificationStatus: user.schoolVerificationStatus,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("SCHOOL REGISTER ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Unable to create your School Account right now. Please try again later.",
      },
      { status: 500 },
    );
  }
}
