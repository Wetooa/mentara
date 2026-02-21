import { Injectable, Logger } from '@nestjs/common';
import { AiProviderFactory } from './ai-provider.factory';

export interface ConversationInsights {
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative' | 'mixed';
    intensity: number; // 0-1
    keywords: string[];
  };
  mentionedConditions: Array<{
    condition: string;
    confidence: number;
    context: string;
  }>;
  preferences: {
    therapyStyle?: string[];
    therapistCharacteristics?: string[];
    sessionFormat?: string[];
    communicationStyle?: string;
  };
  urgencyIndicators: {
    level: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
  };
  languagePreferences: string[];
  culturalConsiderations: string[];
  pastTherapyExperiences: string[];
  treatmentGoals: string[];
  additionalNotes: string[];
}

@Injectable()
export class ConversationInsightsService {
  private readonly logger = new Logger(ConversationInsightsService.name);

  constructor(
    private readonly aiProvider: AiProviderFactory,
  ) {}

  /**
   * Extract insights from conversation history
   */
  async extractInsights(
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<ConversationInsights> {
    const userMessages = conversationHistory
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.content)
      .join(' ');

    if (!userMessages.trim()) {
      return this.getEmptyInsights();
    }

    // Use AI to extract structured insights
    const aiInsights = await this.extractWithAI(conversationHistory);

    // Also do rule-based extraction as fallback/enhancement
    const ruleBasedInsights = this.extractWithRules(userMessages);

    // Combine AI and rule-based insights
    return this.combineInsights(aiInsights, ruleBasedInsights);
  }

  /**
   * Extract insights using AI
   */
  private async extractWithAI(
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<Partial<ConversationInsights>> {
    const prompt = `Analyze this mental health conversation and extract structured insights in JSON format:

{
  "sentiment": {
    "overall": "positive|neutral|negative|mixed",
    "intensity": 0.0-1.0,
    "keywords": ["keyword1", "keyword2"]
  },
  "mentionedConditions": [
    {
      "condition": "condition name",
      "confidence": 0.0-1.0,
      "context": "why this condition was mentioned"
    }
  ],
  "preferences": {
    "therapyStyle": ["style1", "style2"],
    "therapistCharacteristics": ["characteristic1"],
    "sessionFormat": ["online", "in-person"],
    "communicationStyle": "direct|gentle|supportive"
  },
  "urgencyIndicators": {
    "level": "low|medium|high|critical",
    "indicators": ["indicator1", "indicator2"]
  },
  "languagePreferences": ["English", "Tagalog"],
  "culturalConsiderations": ["consideration1"],
  "pastTherapyExperiences": ["experience1"],
  "treatmentGoals": ["goal1", "goal2"],
  "additionalNotes": ["note1"]
}

Only include fields that are clearly present in the conversation. Return valid JSON only.`;

    try {
      // Build enhanced history with system instruction
      const enhancedHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
      let systemMessageFound = false;
      
      for (const msg of conversationHistory) {
        const role = msg.role as 'system' | 'user' | 'assistant';
        
        if (role === 'system' && !systemMessageFound) {
          // Combine the original system message with the insights extraction prompt
          enhancedHistory.push({
            role: 'system',
            content: `${msg.content}\n\n---\n\n${prompt}`,
          });
          systemMessageFound = true;
        } else {
          // Add other messages as-is
          enhancedHistory.push({
            role,
            content: msg.content,
          });
        }
      }
      
      // If no system message was found, add the prompt as a new system message
      if (!systemMessageFound) {
        enhancedHistory.unshift({
          role: 'system',
          content: prompt,
        });
      }
      
      try {
        const response = await this.aiProvider.chatCompletion(
          enhancedHistory,
          {
            temperature: 0.2, // Low temperature for consistent extraction
            max_tokens: 1500,
          },
        );

        // Try to parse JSON from response
        if (!response || typeof response !== 'string') {
          this.logger.warn(
            'AI response is not a valid string, cannot extract JSON',
          );
          throw new Error('Invalid response format');
        }

        // Improved regex pattern to match JSON objects (handles nested objects better)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch || !jsonMatch[0]) {
          this.logger.warn(
            'No JSON object found in AI response, response preview:',
            response.substring(0, 200),
          );
          throw new Error('No JSON object found in response');
        }

        const jsonString = jsonMatch[0].trim();
        if (!jsonString || jsonString.length < 2) {
          this.logger.warn('Extracted JSON string is too short or empty');
          throw new Error('Invalid JSON string extracted');
        }

        // Validate JSON string before parsing
        try {
          // Try to parse the JSON
          const parsed = JSON.parse(jsonString);

          // Validate it's an object
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            this.logger.warn(
              'Parsed JSON is not an object, type:',
              typeof parsed,
              'isArray:',
              Array.isArray(parsed),
            );
            throw new Error('Parsed JSON is not an object');
          }

          this.logger.debug('Successfully parsed insights JSON');
          return parsed;
        } catch (parseError) {
          this.logger.error(
            'Failed to parse JSON from AI response:',
            parseError instanceof Error ? parseError.message : String(parseError),
          );
          this.logger.debug('JSON string that failed to parse:', jsonString.substring(0, 500));
          throw new Error(
            `JSON parsing failed: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          );
        }
      } catch (error) {
        this.logger.warn('Failed to extract insights with AI, returning empty insights:', error);
        // Return empty insights object on error
        return {
          sentiment: {
            overall: 'neutral' as const,
            intensity: 0,
            keywords: [],
          },
          mentionedConditions: [],
          preferences: {},
          urgencyIndicators: {
            level: 'low' as const,
            indicators: [],
          },
          languagePreferences: [],
          culturalConsiderations: [],
          pastTherapyExperiences: [],
          treatmentGoals: [],
          additionalNotes: [],
        };
      }
    } catch (error) {
      this.logger.warn('AI insight extraction failed, using rule-based only:', error);
    }

    return {};
  }

  /**
   * Extract insights using rule-based patterns
   */
  private extractWithRules(userMessages: string): Partial<ConversationInsights> {
    const lowerMessages = userMessages.toLowerCase();
    const insights: Partial<ConversationInsights> = {
      sentiment: {
        overall: 'neutral',
        intensity: 0.5,
        keywords: [],
      },
      mentionedConditions: [],
      preferences: {},
      urgencyIndicators: {
        level: 'low',
        indicators: [],
      },
      languagePreferences: [],
      culturalConsiderations: [],
      pastTherapyExperiences: [],
      treatmentGoals: [],
      additionalNotes: [],
    };

    // Sentiment analysis
    const positiveWords = ['better', 'improved', 'good', 'happy', 'relief', 'hope'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hopeless', 'desperate', 'suffering'];
    const positiveCount = positiveWords.filter((w) => lowerMessages.includes(w)).length;
    const negativeCount = negativeWords.filter((w) => lowerMessages.includes(w)).length;

    if (negativeCount > positiveCount * 2) {
      insights.sentiment!.overall = 'negative';
      insights.sentiment!.intensity = Math.min(1, 0.5 + negativeCount * 0.1);
    } else if (positiveCount > negativeCount * 2) {
      insights.sentiment!.overall = 'positive';
      insights.sentiment!.intensity = Math.min(1, 0.5 + positiveCount * 0.1);
    } else if (positiveCount > 0 && negativeCount > 0) {
      insights.sentiment!.overall = 'mixed';
    }

    // Urgency indicators
    const criticalKeywords = ['suicidal', 'kill myself', 'end my life', 'harm myself'];
    const highKeywords = ['emergency', 'urgent', 'crisis', 'can\'t cope', 'breaking down'];
    if (criticalKeywords.some((kw) => lowerMessages.includes(kw))) {
      insights.urgencyIndicators!.level = 'critical';
      insights.urgencyIndicators!.indicators = criticalKeywords.filter((kw) =>
        lowerMessages.includes(kw),
      );
    } else if (highKeywords.some((kw) => lowerMessages.includes(kw))) {
      insights.urgencyIndicators!.level = 'high';
      insights.urgencyIndicators!.indicators = highKeywords.filter((kw) =>
        lowerMessages.includes(kw),
      );
    }

    // Language preferences
    const languageKeywords = {
      english: ['english', 'speak english'],
      tagalog: ['tagalog', 'filipino', 'filipino language'],
      spanish: ['spanish', 'español'],
    };
    for (const [lang, keywords] of Object.entries(languageKeywords)) {
      if (keywords.some((kw) => lowerMessages.includes(kw))) {
        insights.languagePreferences!.push(lang.charAt(0).toUpperCase() + lang.slice(1));
      }
    }

    // Therapy preferences
    if (lowerMessages.includes('online') || lowerMessages.includes('video')) {
      insights.preferences!.sessionFormat = ['online'];
    }
    if (lowerMessages.includes('in-person') || lowerMessages.includes('face to face')) {
      insights.preferences!.sessionFormat = [
        ...(insights.preferences!.sessionFormat || []),
        'in-person',
      ];
    }

    // Past therapy experiences
    if (lowerMessages.includes('therapy before') || lowerMessages.includes('counselor')) {
      insights.pastTherapyExperiences!.push('Has previous therapy experience');
    }

    // Treatment goals
    const goalKeywords = [
      'want to',
      'goal',
      'hope to',
      'would like to',
      'need to',
    ];
    // Extract sentences with goal keywords
    const sentences = userMessages.split(/[.!?]/);
    for (const sentence of sentences) {
      if (goalKeywords.some((kw) => sentence.toLowerCase().includes(kw))) {
        insights.treatmentGoals!.push(sentence.trim());
      }
    }

    return insights;
  }

  /**
   * Combine AI and rule-based insights
   */
  private combineInsights(
    aiInsights: Partial<ConversationInsights>,
    ruleInsights: Partial<ConversationInsights>,
  ): ConversationInsights {
    return {
      sentiment: {
        overall:
          (aiInsights.sentiment?.overall as any) ||
          ruleInsights.sentiment?.overall ||
          'neutral',
        intensity:
          aiInsights.sentiment?.intensity ||
          ruleInsights.sentiment?.intensity ||
          0.5,
        keywords: [
          ...(aiInsights.sentiment?.keywords || []),
          ...(ruleInsights.sentiment?.keywords || []),
        ],
      },
      mentionedConditions: [
        ...(aiInsights.mentionedConditions || []),
        ...(ruleInsights.mentionedConditions || []),
      ],
      preferences: {
        therapyStyle: [
          ...(aiInsights.preferences?.therapyStyle || []),
          ...(ruleInsights.preferences?.therapyStyle || []),
        ],
        therapistCharacteristics: [
          ...(aiInsights.preferences?.therapistCharacteristics || []),
          ...(ruleInsights.preferences?.therapistCharacteristics || []),
        ],
        sessionFormat: [
          ...(aiInsights.preferences?.sessionFormat || []),
          ...(ruleInsights.preferences?.sessionFormat || []),
        ],
        communicationStyle:
          aiInsights.preferences?.communicationStyle ||
          ruleInsights.preferences?.communicationStyle,
      },
      urgencyIndicators: {
        level:
          (aiInsights.urgencyIndicators?.level as any) ||
          ruleInsights.urgencyIndicators?.level ||
          'low',
        indicators: [
          ...(aiInsights.urgencyIndicators?.indicators || []),
          ...(ruleInsights.urgencyIndicators?.indicators || []),
        ],
      },
      languagePreferences: [
        ...new Set([
          ...(aiInsights.languagePreferences || []),
          ...(ruleInsights.languagePreferences || []),
        ]),
      ],
      culturalConsiderations: [
        ...(aiInsights.culturalConsiderations || []),
        ...(ruleInsights.culturalConsiderations || []),
      ],
      pastTherapyExperiences: [
        ...(aiInsights.pastTherapyExperiences || []),
        ...(ruleInsights.pastTherapyExperiences || []),
      ],
      treatmentGoals: [
        ...(aiInsights.treatmentGoals || []),
        ...(ruleInsights.treatmentGoals || []),
      ],
      additionalNotes: [
        ...(aiInsights.additionalNotes || []),
        ...(ruleInsights.additionalNotes || []),
      ],
    };
  }

  /**
   * Get empty insights structure
   */
  private getEmptyInsights(): ConversationInsights {
    return {
      sentiment: {
        overall: 'neutral',
        intensity: 0,
        keywords: [],
      },
      mentionedConditions: [],
      preferences: {},
      urgencyIndicators: {
        level: 'low',
        indicators: [],
      },
      languagePreferences: [],
      culturalConsiderations: [],
      pastTherapyExperiences: [],
      treatmentGoals: [],
      additionalNotes: [],
    };
  }

  /**
   * Update insights incrementally (merge new insights with existing)
   */
  updateInsights(
    existing: ConversationInsights,
    newInsights: ConversationInsights,
  ): ConversationInsights {
    return {
      sentiment: {
        overall: newInsights.sentiment.overall !== 'neutral'
          ? newInsights.sentiment.overall
          : existing.sentiment.overall,
        intensity: Math.max(existing.sentiment.intensity, newInsights.sentiment.intensity),
        keywords: [
          ...new Set([...existing.sentiment.keywords, ...newInsights.sentiment.keywords]),
        ],
      },
      mentionedConditions: [
        ...existing.mentionedConditions,
        ...newInsights.mentionedConditions,
      ],
      preferences: {
        therapyStyle: [
          ...new Set([
            ...(existing.preferences.therapyStyle || []),
            ...(newInsights.preferences.therapyStyle || []),
          ]),
        ],
        therapistCharacteristics: [
          ...new Set([
            ...(existing.preferences.therapistCharacteristics || []),
            ...(newInsights.preferences.therapistCharacteristics || []),
          ]),
        ],
        sessionFormat: [
          ...new Set([
            ...(existing.preferences.sessionFormat || []),
            ...(newInsights.preferences.sessionFormat || []),
          ]),
        ],
        communicationStyle:
          newInsights.preferences.communicationStyle ||
          existing.preferences.communicationStyle,
      },
      urgencyIndicators: {
        level:
          this.getHigherUrgencyLevel(
            existing.urgencyIndicators.level,
            newInsights.urgencyIndicators.level,
          ),
        indicators: [
          ...new Set([
            ...existing.urgencyIndicators.indicators,
            ...newInsights.urgencyIndicators.indicators,
          ]),
        ],
      },
      languagePreferences: [
        ...new Set([
          ...existing.languagePreferences,
          ...newInsights.languagePreferences,
        ]),
      ],
      culturalConsiderations: [
        ...new Set([
          ...existing.culturalConsiderations,
          ...newInsights.culturalConsiderations,
        ]),
      ],
      pastTherapyExperiences: [
        ...new Set([
          ...existing.pastTherapyExperiences,
          ...newInsights.pastTherapyExperiences,
        ]),
      ],
      treatmentGoals: [
        ...new Set([...existing.treatmentGoals, ...newInsights.treatmentGoals]),
      ],
      additionalNotes: [
        ...new Set([...existing.additionalNotes, ...newInsights.additionalNotes]),
      ],
    };
  }

  /**
   * Get higher urgency level
   */
  private getHigherUrgencyLevel(
    level1: 'low' | 'medium' | 'high' | 'critical',
    level2: 'low' | 'medium' | 'high' | 'critical',
  ): 'low' | 'medium' | 'high' | 'critical' {
    const levels = { low: 0, medium: 1, high: 2, critical: 3 };
    return levels[level1] > levels[level2] ? level1 : level2;
  }
}

