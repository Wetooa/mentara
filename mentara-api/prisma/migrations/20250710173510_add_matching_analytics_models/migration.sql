-- CreateTable
CREATE TABLE "MatchingWeight" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchingWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchHistory" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "conditionScore" INTEGER NOT NULL,
    "approachScore" INTEGER NOT NULL,
    "experienceScore" INTEGER NOT NULL,
    "reviewScore" INTEGER NOT NULL,
    "logisticsScore" INTEGER NOT NULL,
    "compatibilityScore" INTEGER,
    "primaryMatches" TEXT[],
    "secondaryMatches" TEXT[],
    "approachMatches" TEXT[],
    "recommendationRank" INTEGER NOT NULL,
    "totalRecommendations" INTEGER NOT NULL,
    "wasViewed" BOOLEAN NOT NULL DEFAULT false,
    "wasContacted" BOOLEAN NOT NULL DEFAULT false,
    "becameClient" BOOLEAN NOT NULL DEFAULT false,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "clientSatisfactionScore" INTEGER,
    "recommendationAlgorithm" TEXT NOT NULL DEFAULT 'advanced',
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCompatibility" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "personalityCompatibility" INTEGER NOT NULL,
    "sessionCompatibility" INTEGER NOT NULL,
    "demographicCompatibility" INTEGER NOT NULL,
    "overallCompatibility" INTEGER NOT NULL,
    "communicationStyleScore" INTEGER NOT NULL,
    "personalityMatchScore" INTEGER NOT NULL,
    "culturalCompatibilityScore" INTEGER NOT NULL,
    "formatMatchScore" INTEGER NOT NULL,
    "durationMatchScore" INTEGER NOT NULL,
    "frequencyMatchScore" INTEGER NOT NULL,
    "schedulingCompatibilityScore" INTEGER NOT NULL,
    "ageCompatibilityScore" INTEGER NOT NULL,
    "genderCompatibilityScore" INTEGER NOT NULL,
    "languageCompatibilityScore" INTEGER NOT NULL,
    "strengths" TEXT[],
    "concerns" TEXT[],
    "recommendations" TEXT[],
    "analysisVersion" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationFeedback" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "matchHistoryId" TEXT,
    "relevanceScore" INTEGER NOT NULL,
    "accuracyScore" INTEGER NOT NULL,
    "helpfulnessScore" INTEGER NOT NULL,
    "feedbackText" TEXT,
    "selectedTherapist" BOOLEAN NOT NULL DEFAULT false,
    "reasonNotSelected" TEXT,
    "hadInitialSession" BOOLEAN NOT NULL DEFAULT false,
    "continuedTherapy" BOOLEAN NOT NULL DEFAULT false,
    "overallSatisfaction" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlgorithmPerformance" (
    "id" TEXT NOT NULL,
    "algorithmName" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "totalRecommendations" INTEGER NOT NULL,
    "successfulMatches" INTEGER NOT NULL,
    "averageMatchScore" DOUBLE PRECISION NOT NULL,
    "averageSatisfactionScore" DOUBLE PRECISION,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "clickThroughRate" DOUBLE PRECISION NOT NULL,
    "conversionRate" DOUBLE PRECISION NOT NULL,
    "retentionRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlgorithmPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchingWeight_name_key" ON "MatchingWeight"("name");

-- CreateIndex
CREATE INDEX "MatchingWeight_name_idx" ON "MatchingWeight"("name");

-- CreateIndex
CREATE INDEX "MatchingWeight_isActive_idx" ON "MatchingWeight"("isActive");

-- CreateIndex
CREATE INDEX "MatchHistory_clientId_idx" ON "MatchHistory"("clientId");

-- CreateIndex
CREATE INDEX "MatchHistory_therapistId_idx" ON "MatchHistory"("therapistId");

-- CreateIndex
CREATE INDEX "MatchHistory_totalScore_idx" ON "MatchHistory"("totalScore");

-- CreateIndex
CREATE INDEX "MatchHistory_recommendationRank_idx" ON "MatchHistory"("recommendationRank");

-- CreateIndex
CREATE INDEX "MatchHistory_becameClient_idx" ON "MatchHistory"("becameClient");

-- CreateIndex
CREATE INDEX "MatchHistory_createdAt_idx" ON "MatchHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MatchHistory_clientId_therapistId_createdAt_key" ON "MatchHistory"("clientId", "therapistId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientCompatibility_clientId_idx" ON "ClientCompatibility"("clientId");

-- CreateIndex
CREATE INDEX "ClientCompatibility_therapistId_idx" ON "ClientCompatibility"("therapistId");

-- CreateIndex
CREATE INDEX "ClientCompatibility_overallCompatibility_idx" ON "ClientCompatibility"("overallCompatibility");

-- CreateIndex
CREATE INDEX "ClientCompatibility_createdAt_idx" ON "ClientCompatibility"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientCompatibility_clientId_therapistId_key" ON "ClientCompatibility"("clientId", "therapistId");

-- CreateIndex
CREATE INDEX "RecommendationFeedback_clientId_idx" ON "RecommendationFeedback"("clientId");

-- CreateIndex
CREATE INDEX "RecommendationFeedback_therapistId_idx" ON "RecommendationFeedback"("therapistId");

-- CreateIndex
CREATE INDEX "RecommendationFeedback_selectedTherapist_idx" ON "RecommendationFeedback"("selectedTherapist");

-- CreateIndex
CREATE INDEX "RecommendationFeedback_createdAt_idx" ON "RecommendationFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "AlgorithmPerformance_algorithmName_idx" ON "AlgorithmPerformance"("algorithmName");

-- CreateIndex
CREATE INDEX "AlgorithmPerformance_version_idx" ON "AlgorithmPerformance"("version");

-- CreateIndex
CREATE INDEX "AlgorithmPerformance_periodStart_periodEnd_idx" ON "AlgorithmPerformance"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "AlgorithmPerformance_createdAt_idx" ON "AlgorithmPerformance"("createdAt");

-- AddForeignKey
ALTER TABLE "MatchHistory" ADD CONSTRAINT "MatchHistory_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchHistory" ADD CONSTRAINT "MatchHistory_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCompatibility" ADD CONSTRAINT "ClientCompatibility_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCompatibility" ADD CONSTRAINT "ClientCompatibility_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationFeedback" ADD CONSTRAINT "RecommendationFeedback_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationFeedback" ADD CONSTRAINT "RecommendationFeedback_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationFeedback" ADD CONSTRAINT "RecommendationFeedback_matchHistoryId_fkey" FOREIGN KEY ("matchHistoryId") REFERENCES "MatchHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
