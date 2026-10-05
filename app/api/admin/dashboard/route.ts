import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access only" },
        { status: 403 }
      );
    }

    const [
      users,
      products,
      rooms,
      deals,
      supportTickets,
      reports,
      ads,
      conversations,
    ] = await Promise.all([
      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          college: true,
          role: true,
          marketplaceType: true,
          emailVerified: true,
          isVerified: true,
          studentVerified: true,
          studentVerificationStatus: true,
          isSuspended: true,
          strikeCount: true,
          createdAt: true,
        },
      }),

      prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      prisma.room.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              marketplaceType: true,
            },
          },
        },
      }),

      prisma.deal.findMany({
        where: {
          status: "COMPLETED",
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      }),

      prisma.supportTicket.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.report.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.adBanner.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.conversation.findMany(),
    ]);

    /* ---------------- USERS ---------------- */

    const totalUsers = users.length;

    const activeUsers = users.filter(
      (user) => !user.isSuspended
    ).length;

    const totalAdmins = users.filter(
      (user) => user.role === "ADMIN"
    ).length;

    const verifiedUsers = users.filter(
      (user) =>
        user.studentVerified ||
        user.studentVerificationStatus === "APPROVED"
    ).length;

    const pendingVerifications = users.filter(
      (user) =>
        user.studentVerificationStatus === "PENDING"
    ).length;

    const rejectedVerifications = users.filter(
      (user) =>
        user.studentVerificationStatus === "REJECTED"
    ).length;

    const suspendedUsers = users.filter(
      (user) => user.isSuspended
    ).length;

    const campusUsers = users.filter(
      (user) =>
        user.marketplaceType === "CAMPUS"
    ).length;

    const schoolUsers = users.filter(
      (user) =>
        user.marketplaceType === "SCHOOL"
    ).length;

    /* ---------------- PRODUCTS ---------------- */

    const campusProducts = products.filter(
      (product) =>
        product.marketplaceType === "CAMPUS"
    );

    const schoolProducts = products.filter(
      (product) =>
        product.marketplaceType === "SCHOOL"
    );

    const activeProducts = products.filter(
      (product) =>
        product.status === "AVAILABLE"
    ).length;

    const soldProducts = products.filter(
      (product) =>
        product.status === "SOLD"
    ).length;

    const removedProducts = products.filter(
      (product) =>
        product.status === "REMOVED"
    ).length;

    /* ---------------- CAMPUS ROOMS ---------------- */

    /*
     * School Marketplace does not have accommodation.
     * Rooms therefore remain a Campus-only feature.
     */

    const activeRooms = rooms.filter(
      (room) =>
        room.status === "AVAILABLE"
    ).length;

    const occupiedRooms = rooms.filter(
      (room) =>
        room.status === "OCCUPIED"
    ).length;

    const removedRooms = rooms.filter(
      (room) =>
        room.status === "REMOVED"
    ).length;

    /* ---------------- SUPPORT ---------------- */

    const openTickets = supportTickets.filter(
      (ticket) =>
        ticket.status === "OPEN"
    ).length;

    const resolvedTickets = supportTickets.filter(
      (ticket) =>
        ticket.status === "RESOLVED"
    ).length;

    /* ---------------- REPORTS ---------------- */

    const openReports = reports.filter(
      (report) =>
        report.status === "OPEN"
    ).length;

    const reviewingReports = reports.filter(
      (report) =>
        report.status === "REVIEWING"
    ).length;

    const resolvedReports = reports.filter(
      (report) =>
        report.status === "RESOLVED"
    ).length;

    const dismissedReports = reports.filter(
      (report) =>
        report.status === "DISMISSED"
    ).length;

    /* ---------------- ADS ---------------- */

    const activeAds = ads.filter(
      (ad) => ad.isActive
    ).length;

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalAdmins,

        verifiedUsers,
        pendingVerifications,
        rejectedVerifications,
        suspendedUsers,

        campusUsers,
        schoolUsers,

        totalProducts: products.length,
        activeProducts,
        soldProducts,
        removedProducts,

        campusProducts: campusProducts.length,
        schoolProducts: schoolProducts.length,

        totalRooms: rooms.length,
        activeRooms,
        occupiedRooms,
        removedRooms,

        completedDeals: deals.length,

        totalSupportTickets:
          supportTickets.length,
        openTickets,
        resolvedTickets,

        totalReports: reports.length,
        openReports,
        reviewingReports,
        resolvedReports,
        dismissedReports,

        totalAds: ads.length,
        activeAds,

        totalConversations:
          conversations.length,
      },

      /* ---------------- DASHBOARD UI DATA ---------------- */

      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        verified: verifiedUsers,
        pendingVerification:
          pendingVerifications,
        campus: campusUsers,
        school: schoolUsers,
      },

      listings: {
        total: products.length,
        active: activeProducts,
        sold: soldProducts,
        removed: removedProducts,
        campus: campusProducts.length,
        school: schoolProducts.length,
      },

      /*
       * Accommodation exists only in Campus Marketplace.
       */

      rooms: {
        total: rooms.length,
        active: activeRooms,
        occupied: occupiedRooms,
        removed: removedRooms,
      },

      reports: {
        total: reports.length,
        pending: openReports,
        reviewing: reviewingReports,
        resolved: resolvedReports,
        dismissed: dismissedReports,
      },

      support: {
        total: supportTickets.length,
        open: openTickets,
        resolved: resolvedTickets,
      },

      schoolVerification: {
        pending: pendingVerifications,
        approved: verifiedUsers,
        rejected: rejectedVerifications,
      },

      recentUsers: users.slice(0, 5),

      recentListings: products.slice(0, 5),

      recentRooms: rooms.slice(0, 5),

      recentReports: reports.slice(0, 5),

      /* ---------------- FULL ADMIN DATA ---------------- */

      usersList: users,

      products,

      roomsList: rooms,

      completedDeals: deals,

      supportTickets,

      ads,
    });
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load admin dashboard",
      },
      {
        status: 500,
      }
    );
  }
}