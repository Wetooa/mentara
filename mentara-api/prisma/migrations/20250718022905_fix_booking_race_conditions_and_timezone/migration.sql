-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "endTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TherapistAvailability" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ALTER COLUMN "dayOfWeek" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "Meeting_endTime_idx" ON "Meeting"("endTime");

-- CreateIndex
CREATE INDEX "Meeting_therapistId_startTime_endTime_idx" ON "Meeting"("therapistId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Meeting_clientId_startTime_endTime_idx" ON "Meeting"("clientId", "startTime", "endTime");
