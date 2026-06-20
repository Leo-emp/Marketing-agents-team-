-- AlterTable
ALTER TABLE "Content" ADD COLUMN "captionText" TEXT;
ALTER TABLE "Content" ADD COLUMN "editorialFeedback" TEXT;
ALTER TABLE "Content" ADD COLUMN "editorialScore" REAL;
ALTER TABLE "Content" ADD COLUMN "engagementComments" INTEGER;
ALTER TABLE "Content" ADD COLUMN "engagementImpressions" INTEGER;
ALTER TABLE "Content" ADD COLUMN "engagementLikes" INTEGER;
ALTER TABLE "Content" ADD COLUMN "engagementSaves" INTEGER;
ALTER TABLE "Content" ADD COLUMN "engagementScore" REAL;
ALTER TABLE "Content" ADD COLUMN "engagementShares" INTEGER;
ALTER TABLE "Content" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Content" ADD COLUMN "researchBrief" TEXT;
ALTER TABLE "Content" ADD COLUMN "variationGroup" TEXT;
ALTER TABLE "Content" ADD COLUMN "videoRenderId" TEXT;
ALTER TABLE "Content" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "Content" ADD COLUMN "visualData" TEXT;

-- CreateTable
CREATE TABLE "Visual" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT,
    "type" TEXT NOT NULL,
    "slideIndex" INTEGER NOT NULL DEFAULT 0,
    "templateId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 1080,
    "height" INTEGER NOT NULL DEFAULT 1080,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KpiMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "contentId" TEXT,
    "metricType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "date" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KpiGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailSequence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "steps" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailSend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sequenceId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "resendMessageId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "sentAt" DATETIME,
    "openedAt" DATETIME,
    "clickedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailSend_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "EmailSequence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "unsubscribedAt" DATETIME,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FunnelEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "eventType" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "metadata" TEXT,
    "eventDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Visual_contentId_idx" ON "Visual"("contentId");

-- CreateIndex
CREATE INDEX "KpiMetric_platform_idx" ON "KpiMetric"("platform");

-- CreateIndex
CREATE INDEX "KpiMetric_date_idx" ON "KpiMetric"("date");

-- CreateIndex
CREATE INDEX "KpiMetric_contentId_idx" ON "KpiMetric"("contentId");

-- CreateIndex
CREATE INDEX "EmailSequence_trigger_idx" ON "EmailSequence"("trigger");

-- CreateIndex
CREATE INDEX "EmailSequence_status_idx" ON "EmailSequence"("status");

-- CreateIndex
CREATE INDEX "EmailSend_recipientEmail_idx" ON "EmailSend"("recipientEmail");

-- CreateIndex
CREATE INDEX "EmailSend_recipientUserId_idx" ON "EmailSend"("recipientUserId");

-- CreateIndex
CREATE INDEX "EmailSend_sequenceId_idx" ON "EmailSend"("sequenceId");

-- CreateIndex
CREATE INDEX "EmailSend_status_idx" ON "EmailSend"("status");

-- CreateIndex
CREATE INDEX "EmailSend_sentAt_idx" ON "EmailSend"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailPreference_userId_key" ON "EmailPreference"("userId");

-- CreateIndex
CREATE INDEX "EmailPreference_email_idx" ON "EmailPreference"("email");

-- CreateIndex
CREATE INDEX "FunnelEvent_eventType_idx" ON "FunnelEvent"("eventType");

-- CreateIndex
CREATE INDEX "FunnelEvent_utmSource_idx" ON "FunnelEvent"("utmSource");

-- CreateIndex
CREATE INDEX "FunnelEvent_eventDate_idx" ON "FunnelEvent"("eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "FunnelEvent_userId_eventType_key" ON "FunnelEvent"("userId", "eventType");

-- CreateIndex
CREATE INDEX "Content_variationGroup_idx" ON "Content"("variationGroup");

-- CreateIndex
CREATE INDEX "Content_engagementScore_idx" ON "Content"("engagementScore");
