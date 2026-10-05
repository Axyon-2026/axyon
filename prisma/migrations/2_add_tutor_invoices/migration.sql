CREATE TABLE "TutorInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "tutorName" TEXT NOT NULL,
    "tutorEmail" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planType" "TutorSubscriptionPlanType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutorEmailSentAt" TIMESTAMP(3),
    "adminEmailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorInvoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TutorInvoice_invoiceNumber_key"
ON "TutorInvoice"("invoiceNumber");

CREATE UNIQUE INDEX "TutorInvoice_subscriptionId_key"
ON "TutorInvoice"("subscriptionId");

CREATE UNIQUE INDEX "TutorInvoice_paymentId_key"
ON "TutorInvoice"("paymentId");

CREATE INDEX "TutorInvoice_userId_idx"
ON "TutorInvoice"("userId");

CREATE INDEX "TutorInvoice_tutorEmail_idx"
ON "TutorInvoice"("tutorEmail");

CREATE INDEX "TutorInvoice_issuedAt_idx"
ON "TutorInvoice"("issuedAt");

ALTER TABLE "TutorInvoice"
ADD CONSTRAINT "TutorInvoice_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "TutorInvoice"
ADD CONSTRAINT "TutorInvoice_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId")
REFERENCES "TutorSubscription"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "TutorInvoice"
ADD CONSTRAINT "TutorInvoice_paymentId_fkey"
FOREIGN KEY ("paymentId")
REFERENCES "TutorPayment"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;