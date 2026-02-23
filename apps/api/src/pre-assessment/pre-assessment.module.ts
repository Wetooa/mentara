import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PreAssessmentController } from './pre-assessment.controller';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { GeminiClientService } from './services/gemini-client.service';
import { OllamaClientService } from './services/ollama-client.service';
import { AiProviderFactory } from './services/ai-provider.factory';
import { QuestionnaireSelectorService } from './services/questionnaire-selector.service';
import { QuestionnaireFormGeneratorService } from './services/questionnaire-form-generator.service';
import { ConversationInsightsService } from './services/conversation-insights.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { RoleUtils } from '../utils/role-utils';
import { ClinicalInsightsService } from './analysis/clinical-insights.service';
import { TherapeuticRecommendationsService } from './analysis/therapeutic-recommendations.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [PreAssessmentController],
  providers: [
    PreAssessmentService,
    AiServiceClient,
    GeminiClientService,
    OllamaClientService,
    AiProviderFactory,
    QuestionnaireSelectorService,
    QuestionnaireFormGeneratorService,
    ConversationInsightsService,
    PrismaService,
    RoleUtils,
    ClinicalInsightsService,
    TherapeuticRecommendationsService,
  ],
  exports: [
    PreAssessmentService,
    AiServiceClient,
    GeminiClientService,
    OllamaClientService,
    AiProviderFactory,
    QuestionnaireSelectorService,
    QuestionnaireFormGeneratorService,
    ConversationInsightsService,
    ClinicalInsightsService,
    TherapeuticRecommendationsService,
  ],
})
export class PreAssessmentModule { }
