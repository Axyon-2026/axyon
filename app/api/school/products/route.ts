import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getSchoolUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("axyon_token")?.value;

  if (!token) {
    return null;
  }

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (
    !user ||
    user.role === "ADMIN" ||
    user.marketplaceType !== "SCHOOL" ||
    user.isSuspended ||
    user.schoolVerificationStatus !== "APPROVED" ||
    !user.schoolVerified
  ) {
    return null;
  }

  return user;
}

async function uploadToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "axyon/school/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function GET(req: Request) {
  try {
    const user = await getSchoolUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "School Marketplace access required.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const school = searchParams.get("school")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    const products = await prisma.product.findMany({
      where: {
        marketplaceType: "SCHOOL",
        status: "AVAILABLE",

        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  schoolName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(school
          ? {
              schoolName: {
                equals: school,
                mode: "insensitive",
              },
            }
          : {}),

        ...(city
          ? {
              schoolCity: {
                equals: city,
                mode: "insensitive",
              },
            }
          : {}),

        ...(category
          ? {
              category: {
                equals: category,
                mode: "insensitive",
              },
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        seller: {
          select: {
            id: true,
            name: true,
            schoolName: true,
            schoolCity: true,
            classLevel: true,
            schoolVerified: true,
          },
        },
      },
    });

    const schools = Array.from(
      new Set(
        products
          .map((product) => product.schoolName)
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      )
    );

    const cities = Array.from(
      new Set(
        products
          .map((product) => product.schoolCity)
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      )
    );

    const categories = Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      )
    );

    return NextResponse.json({
      products,
      filters: {
        schools,
        cities,
        categories,
      },
    });
  } catch (error) {
    console.log("SCHOOL PRODUCTS FETCH ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load School Marketplace products.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSchoolUser();

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Approved School Marketplace account required.",
        },
        { status: 403 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let description = "";
    let price: string | number = "";
    let category = "";
    let condition = "";
    let imageUrls: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      title = String(formData.get("title") || "");
      description = String(formData.get("description") || "");
      price = String(formData.get("price") || "");
      category = String(formData.get("category") || "");
      condition = String(formData.get("condition") || "");

      const files = formData.getAll("images") as File[];

      const validFiles = files.filter(
        (file) =>
          file &&
          file.name &&
          file.size > 0
      );

      if (validFiles.length > 5) {
        return NextResponse.json(
          {
            message:
              "You can upload a maximum of 5 images.",
          },
          { status: 400 }
        );
      }

      for (const file of validFiles) {
        if (
          ![
            "image/jpeg",
            "image/png",
            "image/webp",
          ].includes(file.type)
        ) {
          return NextResponse.json(
            {
              message:
                "Only JPG, PNG and WEBP images are allowed.",
            },
            { status: 400 }
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              message:
                "Each image must be smaller than 5MB.",
            },
            { status: 400 }
          );
        }
      }

      imageUrls = await Promise.all(
        validFiles.map((file) =>
          uploadToCloudinary(file)
        )
      );
    } else {
      const body = await req.json();

      title = body.title || "";
      description = body.description || "";
      price = body.price;
      category = body.category || "";
      condition = body.condition || "";

      imageUrls = Array.isArray(body.imageUrls)
        ? body.imageUrls
        : [];
    }

    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        {
          message:
            "Title must be at least 3 characters.",
        },
        { status: 400 }
      );
    }

    if (
      !description ||
      description.trim().length < 10
    ) {
      return NextResponse.json(
        {
          message:
            "Please provide a proper description.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Price must be at least ₹1.",
        },
        { status: 400 }
      );
    }

    if (numericPrice > 500000) {
      return NextResponse.json(
        {
          message:
            "Price cannot exceed ₹5,00,000.",
        },
        { status: 400 }
      );
    }

    if (!category || !condition) {
      return NextResponse.json(
        {
          message:
            "Category and condition are required.",
        },
        { status: 400 }
      );
    }

    if (imageUrls.length > 5) {
      return NextResponse.json(
        {
          message:
            "A maximum of 5 images is allowed.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        category: category.trim(),
        condition: condition.trim(),
        imageUrls,
        status: "AVAILABLE",
        marketplaceType: "SCHOOL",

        sellerId: user.id,

        schoolId: user.schoolId,
        schoolName: user.schoolName,
        schoolCity: user.schoolCity,
      },
    });

    return NextResponse.json({
      message:
        "School Marketplace product listed successfully.",
      product,
    });
  } catch (error) {
    console.log(
      "SCHOOL PRODUCT CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create School Marketplace product.",
      },
      { status: 500 }
    );
  }
}