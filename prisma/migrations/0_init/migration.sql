-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."DealStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."MarketplaceType" AS ENUM ('CAMPUS', 'SCHOOL');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('AVAILABLE', 'SOLD', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."RoomType" AS ENUM ('SINGLE', 'SHARED', 'PG', 'HOSTEL', 'APARTMENT');

-- CreateTable
CREATE TABLE "public"."AdBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "badge" TEXT,
    "emoji" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "AdBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CollegeRequest" (
    "id" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CollegeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "roomId" TEXT,
    "marketplaceType" "public"."MarketplaceType" NOT NULL DEFAULT 'CAMPUS',

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Deal" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "originalPrice" INTEGER NOT NULL,
    "finalPrice" INTEGER NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "buyerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "sellerConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."DealStatus" NOT NULL DEFAULT 'PENDING',
    "completedBy" TEXT,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readByBuyer" BOOLEAN NOT NULL DEFAULT false,
    "readBySeller" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrls" TEXT[],
    "buyerId" TEXT,
    "finalPrice" INTEGER,
    "invoiceId" TEXT,
    "soldAt" TIMESTAMP(3),
    "marketplaceType" "public"."MarketplaceType" NOT NULL DEFAULT 'CAMPUS',
    "schoolCity" TEXT,
    "schoolId" TEXT,
    "schoolName" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "roomType" "public"."RoomType" NOT NULL,
    "rent" INTEGER NOT NULL,
    "deposit" INTEGER,
    "address" TEXT NOT NULL,
    "landmark" TEXT,
    "college" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "amenities" TEXT[],
    "availableFrom" TIMESTAMP(3),
    "status" "public"."RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactNumber" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupportTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "college" TEXT,
    "phone" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "resetExpiresAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "profileImageUrl" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "strikeCount" INTEGER NOT NULL DEFAULT 0,
    "collegeIdImageUrl" TEXT,
    "collegeIdNumber" TEXT,
    "studentVerificationStatus" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
    "studentVerified" BOOLEAN NOT NULL DEFAULT false,
    "selfieImageUrl" TEXT,
    "classLevel" TEXT,
    "marketplaceType" "public"."MarketplaceType" NOT NULL DEFAULT 'CAMPUS',
    "schoolCity" TEXT,
    "schoolId" TEXT,
    "schoolIdImageUrl" TEXT,
    "schoolName" TEXT,
    "schoolStudentPhotoUrl" TEXT,
    "schoolVerificationStatus" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
    "schoolVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "College_name_key" ON "public"."College"("name" ASC);

-- CreateIndex
CREATE INDEX "Conversation_buyerId_idx" ON "public"."Conversation"("buyerId" ASC);

-- CreateIndex
CREATE INDEX "Conversation_marketplaceType_idx" ON "public"."Conversation"("marketplaceType" ASC);

-- CreateIndex
CREATE INDEX "Conversation_productId_idx" ON "public"."Conversation"("productId" ASC);

-- CreateIndex
CREATE INDEX "Conversation_roomId_idx" ON "public"."Conversation"("roomId" ASC);

-- CreateIndex
CREATE INDEX "Conversation_sellerId_idx" ON "public"."Conversation"("sellerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Deal_invoiceId_key" ON "public"."Deal"("invoiceId" ASC);

-- CreateIndex
CREATE INDEX "Product_marketplaceType_idx" ON "public"."Product"("marketplaceType" ASC);

-- CreateIndex
CREATE INDEX "Product_schoolCity_idx" ON "public"."Product"("schoolCity" ASC);

-- CreateIndex
CREATE INDEX "Product_schoolId_idx" ON "public"."Product"("schoolId" ASC);

-- CreateIndex
CREATE INDEX "Product_schoolName_idx" ON "public"."Product"("schoolName" ASC);

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "public"."Product"("sellerId" ASC);

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "public"."Product"("status" ASC);

-- CreateIndex
CREATE INDEX "Room_college_idx" ON "public"."Room"("college" ASC);

-- CreateIndex
CREATE INDEX "Room_ownerId_idx" ON "public"."Room"("ownerId" ASC);

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "public"."Room"("status" ASC);

-- CreateIndex
CREATE INDEX "School_city_idx" ON "public"."School"("city" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "School_name_city_key" ON "public"."School"("name" ASC, "city" ASC);

-- CreateIndex
CREATE INDEX "School_name_idx" ON "public"."School"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
