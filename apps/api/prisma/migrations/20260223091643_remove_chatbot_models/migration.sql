/*
  Warnings:

  - You are about to drop the `ChatbotMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatbotSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatbotMessage" DROP CONSTRAINT "ChatbotMessage_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "ChatbotSession" DROP CONSTRAINT "ChatbotSession_clientId_fkey";

-- DropTable
DROP TABLE "ChatbotMessage";

-- DropTable
DROP TABLE "ChatbotSession";

-- DropEnum
DROP TYPE "ChatbotMessageRole";
