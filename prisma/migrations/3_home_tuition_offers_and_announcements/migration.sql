-- Add optional promotional pricing to TutorSubscriptionPlan
ALTER TABLE "TutorSubscriptionPlan"
ADD COLUMN "offerEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "discountPercent" INTEGER,
ADD COLUMN "offerPrice" INTEGER,
ADD COLUMN "offerStartsAt" TIMESTAMP(3),
ADD COLUMN "offerEndsAt" TIMESTAMP(3),
ADD COLUMN "offerMessage" TEXT;

-- Indexes for promotional pricing
CREATE INDEX "TutorSubscriptionPlan_offerEnabled_idx"
ON "TutorSubscriptionPlan"("offerEnabled");

CREATE INDEX "TutorSubscriptionPlan_offerStartsAt_idx"
ON "TutorSubscriptionPlan"("offerStartsAt");

CREATE INDEX "TutorSubscriptionPlan_offerEndsAt_idx"
ON "TutorSubscriptionPlan"("offerEndsAt");

-- Create main-site announcement table
CREATE TABLE "SiteAnnouncement" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ctaText" TEXT,
    "ctaHref" TEXT,
    "imageUrl" TEXT,
    "style" TEXT NOT NULL DEFAULT 'AURORA',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAnnouncement_pkey" PRIMARY KEY ("id")
);

-- Indexes for announcement scheduling/activation
CREATE INDEX "SiteAnnouncement_isActive_idx"
ON "SiteAnnouncement"("isActive");

CREATE INDEX "SiteAnnouncement_startsAt_idx"
ON "SiteAnnouncement"("startsAt");

CREATE INDEX "SiteAnnouncement_endsAt_idx"
ON "SiteAnnouncement"("endsAt");