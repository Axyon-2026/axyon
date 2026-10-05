-- CreateEnum
CREATE TYPE "TutorTeachingMode" AS ENUM ('ONLINE', 'OFFLINE', 'BOTH');

-- CreateEnum
CREATE TYPE "TutorProfileStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "TutorSubscriptionPlanType" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "TutorSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TutorPaymentStatus" AS ENUM ('PENDING', 'PAID', 'ACTIVATED', 'FAILED', 'REFUND_PENDING', 'REFUNDED');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "tutorProfileId" TEXT;

-- CreateTable
CREATE TABLE "TutorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "institution" TEXT,
    "college" TEXT,
    "bio" TEXT NOT NULL,
    "subjects" TEXT[],
    "classes" TEXT[],
    "teachingMode" "TutorTeachingMode" NOT NULL DEFAULT 'BOTH',
    "location" TEXT,
    "maxTravelDistance" INTEGER,
    "availability" TEXT NOT NULL,
    "languages" TEXT[],
    "hourlyFee" INTEGER NOT NULL,
    "demoAvailable" BOOLEAN NOT NULL DEFAULT false,
    "demoDetails" TEXT,
    "publicPhone" TEXT,
    "phoneVisibilityConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" "TutorProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "termsAcceptedAt" TIMESTAMP(3),
    "termsVersion" TEXT,
    "safetyAcceptedAt" TIMESTAMP(3),
    "safetyVersion" TEXT,
    "publishedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorReview" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TutorSubscriptionPlanType" NOT NULL,
    "price" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorSubscription" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "purchasedPlanType" "TutorSubscriptionPlanType" NOT NULL,
    "purchasedPrice" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "status" "TutorSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "activatedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorPayment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "TutorPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "failureReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfile_userId_key" ON "TutorProfile"("userId");

-- CreateIndex
CREATE INDEX "TutorProfile_status_idx" ON "TutorProfile"("status");

-- CreateIndex
CREATE INDEX "TutorProfile_teachingMode_idx" ON "TutorProfile"("teachingMode");

-- CreateIndex
CREATE INDEX "TutorProfile_location_idx" ON "TutorProfile"("location");

-- CreateIndex
CREATE INDEX "TutorProfile_hourlyFee_idx" ON "TutorProfile"("hourlyFee");

-- CreateIndex
CREATE INDEX "TutorReview_tutorProfileId_idx" ON "TutorReview"("tutorProfileId");

-- CreateIndex
CREATE INDEX "TutorReview_reviewerId_idx" ON "TutorReview"("reviewerId");

-- CreateIndex
CREATE INDEX "TutorReview_rating_idx" ON "TutorReview"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "TutorReview_tutorProfileId_reviewerId_key" ON "TutorReview"("tutorProfileId", "reviewerId");

-- CreateIndex
CREATE INDEX "TutorSubscriptionPlan_type_idx" ON "TutorSubscriptionPlan"("type");

-- CreateIndex
CREATE INDEX "TutorSubscriptionPlan_isActive_idx" ON "TutorSubscriptionPlan"("isActive");

-- CreateIndex
CREATE INDEX "TutorSubscription_tutorProfileId_idx" ON "TutorSubscription"("tutorProfileId");

-- CreateIndex
CREATE INDEX "TutorSubscription_userId_idx" ON "TutorSubscription"("userId");

-- CreateIndex
CREATE INDEX "TutorSubscription_planId_idx" ON "TutorSubscription"("planId");

-- CreateIndex
CREATE INDEX "TutorSubscription_status_idx" ON "TutorSubscription"("status");

-- CreateIndex
CREATE INDEX "TutorSubscription_expiresAt_idx" ON "TutorSubscription"("expiresAt");

-- CreateIndex
CREATE INDEX "TutorSubscription_razorpayOrderId_idx" ON "TutorSubscription"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "TutorSubscription_razorpayPaymentId_idx" ON "TutorSubscription"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "TutorPayment_subscriptionId_idx" ON "TutorPayment"("subscriptionId");

-- CreateIndex
CREATE INDEX "TutorPayment_userId_idx" ON "TutorPayment"("userId");

-- CreateIndex
CREATE INDEX "TutorPayment_status_idx" ON "TutorPayment"("status");

-- CreateIndex
CREATE INDEX "TutorPayment_razorpayOrderId_idx" ON "TutorPayment"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "TutorPayment_razorpayPaymentId_idx" ON "TutorPayment"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Conversation_tutorProfileId_idx" ON "Conversation"("tutorProfileId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorReview" ADD CONSTRAINT "TutorReview_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorReview" ADD CONSTRAINT "TutorReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubscription" ADD CONSTRAINT "TutorSubscription_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubscription" ADD CONSTRAINT "TutorSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorSubscription" ADD CONSTRAINT "TutorSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TutorSubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorPayment" ADD CONSTRAINT "TutorPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "TutorSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
