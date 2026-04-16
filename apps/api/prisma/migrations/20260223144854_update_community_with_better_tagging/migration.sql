/*
  Warnings:

  - You are about to drop the `CommunityTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunityToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestionnaireType" AS ENUM ('STRESS', 'ANXIETY', 'DEPRESSION', 'DRUG_ABUSE', 'INSOMNIA', 'PANIC', 'BIPOLAR', 'OCD', 'PTSD', 'SOCIAL_ANXIETY', 'PHOBIA', 'BURNOUT', 'EATING_DISORDER', 'ADHD', 'ALCOHOL');

-- DropForeignKey
ALTER TABLE "CommunityToTag" DROP CONSTRAINT "CommunityToTag_communityId_fkey";

-- DropForeignKey
ALTER TABLE "CommunityToTag" DROP CONSTRAINT "CommunityToTag_tagId_fkey";

-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "illnesses" "QuestionnaireType"[];

-- DropTable
DROP TABLE "CommunityTag";

-- DropTable
DROP TABLE "CommunityToTag";
