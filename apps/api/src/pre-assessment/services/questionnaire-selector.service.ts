import { Injectable, Logger } from '@nestjs/common';
import { AiProviderFactory } from './ai-provider.factory';
import { LIST_OF_QUESTIONNAIRES } from '../pre-assessment.utils';

export interface QuestionnaireSuggestion {
  questionnaire: string;
  priority: number; // 1-10, higher is more important
  reasoning: string;
  confidence: number; // 0-1
}

export interface QuestionnaireSelectionResult {
  suggestedQuestionnaires: QuestionnaireSuggestion[];
  recommendedOrder: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class QuestionnaireSelectorService {
  private readonly logger = new Logger(QuestionnaireSelectorService.name);

  // Mapping of keywords/symptoms to questionnaires
  private readonly conditionKeywords: Record<string, string[]> = {
    Depression: [
      'depressed',
      'sad',
      'hopeless',
      'worthless',
      'suicidal',
      'loss of interest',
      'fatigue',
      'sleep problems',
      'appetite',
      'concentration',
    ],
    Anxiety: [
      'anxious',
      'worried',
      'nervous',
      'panic',
      'fear',
      'restless',
      'trouble sleeping',
      'irritable',
    ],
    'Post-traumatic stress disorder (PTSD)': [
      'trauma',
      'flashback',
      'nightmare',
      'avoidance',
      'hypervigilance',
      'traumatic event',
      'ptsd',
    ],
    'Obsessive compulsive disorder (OCD)': [
      'obsession',
      'compulsion',
      'repetitive',
      'ritual',
      'intrusive thoughts',
      'ocd',
    ],
    'Bipolar disorder (BD)': [
      'manic',
      'mania',
      'bipolar',
      'mood swings',
      'euphoric',
      'depressed then high',
    ],
    Panic: [
      'panic attack',
      'heart racing',
      'chest pain',
      'shortness of breath',
      'dizziness',
      'fear of dying',
    ],
    Insomnia: [
      'trouble sleeping',
      'insomnia',
      'can\'t sleep',
      'wake up',
      'sleep problems',
      'restless sleep',
    ],
    Stress: [
      'stressed',
      'overwhelmed',
      'pressure',
      'burnout',
      'exhausted',
      'work stress',
    ],
    'ADD / ADHD': [
      'adhd',
      'attention',
      'hyperactive',
      'focus',
      'distracted',
      'impulsive',
      'can\'t concentrate',
    ],
    'Substance or Alcohol Use Issues': [
      'alcohol',
      'drug',
      'substance',
      'addiction',
      'drinking',
      'using',
      'abuse',
    ],
    'Drug Abuse': [
      'drug use',
      'substance abuse',
      'addiction',
      'using drugs',
      'overdose',
    ],
    'Binge eating / Eating disorders': [
      'binge',
      'eating disorder',
      'overeating',
      'purge',
      'body image',
      'anorexia',
      'bulimia',
    ],
    'Social anxiety': [
      'social anxiety',
      'afraid of people',
      'social situations',
      'public speaking',
      'judgment',
    ],
    Phobia: [
      'phobia',
      'fear of',
      'afraid of',
      'avoid',
      'specific fear',
    ],
    Burnout: [
      'burnout',
      'exhausted',
      'work stress',
      'overwhelmed at work',
      'emotional exhaustion',
    ],
  };

  constructor(
    private readonly aiProvider: AiProviderFactory,
  ) {}

  /**
   * Analyze conversation and suggest relevant questionnaires
   */
  async suggestQuestionnaires(
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<QuestionnaireSelectionResult> {
    // Extract user messages
    const userMessages = conversationHistory
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.content)
      .join(' ');

    if (!userMessages.trim()) {
      // No user input yet, return all questionnaires with low priority
      return this.getDefaultSuggestions();
    }

    // Use AI to analyze conversation and suggest questionnaires
    const aiAnalysis = await this.analyzeWithAI(userMessages, conversationHistory);

    // Also do keyword-based matching as fallback/enhancement
    const keywordMatches = this.matchByKeywords(userMessages);

    // Combine AI analysis and keyword matches
    const suggestions = this.combineSuggestions(aiAnalysis, keywordMatches);

    // Determine urgency level
    const urgencyLevel = this.determineUrgency(userMessages, suggestions);

    // Sort by priority
    const sortedSuggestions = suggestions.sort((a, b) => b.priority - a.priority);

    return {
      suggestedQuestionnaires: sortedSuggestions,
      recommendedOrder: sortedSuggestions.map((s) => s.questionnaire),
      urgencyLevel,
    };
  }


  /**
   * Use AI to analyze conversation and suggest questionnaires
   */
  private async analyzeWithAI(
    userMessages: string,
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<QuestionnaireSuggestion[]> {
    const prompt = `Analyze the following mental health conversation and suggest which questionnaires from this list are most relevant:

Available questionnaires: ${LIST_OF_QUESTIONNAIRES.join(', ')}

User's messages: "${userMessages}"

CRITICAL: Be PROACTIVE - if the user mentions ANY symptoms, feelings, or concerns that relate to a questionnaire, suggest it immediately. Don't wait for multiple mentions.

For each relevant questionnaire, provide:
1. The questionnaire name (must match exactly from the list)
2. Priority score (1-10, where 10 is most urgent/relevant)
3. Brief reasoning (why this questionnaire is relevant)
4. Confidence level (0.0-1.0)

Format your response as JSON array:
[
  {
    "questionnaire": "Anxiety",
    "priority": 9,
    "reasoning": "User mentions anxiety and insomnia",
    "confidence": 0.85
  }
]

Be generous with suggestions - if there's any indication of a condition (anxiety, depression, insomnia, stress, etc.), include the relevant questionnaire. Only return an empty array if there are truly no relevant questionnaires.`;

    try {
      // Build enhanced history with system instruction
      const enhancedHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
      let systemMessageFound = false;
      
      for (const msg of conversationHistory) {
        const role = msg.role as 'system' | 'user' | 'assistant';
        
        if (role === 'system' && !systemMessageFound) {
          // Combine the original system message with the questionnaire selection prompt
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
      
      const response = await this.aiProvider.chatCompletion(
        enhancedHistory,
        {
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 1000,
        },
      );

      // Validate response is a string
      if (!response || typeof response !== 'string') {
        this.logger.warn(
          'AI response is not a valid string, cannot extract JSON array',
        );
        return [];
      }

      // Improved regex pattern to match JSON arrays (handles nested arrays/objects better)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch || !jsonMatch[0]) {
        this.logger.warn(
          'No JSON array found in AI response, response preview:',
          response.substring(0, 200),
        );
        return [];
      }

      const jsonString = jsonMatch[0].trim();
      if (!jsonString || jsonString.length < 2) {
        this.logger.warn('Extracted JSON string is too short or empty');
        return [];
      }

      // Try to parse the JSON array with proper error handling
      try {
        const parsed = JSON.parse(jsonString);

        // Validate it's an array
        if (!Array.isArray(parsed)) {
          this.logger.warn(
            'Parsed JSON is not an array, type:',
            typeof parsed,
            'value:',
            parsed,
          );
          return [];
        }

        // Validate and transform array items
        if (parsed.length === 0) {
          this.logger.debug('Parsed JSON array is empty');
          return [];
        }

        this.logger.debug(`Successfully parsed ${parsed.length} questionnaire suggestions`);

        // Map and validate each item
        return parsed
          .filter((item: any) => {
            // Filter out invalid items
            if (!item || typeof item !== 'object') {
              this.logger.warn('Skipping invalid questionnaire suggestion item:', item);
              return false;
            }
            if (!item.questionnaire || typeof item.questionnaire !== 'string') {
              this.logger.warn(
                'Skipping questionnaire suggestion with invalid questionnaire name:',
                item,
              );
              return false;
            }
            return true;
          })
          .map((item: any) => ({
            questionnaire: item.questionnaire,
            priority: Math.min(10, Math.max(1, Number(item.priority) || 5)),
            reasoning: String(item.reasoning || ''),
            confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5)),
          }));
      } catch (parseError) {
        this.logger.error(
          'Failed to parse JSON array from AI response:',
          parseError instanceof Error ? parseError.message : String(parseError),
        );
        this.logger.debug(
          'JSON string that failed to parse:',
          jsonString.substring(0, 500),
        );
        return [];
      }
    } catch (error) {
      // Log error but return empty array to allow fallback to keyword matching
      this.logger.warn('Failed to analyze with AI, falling back to keyword matching:', error);
      return [];
    }
  }

  /**
   * Match questionnaires based on keywords
   */
  private matchByKeywords(userMessages: string): QuestionnaireSuggestion[] {
    const lowerMessages = userMessages.toLowerCase();
    const matches: Record<string, { count: number; keywords: string[] }> = {};

    for (const [questionnaire, keywords] of Object.entries(this.conditionKeywords)) {
      const matchedKeywords: string[] = [];
      let count = 0;

      for (const keyword of keywords) {
        if (lowerMessages.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
          count++;
        }
      }

      if (count > 0) {
        matches[questionnaire] = { count, keywords: matchedKeywords };
      }
    }

    // Convert to suggestions
    return Object.entries(matches).map(([questionnaire, data]) => {
      const priority = Math.min(10, 5 + data.count); // Base 5, +1 per keyword match
      return {
        questionnaire,
        priority,
        reasoning: `Mentioned keywords: ${data.keywords.slice(0, 3).join(', ')}`,
        confidence: Math.min(1, 0.5 + data.count * 0.1), // 0.5 base, +0.1 per match
      };
    });
  }

  /**
   * Combine AI analysis and keyword matches
   */
  private combineSuggestions(
    aiSuggestions: QuestionnaireSuggestion[],
    keywordMatches: QuestionnaireSuggestion[],
  ): QuestionnaireSuggestion[] {
    const combined: Record<string, QuestionnaireSuggestion> = {};

    // Add AI suggestions
    for (const suggestion of aiSuggestions) {
      combined[suggestion.questionnaire] = { ...suggestion };
    }

    // Merge keyword matches (take higher priority/confidence)
    for (const match of keywordMatches) {
      if (combined[match.questionnaire]) {
        // Combine: take higher priority, average confidence, combine reasoning
        combined[match.questionnaire] = {
          questionnaire: match.questionnaire,
          priority: Math.max(
            combined[match.questionnaire].priority,
            match.priority,
          ),
          reasoning: `${combined[match.questionnaire].reasoning}. ${match.reasoning}`,
          confidence: Math.max(
            combined[match.questionnaire].confidence,
            match.confidence,
          ),
        };
      } else {
        combined[match.questionnaire] = { ...match };
      }
    }

    return Object.values(combined);
  }

  /**
   * Determine urgency level from conversation
   */
  private determineUrgency(
    userMessages: string,
    suggestions: QuestionnaireSuggestion[],
  ): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessages = userMessages.toLowerCase();

    // Critical indicators
    const criticalKeywords = [
      'suicidal',
      'kill myself',
      'end my life',
      'want to die',
      'harm myself',
      'self harm',
      'overdose',
    ];
    if (criticalKeywords.some((kw) => lowerMessages.includes(kw))) {
      return 'critical';
    }

    // High urgency indicators
    const highKeywords = [
      'emergency',
      'urgent',
      'crisis',
      'can\'t cope',
      'breaking down',
      'severe',
      'extreme',
    ];
    if (highKeywords.some((kw) => lowerMessages.includes(kw))) {
      return 'high';
    }

    // Check if high-priority questionnaires are suggested
    const highPriorityCount = suggestions.filter((s) => s.priority >= 8).length;
    if (highPriorityCount >= 2) {
      return 'high';
    }

    // Medium urgency
    if (suggestions.length > 0 || lowerMessages.length > 100) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get default suggestions when no conversation data available
   */
  private getDefaultSuggestions(): QuestionnaireSelectionResult {
    const defaultQuestionnaires: QuestionnaireSuggestion[] = [
      {
        questionnaire: 'Depression',
        priority: 5,
        reasoning: 'Common starting point for mental health assessment',
        confidence: 0.3,
      },
      {
        questionnaire: 'Anxiety',
        priority: 5,
        reasoning: 'Common starting point for mental health assessment',
        confidence: 0.3,
      },
      {
        questionnaire: 'Stress',
        priority: 4,
        reasoning: 'General assessment starting point',
        confidence: 0.2,
      },
    ];

    return {
      suggestedQuestionnaires: defaultQuestionnaires,
      recommendedOrder: defaultQuestionnaires.map((s) => s.questionnaire),
      urgencyLevel: 'low',
    };
  }

  /**
   * Get next questionnaire to ask based on current progress
   */
  getNextQuestionnaire(
    completedQuestionnaires: string[],
    suggestions: QuestionnaireSelectionResult,
  ): string | null {
    // Find highest priority questionnaire that hasn't been completed
    for (const questionnaire of suggestions.recommendedOrder) {
      if (!completedQuestionnaires.includes(questionnaire)) {
        return questionnaire;
      }
    }

    // If all suggested are done, return null (assessment may be complete)
    return null;
  }
}

