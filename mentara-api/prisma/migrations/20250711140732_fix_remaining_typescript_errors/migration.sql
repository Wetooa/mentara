-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "details" JSONB;

-- CreateTable
CREATE TABLE "DurationConfig" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "defaultDuration" INTEGER NOT NULL DEFAULT 60,
    "minDuration" INTEGER NOT NULL DEFAULT 30,
    "maxDuration" INTEGER NOT NULL DEFAULT 120,
    "bufferBefore" INTEGER NOT NULL DEFAULT 0,
    "bufferAfter" INTEGER NOT NULL DEFAULT 0,
    "allowExtension" BOOLEAN NOT NULL DEFAULT false,
    "autoEndTime" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DurationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DurationConfig_meetingId_key" ON "DurationConfig"("meetingId");

-- CreateIndex
CREATE INDEX "DurationConfig_meetingId_idx" ON "DurationConfig"("meetingId");

-- AddForeignKey
ALTER TABLE "DurationConfig" ADD CONSTRAINT "DurationConfig_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
