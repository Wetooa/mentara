/*
  Warnings:

  - You are about to drop the `TherapistFiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TherapistFiles" DROP CONSTRAINT "TherapistFiles_therapistId_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "postingRole" TEXT NOT NULL DEFAULT 'member';

-- DropTable
DROP TABLE "TherapistFiles";
