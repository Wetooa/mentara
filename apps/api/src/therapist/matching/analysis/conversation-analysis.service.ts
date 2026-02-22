import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma-client.provider';
import { ConversationInsights } from '../../../pre-assessment/services/conversation-insights.service';

export interface ConversationAnalysisResult {
  mentionedConditions: string[]; // Conditions mentioned but not in questionnaires
  therapyPreferences: {
    approaches: string[];
    style: string[];
    format: string[];
  };
  urgencyIndicators: {
    level: 'low' | 'medium' | 'high' | 'critical';
    severity: number; // 0-1
  };
  culturalNeeds: {
    languages: string[];
    considerations: string[];
  };
  treatmentGoals: string[];
  communicationStyle: 'direct' | 'gentle' | 'supportive' | 'mixed';
  experienceNeeds: {
    level: 'any' | 'intermediate' | 'senior' | 'expert';
    reasoning: string;
  };
  logisticsPreferences: {
    budget?: number;
    scheduling?: string[];
    location?: string;
  };
}

@Injectable()
export class ConversationAnalysisService {
  private readonly logger = new Logger(ConversationAnalysisService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyze chatbot conversation for matching purposes
   */
  async analyzeConversationForMatching(
    clientId: string,
  ): Promise<ConversationAnalysisResult | null> {
    try {
      // Get the most recent chatbot session for this client
      const session = await this.prisma.chatbotSession.findFirst({
        where: {
          clientId,
          isComplete: true,
        },
        orderBy: {
          completedAt: 'desc',
        },
        select: {
          conversationInsights: true,
          messages: {
            where: {
              role: 'USER',
            },
            select: {
              content: true,
            },
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
      });

      if (!session || !session.conversationInsights) {
        return null;
      }

      const insights = session.conversationInsights as unknown as ConversationInsights;

      // Extract mentioned conditions not in questionnaires
      const mentionedConditions = insights.mentionedConditions
        .filter((c) => c.confidence > 0.5)
        .map((c) => c.condition);

      // Extract therapy preferences
      const therapyPreferences = {
        approaches: insights.preferences.therapyStyle || [],
        style: insights.preferences.therapistCharacteristics || [],
        format: insights.preferences.sessionFormat || [],
      };

      // Determine urgency
      const urgencyIndicators = {
        level: insights.urgencyIndicators.level,
        severity: this.mapUrgencyToSeverity(insights.urgencyIndicators.level),
      };

      // Extract cultural needs
      const culturalNeeds = {
        languages: insights.languagePreferences || [],
        considerations: insights.culturalConsiderations || [],
      };

      // Extract treatment goals
      const treatmentGoals = insights.treatmentGoals || [];

      // Determine communication style
      const communicationStyle = this.determineCommunicationStyle(insights);

      // Determine experience needs based on urgency and complexity
      const experienceNeeds = this.determineExperienceNeeds(
        urgencyIndicators.level,
        mentionedConditions.length,
        insights,
      );

      // Extract logistics preferences
      const logisticsPreferences = this.extractLogisticsPreferences(
        session.messages.map((m) => m.content).join(' '),
      );

      return {
        mentionedConditions,
        therapyPreferences,
        urgencyIndicators,
        culturalNeeds,
        treatmentGoals,
        communicationStyle,
        experienceNeeds,
        logisticsPreferences,
      };
    } catch (error) {
      this.logger.error('Error analyzing conversation for matching:', error);
      return null;
    }
  }

  /**
   * Map urgency level to severity score
   */
  private mapUrgencyToSeverity(
    level: 'low' | 'medium' | 'high' | 'critical',
  ): number {
    const mapping = {
      low: 0.2,
      medium: 0.5,
      high: 0.8,
      critical: 1.0,
    };
    return mapping[level];
  }

  /**
   * Determine communication style from insights
   */
  private determineCommunicationStyle(
    insights: ConversationInsights,
  ): 'direct' | 'gentle' | 'supportive' | 'mixed' {
    const style = insights.preferences.communicationStyle;
    if (style) {
      return style as any;
    }

    // Default based on sentiment
    if (insights.sentiment.overall === 'negative' && insights.sentiment.intensity > 0.7) {
      return 'gentle';
    }
    if (insights.sentiment.overall === 'positive') {
      return 'direct';
    }

    return 'supportive';
  }

  /**
   * Determine experience needs based on conversation
   */
  private determineExperienceNeeds(
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical',
    conditionCount: number,
    insights: ConversationInsights,
  ): { level: 'any' | 'intermediate' | 'senior' | 'expert'; reasoning: string } {
    // Critical or high urgency needs expert
    if (urgencyLevel === 'critical') {
      return {
        level: 'expert',
        reasoning: 'Critical urgency requires expert-level experience',
      };
    }

    if (urgencyLevel === 'high') {
      return {
        level: 'senior',
        reasoning: 'High urgency requires senior-level experience',
      };
    }

    // Multiple conditions need senior or expert
    if (conditionCount >= 3) {
      return {
        level: 'expert',
        reasoning: 'Multiple conditions require expert-level experience',
      };
    }

    if (conditionCount >= 2) {
      return {
        level: 'senior',
        reasoning: 'Multiple conditions require senior-level experience',
      };
    }

    // Past therapy experience might indicate need for different approach
    if (insights.pastTherapyExperiences.length > 0) {
      return {
        level: 'senior',
        reasoning: 'Previous therapy experience suggests need for senior therapist',
      };
    }

    return {
      level: 'intermediate',
      reasoning: 'Standard experience level sufficient',
    };
  }

  /**
   * Extract logistics preferences from conversation
   */
  private extractLogisticsPreferences(
    conversationText: string,
  ): {
    budget?: number;
    scheduling?: string[];
    location?: string;
  } {
    const lowerText = conversationText.toLowerCase();
    const preferences: {
      budget?: number;
      scheduling?: string[];
      location?: string;
    } = {};

    // Extract budget mentions
    const budgetMatch = lowerText.match(/(?:budget|price|cost|afford|pay)\s*(?:of|is|:)?\s*\$?(\d+)/);
    if (budgetMatch) {
      preferences.budget = parseInt(budgetMatch[1], 10);
    }

    // Extract scheduling preferences
    const schedulingKeywords = {
      morning: ['morning', 'am', 'early'],
      afternoon: ['afternoon', 'pm'],
      evening: ['evening', 'night', 'late'],
      weekend: ['weekend', 'saturday', 'sunday'],
      weekday: ['weekday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    };

    const scheduling: string[] = [];
    for (const [key, keywords] of Object.entries(schedulingKeywords)) {
      if (keywords.some((kw) => lowerText.includes(kw))) {
        scheduling.push(key);
      }
    }
    if (scheduling.length > 0) {
      preferences.scheduling = scheduling;
    }

    // Extract location preferences
    const locationMatch = lowerText.match(/(?:location|province|city|area)\s*(?:is|:)?\s*([a-z\s]+)/i);
    if (locationMatch) {
      preferences.location = locationMatch[1].trim();
    }

    return preferences;
  }
}

