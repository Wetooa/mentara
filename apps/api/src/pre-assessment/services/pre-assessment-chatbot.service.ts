import { Injectable, Logger, NotFoundException, HttpException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProviderFactory } from './ai-provider.factory';
import { QuestionnaireSelectorService, QuestionnaireSelectionResult } from './questionnaire-selector.service';
import { QuestionnaireFormGeneratorService, QuestionnaireFormData } from './questionnaire-form-generator.service';
import { ConversationInsightsService, ConversationInsights } from './conversation-insights.service';
import {
  LIST_OF_QUESTIONNAIRES,
  QUESTIONNAIRE_SCORING,
  processPreAssessmentAnswers,
  type QuestionnaireScores,
} from '../pre-assessment.utils';
import { PrismaService } from '../../providers/prisma-client.provider';
import { ChatbotMessageRole, Prisma } from '@prisma/client';

interface ChatbotSessionData {
  sessionId: string;
  userId: string | null;
  conversationHistory: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  currentQuestionnaire: string | null;
  collectedAnswers: Record<string, number[]>; // questionnaire -> answers
  structuredAnswers: Record<string, number>; // questionId -> answer for tool call questions
  currentQuestionIndex: number;
  startedAt: Date;
  lastActivity: Date;
  isComplete: boolean;
}

// Type aliases for better type safety
type AuthenticatedChatbotSessionData = ChatbotSessionData & { userId: string };
type AnonymousChatbotSessionData = ChatbotSessionData & { userId: null };

@Injectable()
export class PreAssessmentChatbotService {
  private readonly logger = new Logger(PreAssessmentChatbotService.name);
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor(
    private readonly aiProvider: AiProviderFactory,
    private readonly prisma: PrismaService,
    private readonly questionnaireSelector: QuestionnaireSelectorService,
    private readonly formGenerator: QuestionnaireFormGeneratorService,
    private readonly insightsService: ConversationInsightsService,
    private readonly configService: ConfigService,
  ) {
    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Initialize a new chatbot session
   * Supports both authenticated and anonymous sessions
   */
  async startSession(userId?: string): Promise<{ sessionId: string }> {
    let clientId: string | undefined = undefined;

    // If userId is provided, validate and get client ID
    if (userId) {
      const client = await this.prisma.client.findUnique({
        where: { userId },
        select: { userId: true },
      });

      if (client) {
        clientId = client.userId;
      } else {
        // User exists but no client profile - that's OK, we'll create anonymous session
        this.logger.warn(`User ${userId} has no client profile, creating anonymous session`);
      }
    }

    // Generate unique session ID (anonymous sessions use timestamp + random)
    const sessionId = userId 
      ? `chatbot_${userId}_${Date.now()}`
      : `chatbot_anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Get system prompt - use initial lightweight prompt for new sessions (Phase 1)
    const systemPrompt = this.buildInitialSystemPrompt();
    const welcomeMessage = this.getWelcomeMessage();

    // Create session in database (userId and clientId are optional for anonymous sessions)
    // Build data with explicit null values - Prisma requires fields to be present even when null
    const createData: any = {
      sessionId,
      userId: userId || null,
      clientId: clientId || null,
      currentQuestionnaire: null,
      completedQuestionnaires: [],
      collectedAnswers: {},
      structuredAnswers: {},
      conversationInsights: null,
      isComplete: false,
      messages: {
        create: [
          {
            role: ChatbotMessageRole.SYSTEM,
            content: systemPrompt,
          },
          {
            role: ChatbotMessageRole.ASSISTANT,
            content: welcomeMessage,
          },
        ],
      },
    };

    // Cast the create method to any to bypass TypeScript/Prisma relation validation
    // This allows us to set clientId to null for anonymous sessions
    const session = await (this.prisma.chatbotSession.create as any)({
      data: createData,
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (userId) {
      this.logger.log(`Started chatbot session ${sessionId} for user ${userId}`);
    } else {
      this.logger.log(`Started anonymous chatbot session ${sessionId}`);
    }

    return { sessionId };
  }

  /**
   * Send a message to the chatbot and get response
   */
  async sendMessage(
    sessionId: string,
    userId: string | undefined,
    userMessage: string,
  ): Promise<{
    response: string;
    isComplete: boolean;
    currentQuestionnaire?: string;
    shouldShowQuestionnaire?: boolean;
    questionnaireData?: QuestionnaireFormData;
    toolCall?: {
      tool: string;
      questionId: string;
      topic?: string;
      question: string;
      options: Array<{ value: number; label: string }>;
    };
  }> {
    // Get session from database
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    // Validate session ownership (if userId provided, it must match; anonymous sessions have null userId)
    if (userId && session.userId && session.userId !== userId) {
      throw new NotFoundException('Session does not belong to user');
    }
    
    // If session has userId but request doesn't, reject (can't access authenticated session anonymously)
    if (session.userId && !userId) {
      throw new NotFoundException('This session requires authentication');
    }

    if (session.isComplete) {
      return {
        response: 'The assessment is already complete. You can view your results in your dashboard.',
        isComplete: true,
      };
    }

    // Build conversation history from messages
    this.logger.log(`Building conversation history from ${session.messages.length} messages`);
    const conversationHistory = this.buildConversationHistory(session.messages);
    this.logger.log(`Built conversation history with ${conversationHistory.length} messages`);
    
    // Log message roles for debugging
    const roleCounts = conversationHistory.reduce((acc, msg) => {
      acc[msg.role] = (acc[msg.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.logger.log(`Message role distribution: ${JSON.stringify(roleCounts)}`);

    // Check if this is an "Answer submitted" message (auto-generated by frontend after structured answer)
    const isAnswerSubmittedMessage = userMessage.trim().toLowerCase() === 'answer submitted' || 
                                     userMessage.trim().toLowerCase().includes('answer submitted');
    
    // Add user message to history (but modify "Answer submitted" to be more informative)
    let messageForHistory = userMessage;
    if (isAnswerSubmittedMessage) {
      // Don't add "Answer submitted" as a user message - it's just a trigger for auto-continue
      // Instead, we'll let the AI know via context that an answer was submitted
      this.logger.log('Detected "Answer submitted" message - will handle via structured answers context');
      // Still add it to history but the AI will understand from context
      messageForHistory = 'I have answered the question.';
    }
    
    conversationHistory.push({
      role: 'user',
      content: messageForHistory,
    });
    this.logger.log(`Added user message. Total messages: ${conversationHistory.length}`);

    // Store user message in database (use the modified message)
    await this.prisma.chatbotMessage.create({
      data: {
        sessionId: session.id,
        role: ChatbotMessageRole.USER,
        content: messageForHistory,
      },
    });

    try {
      // Extract conversation insights (gracefully handle errors)
      // Skip insights extraction for "Answer submitted" messages to reduce API calls
      // In development mode, skip AI-based insights extraction
      const isDevelopment = process.env.NODE_ENV === 'development';
      this.logger.log(`🔍 [DEBUG] NODE_ENV check: ${process.env.NODE_ENV}, isDevelopment: ${isDevelopment}`);
      let newInsights: ConversationInsights | null = null;
      let updatedInsights = (session.conversationInsights as any) || null;
      if (!isAnswerSubmittedMessage && !isDevelopment) {
        try {
          newInsights = await this.insightsService.extractInsights(conversationHistory);
          const existingInsights = (session.conversationInsights as any) || null;
          updatedInsights = existingInsights && newInsights
            ? this.insightsService.updateInsights(existingInsights, newInsights)
            : newInsights || existingInsights;
        } catch (insightsError) {
          this.logger.warn('Failed to extract conversation insights (non-critical):', insightsError);
          // Continue without insights
        }
      } else {
        if (isDevelopment) {
          this.logger.log('🔧 [DEV MODE] Skipping AI-based insights extraction');
        } else {
          this.logger.log('Skipping insights extraction for "Answer submitted" message to reduce API calls');
        }
      }

      // Suggest questionnaires based on conversation (gracefully handle errors)
      // Only call AI-based questionnaire selection if we don't have a current questionnaire yet
      // This reduces API calls and prevents rate limiting
      let questionnaireSelection: QuestionnaireSelectionResult = { 
        recommendedOrder: [], 
        suggestedQuestionnaires: [], 
        urgencyLevel: 'low' as const 
      };
      
      // Check if we have a current questionnaire (isAnswerSubmittedMessage already defined above)
      const hasCurrentQuestionnaire = !!session.currentQuestionnaire;
      const hasRecentStructuredAnswerBeforeRefresh = session.structuredAnswers && 
                                        Object.keys(session.structuredAnswers as Record<string, number>).length > 0;
      
      // Only call AI for questionnaire selection if:
      // 1. We don't have a current questionnaire yet
      // 2. This is not an "Answer submitted" message (which is auto-generated)
      // 3. We don't have recent structured answers (meaning user is actively answering)
      // 4. We're NOT in development mode (development mode uses hardcoded Anxiety questionnaire)
      if (!hasCurrentQuestionnaire && !isAnswerSubmittedMessage && !hasRecentStructuredAnswerBeforeRefresh && !isDevelopment) {
        try {
          questionnaireSelection = await this.questionnaireSelector.suggestQuestionnaires(
            conversationHistory,
          );
        } catch (questionnaireError) {
          this.logger.warn('Failed to suggest questionnaires (non-critical):', questionnaireError);
          // Continue with empty selection
        }
      } else {
        if (isDevelopment) {
          this.logger.log('🔧 [DEV MODE] Skipping AI-based questionnaire selection - using hardcoded Anxiety questionnaire');
        } else {
          this.logger.log('Skipping AI-based questionnaire selection to reduce API calls (has current questionnaire or is answer submission)');
        }
      }

      // Refresh session to get latest structured answers (in case answer was just submitted)
      const refreshedSession = await this.prisma.chatbotSession.findUnique({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });
      
      if (refreshedSession) {
        // Update session with refreshed data
        session.structuredAnswers = refreshedSession.structuredAnswers;
        session.collectedAnswers = refreshedSession.collectedAnswers;
        session.currentQuestionnaire = refreshedSession.currentQuestionnaire;
        session.completedQuestionnaires = refreshedSession.completedQuestionnaires;
      }

      // Determine next questionnaire to ask
      const nextQuestionnaire = this.questionnaireSelector.getNextQuestionnaire(
        session.completedQuestionnaires,
        questionnaireSelection,
      );

      // Update current questionnaire if we have a suggestion
      let currentQuestionnaire = session.currentQuestionnaire;
      if (nextQuestionnaire && !session.currentQuestionnaire) {
        currentQuestionnaire = nextQuestionnaire;
      }

      // In development mode, ensure we're working on Anxiety questionnaire
      // Note: isDevelopment was already declared earlier in this function
      if (isDevelopment && !currentQuestionnaire) {
        currentQuestionnaire = 'Anxiety';
        this.logger.log('🔧 [DEV MODE] Setting current questionnaire to Anxiety');
      }

      // Enhance conversation history with questionnaire context for AI
      const enhancedHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = this.enhanceHistoryWithQuestionnaireContext(
        conversationHistory,
        currentQuestionnaire,
        questionnaireSelection,
        session.structuredAnswers as Record<string, number> | undefined,
        isAnswerSubmittedMessage,
      );

      // Get structured answers for mock response (already checked isDevelopment above)
      const structuredAnswers = (session.structuredAnswers as Record<string, number>) || {};
      
      let aiResponse: string;
      let usedFallback = false;

      if (isDevelopment) {
        // Use mock responses in development mode
        this.logger.log('🔧 [DEV MODE] Using mock responses with anxiety tool calls - BYPASSING LLM');
        this.logger.log(`🔧 [DEV MODE] NODE_ENV: ${process.env.NODE_ENV}`);
        // Count user messages to determine conversation phase
        const userMessageCount = conversationHistory.filter(msg => msg.role === 'user').length;
        aiResponse = this.getMockResponse(structuredAnswers, currentQuestionnaire, userMessageCount);
        this.logger.log(`✅ [DEV MODE] Mock Response (first 200 chars): ${aiResponse.substring(0, 200)}...`);
      } else {
        // Log conversation history being sent to AI Provider
        this.logger.log('=== Sending to AI Provider ===');
        this.logger.log(`Session ID: ${sessionId}`);
        this.logger.log(`Current Questionnaire: ${currentQuestionnaire || 'none'}`);
        this.logger.log(`Conversation History Length: ${conversationHistory.length}`);
        this.logger.log(`Enhanced History Length: ${enhancedHistory.length}`);
        this.logger.log(`Enhanced History: ${JSON.stringify(enhancedHistory, null, 2)}`);

        // Get AI response
        this.logger.log(`Calling AI Provider (${this.aiProvider.getProvider()}) chatCompletion...`);
        
        try {
          aiResponse = await this.aiProvider.chatCompletion(
            enhancedHistory,
            {
              temperature: 0.7,
              max_tokens: 4000,
            },
          );
          this.logger.log(`✅ Received AI Response (first 200 chars): ${aiResponse.substring(0, 200)}...`);
        } catch (aiError) {
        // If AI provider fails, provide a helpful fallback response
        this.logger.error('❌ AI Provider call failed, using fallback response');
        this.logger.error('Error details:', aiError instanceof Error ? aiError.message : String(aiError));
        
        usedFallback = true;
        
        // Determine fallback response based on error type
        if (aiError instanceof HttpException) {
          const status = aiError.getStatus();
          const errorMessage = aiError.message;
          
          if (status === 400) {
            // Bad request - likely model or format issue
            this.logger.error('⚠️ Bad Request Error - Check model configuration or request format');
            aiResponse = this.getFallbackResponse(userMessage, 'config_error');
          } else if (status === 401 || status === 403) {
            // Authentication error
            this.logger.error('⚠️ Authentication Error - Check API key');
            aiResponse = this.getFallbackResponse(userMessage, 'auth_error');
          } else if (status === 429) {
            // Rate limit
            this.logger.error('⚠️ Rate Limit Error - Too many requests');
            aiResponse = this.getFallbackResponse(userMessage, 'rate_limit');
          } else if (status === 500 || status === 503) {
            // Server error
            this.logger.error('⚠️ Server Error - AI service issue');
            aiResponse = this.getFallbackResponse(userMessage, 'server_error');
          } else {
            // Unknown error
            aiResponse = this.getFallbackResponse(userMessage, 'unknown');
          }
        } else {
          // Non-HTTP error (network, timeout, etc.)
          this.logger.error('⚠️ Network or Timeout Error');
          aiResponse = this.getFallbackResponse(userMessage, 'network_error');
        }
        
        this.logger.warn(`📝 Using fallback response (type: ${usedFallback ? 'fallback' : 'ai'})`);
        }
      }

      // Parse tool calls from AI response
      const { conversationalText, toolCall } = this.parseToolCalls(aiResponse);
      
      // Log tool call detection
      if (toolCall) {
        this.logger.log(`✅ Tool call detected: ${toolCall.tool} - ${toolCall.questionId}`);
      }

      // Store AI response in database with questionnaire context
      // Use conversational text only (without tool call JSON)
      await this.prisma.chatbotMessage.create({
        data: {
          sessionId: session.id,
          role: ChatbotMessageRole.ASSISTANT,
          content: conversationalText,
          questionnaireContext: currentQuestionnaire || undefined,
        },
      });

      // Check if this is an "Answer submitted" message and if we have a recent structured answer
      // (Note: isAnswerSubmittedMessage was already determined above)
      // structuredAnswers was already declared earlier in this function
      const hasRecentStructuredAnswer = Object.keys(structuredAnswers).length > 0;
      
      // If this is an "Answer submitted" message and we have structured answers, 
      // the answer was already submitted via submitStructuredAnswer endpoint
      // Don't try to extract it again from the message
      let extractedAnswer: number | null = null;
      if (!isAnswerSubmittedMessage || !hasRecentStructuredAnswer) {
        extractedAnswer = this.extractAnswerFromMessage(messageForHistory);
      } else {
        this.logger.log('Detected "Answer submitted" message with existing structured answer - answer already recorded');
      }
      
      const collectedAnswers = session.collectedAnswers as Record<string, number[]>;
      let updatedAnswers = collectedAnswers;
      let updatedCompletedQuestionnaires = [...session.completedQuestionnaires];
      
      if (extractedAnswer !== null && currentQuestionnaire) {
        updatedAnswers = this.updateCollectedAnswers(
          collectedAnswers,
          currentQuestionnaire,
          extractedAnswer,
        );

        // Check if questionnaire is complete
        const config = QUESTIONNAIRE_SCORING[currentQuestionnaire];
        if (config) {
          const expectedCount = Object.keys(config.severityLevels).length * 5; // Approximate
          if (updatedAnswers[currentQuestionnaire]?.length >= expectedCount) {
            if (!updatedCompletedQuestionnaires.includes(currentQuestionnaire)) {
              updatedCompletedQuestionnaires.push(currentQuestionnaire);
            }
            // Move to next questionnaire
            currentQuestionnaire = this.questionnaireSelector.getNextQuestionnaire(
              updatedCompletedQuestionnaires,
              questionnaireSelection,
            );
          }
        }
      }

      // Check if we should complete the session
      const shouldComplete = this.shouldCompleteSession(
        updatedAnswers,
        updatedCompletedQuestionnaires,
      );

      // Determine if we should show a questionnaire form
      // Show form if: high priority suggestion, user seems confused, or specific topic detected
      let shouldShowQuestionnaire = false;
      let questionnaireData: QuestionnaireFormData | undefined;

      if (questionnaireSelection.suggestedQuestionnaires.length > 0 && !shouldComplete) {
        // Get the highest priority suggestion that hasn't been shown yet
        const presentedQuestionnaires = (session.presentedQuestionnaires as string[]) || [];
        const topSuggestion = questionnaireSelection.suggestedQuestionnaires.find(
          (s) => !presentedQuestionnaires.includes(s.questionnaire),
        );

        if (topSuggestion && topSuggestion.priority >= 7) {
          // High priority - show form
          shouldShowQuestionnaire = true;
          questionnaireData = this.formGenerator.generateQuestionnaireForm(
            topSuggestion.questionnaire,
            topSuggestion.priority,
          ) || undefined;

          // Track that we've presented this questionnaire
          presentedQuestionnaires.push(topSuggestion.questionnaire);
        }
      }

      // Update session with all changes
      await this.prisma.chatbotSession.update({
        where: { id: session.id },
        data: {
          collectedAnswers: updatedAnswers,
          completedQuestionnaires: updatedCompletedQuestionnaires,
          currentQuestionnaire: currentQuestionnaire,
          conversationInsights: updatedInsights as any,
          presentedQuestionnaires: shouldShowQuestionnaire
            ? [...((session.presentedQuestionnaires as string[]) || []), questionnaireData?.topic || '']
            : (session.presentedQuestionnaires as string[]) || [],
          lastActivity: new Date(),
          isComplete: shouldComplete,
          ...(shouldComplete && { completedAt: new Date() }),
        },
      });

      return {
        response: conversationalText,
        isComplete: shouldComplete,
        currentQuestionnaire: currentQuestionnaire || undefined,
        shouldShowQuestionnaire,
        questionnaireData,
        toolCall: toolCall || undefined,
      };
    } catch (error) {
      this.logger.error('=== Error getting chatbot response ===');
      this.logger.error('Error type:', error?.constructor?.name);
      this.logger.error('Error message:', error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        this.logger.error('Error stack:', error.stack);
      }
      this.logger.error('Session ID:', sessionId);
      this.logger.error('User ID:', userId);
      this.logger.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }
  }

  /**
   * Complete the chatbot session and generate assessment results
   */
  async completeSession(
    sessionId: string,
    userId: string | undefined,
  ): Promise<{
    scores: QuestionnaireScores;
    severityLevels: Record<string, string>;
  }> {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    // Validate session ownership (if userId provided, it must match; anonymous sessions have null userId)
    if (userId && session.userId && session.userId !== userId) {
      throw new NotFoundException('Session does not belong to user');
    }
    
    // If session has userId but request doesn't, reject (can't access authenticated session anonymously)
    if (session.userId && !userId) {
      throw new NotFoundException('This session requires authentication');
    }

    // Merge structured answers with collected answers
    const collectedAnswers = session.collectedAnswers as Record<string, number[]>;
    const structuredAnswers = (session.structuredAnswers as Record<string, number>) || {};
    
    // Merge structured answers into collected answers
    const mergedAnswers = this.mergeStructuredAnswers(collectedAnswers, structuredAnswers);
    
    // Convert collected answers to the format expected by processPreAssessmentAnswers
    const answers = this.convertAnswersToArray(mergedAnswers, {});

    // Process answers to get scores and severity levels
    const { scores: rawScores, severityLevels } = processPreAssessmentAnswers(answers);

    // Convert scores to QuestionnaireScores format
    const scores: QuestionnaireScores = Object.fromEntries(
      Object.entries(rawScores).map(([key, score]) => [
        key,
        {
          score: score,
          severity: severityLevels[key] || 'unknown',
        },
      ]),
    );

    // Mark session as complete
    await this.prisma.chatbotSession.update({
      where: { id: session.id },
      data: {
        isComplete: true,
        completedAt: new Date(),
      },
    });

    if (userId) {
      this.logger.log(
        `Completed chatbot session ${sessionId} for user ${userId}`,
      );
    } else {
      this.logger.log(
        `Completed anonymous chatbot session ${sessionId}`,
      );
    }

    return { scores, severityLevels };
  }

  /**
   * Link an anonymous session to a user account
   * Returns the session data needed to create a PreAssessment
   */
  async linkAnonymousSessionToUser(
    sessionId: string,
    userId: string,
  ): Promise<{
    sessionId: string;
    scores: QuestionnaireScores;
    severityLevels: Record<string, string>;
    answers: number[];
    conversationInsights: any;
  }> {
    // Find session by sessionId
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    // Verify it's an anonymous session (userId is null)
    if (session.userId !== null) {
      throw new BadRequestException('Session is already linked to a user');
    }

    // Validate user exists and get client ID
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { userId: true },
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    // Calculate scores and severity levels
    const collectedAnswers = session.collectedAnswers as Record<string, number[]>;
    const structuredAnswers = (session.structuredAnswers as Record<string, number>) || {};
    const mergedAnswers = this.mergeStructuredAnswers(collectedAnswers, structuredAnswers);
    const answers = this.convertAnswersToArray(mergedAnswers, {});

    // Process answers to get scores and severity levels
    const { scores: rawScores, severityLevels } = processPreAssessmentAnswers(answers);

    // Convert scores to QuestionnaireScores format
    const scores: QuestionnaireScores = Object.fromEntries(
      Object.entries(rawScores).map(([key, score]) => [
        key,
        {
          score: score,
          severity: severityLevels[key] || 'unknown',
        },
      ]),
    );

    // Update session with userId and clientId
    await this.prisma.chatbotSession.update({
      where: { id: session.id },
      data: {
        userId,
        clientId: client.userId,
      },
    });

    this.logger.log(
      `Linked anonymous session ${sessionId} to user ${userId}`,
    );

    return {
      sessionId,
      scores,
      severityLevels,
      answers,
      conversationInsights: session.conversationInsights,
    };
  }

  /**
   * Submit a structured answer from a tool call question
   */
  async submitStructuredAnswer(
    sessionId: string,
    userId: string | undefined,
    questionId: string,
    answer: number,
  ): Promise<{
    success: boolean;
    acknowledged: string;
  }> {
    // Get session from database
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    // Validate session ownership (if userId provided, it must match; anonymous sessions have null userId)
    if (userId && session.userId && session.userId !== userId) {
      throw new NotFoundException('Session does not belong to user');
    }
    
    // If session has userId but request doesn't, reject (can't access authenticated session anonymously)
    if (session.userId && !userId) {
      throw new NotFoundException('This session requires authentication');
    }

    if (session.isComplete) {
      return {
        success: false,
        acknowledged: 'The assessment is already complete.',
      };
    }

    // Parse questionId to extract topic (format: topic_lowercase_qN)
    const questionIdParts = questionId.split('_q');
    const topic = questionIdParts[0]
      ? questionIdParts[0]
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'Unknown';

    // Get current collected answers
    const collectedAnswers = (session.collectedAnswers as Record<string, number[]>) || {};

    // Initialize topic array if it doesn't exist
    if (!collectedAnswers[topic]) {
      collectedAnswers[topic] = [];
    }

    // Add the answer to the topic's array
    collectedAnswers[topic].push(answer);

    // Store structured answers separately for tracking
    const structuredAnswers = (session.structuredAnswers as Record<string, number>) || {};
    structuredAnswers[questionId] = answer;

    // Update session with the new answer
    await this.prisma.chatbotSession.update({
      where: { id: session.id },
      data: {
        collectedAnswers: collectedAnswers,
        structuredAnswers: structuredAnswers,
        lastActivity: new Date(),
      },
    });

    this.logger.log(
      `Stored structured answer for question ${questionId} (topic: ${topic}): ${answer}`,
    );

    return {
      success: true,
      acknowledged: 'Thank you for your answer.',
    };
  }

  /**
   * Get session state
   */
  async getSession(sessionId: string, userId: string | undefined): Promise<ChatbotSessionData | null> {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Validate session ownership
    if (userId && session.userId && session.userId !== userId) {
      return null;
    }
    
    // If session has userId but request doesn't, reject (can't access authenticated session anonymously)
    if (session.userId && !userId) {
      return null;
    }

    return this.convertToSessionData(session);
  }

  /**
   * Resume a session (get existing session)
   */
  async resumeSession(sessionId: string, userId: string | undefined): Promise<ChatbotSessionData | null> {
    return this.getSession(sessionId, userId);
  }

  /**
   * Get all sessions for a user (or all anonymous sessions if userId is undefined)
   */
  async getUserSessions(userId: string | undefined): Promise<Array<{
    sessionId: string;
    startedAt: Date;
    completedAt: Date | null;
    isComplete: boolean;
    completedQuestionnaires: string[];
  }>> {
    const whereClause: Prisma.ChatbotSessionWhereInput = userId 
      ? { userId } 
      : { userId: null as any }; // Type assertion needed for null filtering
    
    const sessions = await this.prisma.chatbotSession.findMany({
      where: whereClause,
      select: {
        sessionId: true,
        startedAt: true,
        completedAt: true,
        isComplete: true,
        completedQuestionnaires: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    return sessions;
  }

  /**
   * Build conversation history from database messages
   */
  private buildConversationHistory(
    messages: Array<{
      role: ChatbotMessageRole;
      content: string;
    }>,
  ): Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }> {
    const history = messages.map((msg, index) => {
      let role: 'system' | 'user' | 'assistant' = 'user'; // Default
      switch (msg.role) {
        case ChatbotMessageRole.SYSTEM:
          role = 'system';
          break;
        case ChatbotMessageRole.USER:
          role = 'user';
          break;
        case ChatbotMessageRole.ASSISTANT:
          role = 'assistant';
          break;
      }
      
      // Log first few messages for debugging
      if (index < 3) {
        this.logger.debug(`Message ${index}: role=${role}, content preview=${msg.content.substring(0, 50)}...`);
      }
      
      return { role, content: msg.content };
    });
    
    // Verify we have at least a system message
    const hasSystemMessage = history.some(msg => msg.role === 'system');
    if (!hasSystemMessage && history.length > 0) {
      this.logger.warn('⚠️ Conversation history does not contain a system message');
    }
    
    return history;
  }

  /**
   * Convert database session to session data format
   */
  private convertToSessionData(session: any): ChatbotSessionData {
    const conversationHistory = this.buildConversationHistory(session.messages);
    const collectedAnswers = (session.collectedAnswers as Record<string, number[]>) || {};
    const structuredAnswers = (session.structuredAnswers as Record<string, number>) || {};

    return {
      sessionId: session.sessionId,
      userId: session.userId ?? null,
      conversationHistory,
      currentQuestionnaire: session.currentQuestionnaire,
      collectedAnswers,
      structuredAnswers,
      currentQuestionIndex: 0, // Will be calculated based on collected answers
      startedAt: session.startedAt,
      lastActivity: session.lastActivity,
      isComplete: session.isComplete,
    };
  }

  /**
   * Parse tool calls from AI response
   * Extracts TOOL_CALL JSON blocks and separates them from conversational text
   */
  private parseToolCalls(aiResponse: string): {
    conversationalText: string;
    toolCall: {
      tool: string;
      questionId: string;
      topic?: string;
      question: string;
      options: Array<{ value: number; label: string }>;
    } | null;
  } {
    // Extract TOOL_CALL JSON block using regex that handles nested structures
    // Also handle markdown formatting like **TOOL_CALL:** as fallback
    const toolCallRegex = /(?:\*\*)?TOOL_CALL(?:\*\*)?:\s*(\{[\s\S]*?\})\s*(?:\n|$)/;
    const match = aiResponse.match(toolCallRegex);

    if (!match) {
      // No tool call found, return original response
      return {
        conversationalText: aiResponse,
        toolCall: null,
      };
    }

    try {
      const jsonString = match[1];
      const parsed = JSON.parse(jsonString);

      // Validate tool call structure
      if (
        parsed.tool === 'ask_question' &&
        parsed.questionId &&
        parsed.question &&
        Array.isArray(parsed.options) &&
        parsed.options.length > 0
      ) {
        // Validate options structure
        const validOptions = parsed.options.every(
          (opt: any) =>
            typeof opt.value === 'number' && typeof opt.label === 'string',
        );

        if (!validOptions) {
          this.logger.warn('Invalid options structure in tool call');
          return {
            conversationalText: aiResponse,
            toolCall: null,
          };
        }

        // Remove tool call from conversational text
        const conversationalText = aiResponse
          .replace(toolCallRegex, '')
          .trim();

        return {
          conversationalText,
          toolCall: {
            tool: parsed.tool,
            questionId: parsed.questionId,
            topic: parsed.topic,
            question: parsed.question,
            options: parsed.options,
          },
        };
      } else {
        this.logger.warn('Tool call missing required fields');
        return {
          conversationalText: aiResponse,
          toolCall: null,
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse tool call JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        conversationalText: aiResponse,
        toolCall: null,
      };
    }
  }

  /**
   * Extract answer from user message
   */
  private extractAnswerFromMessage(userMessage: string): number | null {
    // Try to extract numeric answer (0-4 scale)
    const numericMatch = userMessage.match(/\b([0-4])\b/);
    if (numericMatch) {
      return parseInt(numericMatch[1], 10);
    }

    // Try to extract from natural language
    return this.extractAnswerFromText(userMessage);
  }

  /**
   * Extract numeric answer from natural language
   */
  private extractAnswerFromText(text: string): number | null {
    const lowerText = text.toLowerCase();

    // Patterns for "not at all" / "never" -> 0
    if (
      lowerText.match(/\b(not at all|never|none|no|nothing)\b/) ||
      lowerText.match(/\b(never|rarely)\b.*\b(experienced|felt|had)\b/)
    ) {
      return 0;
    }

    // Patterns for "a little" / "sometimes" -> 1
    if (
      lowerText.match(/\b(a little|slightly|somewhat|sometimes|occasionally)\b/) ||
      lowerText.match(/\b(once|twice)\b.*\b(week|month)\b/)
    ) {
      return 1;
    }

    // Patterns for "moderately" / "often" -> 2
    if (
      lowerText.match(/\b(moderately|often|frequently|regularly)\b/) ||
      lowerText.match(/\b(several|few)\b.*\b(times|days)\b/)
    ) {
      return 2;
    }

    // Patterns for "very" / "most of the time" -> 3
    if (
      lowerText.match(/\b(very|quite|most of the time|almost always)\b/) ||
      lowerText.match(/\b(daily|every day)\b/)
    ) {
      return 3;
    }

    // Patterns for "extremely" / "all the time" -> 4
    if (
      lowerText.match(/\b(extremely|all the time|constantly|always)\b/) ||
      lowerText.match(/\b(severe|intense)\b/)
    ) {
      return 4;
    }

    return null;
  }

  /**
   * Get mock response for development mode
   * Returns hardcoded anxiety-focused responses with tool calls
   */
  private getMockResponse(
    structuredAnswers: Record<string, number>,
    currentQuestionnaire: string | null,
    userMessageCount: number = 0,
  ): string {
    const answeredCount = Object.keys(structuredAnswers).filter((id) =>
      id.startsWith('anxiety_q'),
    ).length;

    // Handle initial conversation before tool calls start
    // First user message: about feeling anxious due to exams
    if (userMessageCount === 1 && answeredCount === 0) {
      return "I understand. Exams can be really tough and it's completely normal to feel anxious about them. The pressure of upcoming tests, deadlines, and the fear of not performing well can definitely take a toll on your mental well-being. I'm here to help you work through these feelings. Can you tell me a bit more about how this anxiety has been affecting your daily life? For example, are you finding it hard to focus on studying, or is it impacting your sleep?";
    }

    // Second user message: follow-up response before starting structured questions
    if (userMessageCount === 2 && answeredCount === 0) {
      return "Thank you for sharing that with me. It sounds like the anxiety around your exams is really impacting you, and I want to make sure we get a clear picture of what you're experiencing. To help me understand better and connect you with the right support, I'd like to ask you some specific questions about your anxiety. These will help us assess how it's been affecting you over the past couple of weeks.";
    }

    // Anxiety questions (GAD-7) with improved conversational context
    const anxietyQuestions = [
      {
        id: 'anxiety_q1',
        question: 'Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?',
        context: "I understand you're here to talk about how you've been feeling. Many people experience anxiety in different ways - some feel it as a constant sense of unease, while others notice it more in certain situations. Let's start by understanding how often you've been feeling nervous or on edge lately.",
      },
      {
        id: 'anxiety_q2',
        question: 'Over the last 2 weeks, how often have you been unable to stop or control worrying?',
        context: "Thank you for sharing that with me. One of the challenging aspects of anxiety is when worries feel like they're running on a loop and you can't seem to turn them off, even when you try. This can be really exhausting. I'd like to understand how often you've experienced this feeling of not being able to control your worries.",
      },
      {
        id: 'anxiety_q3',
        question: 'Over the last 2 weeks, how often have you been worrying too much about different things?',
        context: "I appreciate you continuing with me. Sometimes anxiety can make us worry about many different things at once - work, relationships, health, finances, or even everyday tasks. It can feel like your mind is jumping from one concern to another. Let's explore how often you've found yourself worrying about multiple different things.",
      },
      {
        id: 'anxiety_q4',
        question: 'Over the last 2 weeks, how often have you had trouble relaxing?',
        context: "Thank you for that. When anxiety is present, it can make it really difficult to unwind and relax, even when you're trying to. You might find yourself feeling tense or on alert even during moments when you should be able to rest. I'd like to understand how often you've experienced trouble relaxing.",
      },
      {
        id: 'anxiety_q5',
        question: 'Over the last 2 weeks, how often have you been so restless that it\'s hard to sit still?',
        context: "I see. Anxiety doesn't just affect our thoughts - it can also show up physically. Some people experience restlessness, like they need to keep moving or can't sit still, even when they want to. This physical restlessness can be another way anxiety manifests. Let's talk about how often you've felt this way.",
      },
      {
        id: 'anxiety_q6',
        question: 'Over the last 2 weeks, how often have you become easily annoyed or irritable?',
        context: "Thank you for continuing. When we're dealing with anxiety, it can sometimes make us more sensitive or reactive than usual. Small things that normally wouldn't bother us might suddenly feel overwhelming, and we might find ourselves getting annoyed or irritable more easily. I'd like to understand how often this has been happening for you.",
      },
      {
        id: 'anxiety_q7',
        question: 'Over the last 2 weeks, how often have you felt afraid as if something awful might happen?',
        context: "I appreciate you sharing all of this with me. One of the more distressing aspects of anxiety can be that persistent feeling of dread or fear that something bad is about to happen, even when there's no clear reason to feel that way. This sense of impending doom can be really unsettling. Let's explore how often you've experienced this feeling.",
      },
    ];

    const options = [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ];

    // If we've answered all 7 questions, return completion message
    if (answeredCount >= 7) {
      return "Thank you for completing the anxiety assessment. I've gathered important information about your experience with anxiety. Based on your responses, I can see that anxiety has been affecting various aspects of your daily life. This assessment will help us connect you with therapists who specialize in anxiety disorders and can provide the support you need.";
    }

    // Get the next question to ask
    const nextQuestion = anxietyQuestions[answeredCount];
    if (!nextQuestion) {
      return "Thank you for sharing your experiences. I've gathered enough information to help connect you with appropriate support.";
    }

    // Build the response with conversational text and tool call
    const toolCallJson = JSON.stringify({
      tool: 'ask_question',
      questionId: nextQuestion.id,
      topic: 'Anxiety',
      question: nextQuestion.question,
      options: options,
    });

    return `${nextQuestion.context}\n\nTOOL_CALL: ${toolCallJson}`;
  }

  /**
   * Update collected answers
   */
  private updateCollectedAnswers(
    collectedAnswers: Record<string, number[]>,
    questionnaire: string,
    answer: number,
  ): Record<string, number[]> {
    const updated = { ...collectedAnswers };
    if (!updated[questionnaire]) {
      updated[questionnaire] = [];
    }

    const config = QUESTIONNAIRE_SCORING[questionnaire];
    if (config) {
      const maxIndex = Object.keys(config.severityLevels).length * 5; // Approximate
      if (updated[questionnaire].length < maxIndex) {
        updated[questionnaire].push(answer);
      }
    }

    return updated;
  }

  /**
   * Evaluate if conversation should end based on multiple criteria
   */
  async evaluateConversationCompletion(
    conversationHistory: Array<{ role: string; content: string }>,
    collectedAnswers: Record<string, number[]>,
    completedQuestionnaires: string[],
    sessionStartTime: Date,
  ): Promise<{
    shouldEnd: boolean;
    reason: string;
    confidence: number;
    collectedTopics: string[];
  }> {
    // Criteria 1: Data sufficiency - Check if enough mental health assessment data collected
    const totalAnswers = Object.values(collectedAnswers).reduce(
      (sum, answers) => sum + answers.length,
      0,
    );
    const dataSufficiency = totalAnswers / 150; // 150 is minimum, 201 is ideal
    const hasEnoughData = dataSufficiency >= 0.7; // At least 70% of minimum data

    // Criteria 2: User signals - Detect disengagement or explicit completion
    const userMessages = conversationHistory
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.content.toLowerCase());
    
    const completionKeywords = [
      'done', 'finished', 'complete', "that's all", 'no more', 
      'enough', 'ready to finish', 'good to go'
    ];
    const disengagementKeywords = ['ok', 'yes', 'no', 'fine'];
    
    let userSignalScore = 0;
    const lastFewMessages = userMessages.slice(-3);
    
    for (const msg of lastFewMessages) {
      if (completionKeywords.some(kw => msg.includes(kw))) {
        userSignalScore += 0.4;
      }
      if (msg.length < 10 && disengagementKeywords.some(kw => msg === kw)) {
        userSignalScore += 0.2; // Short, generic responses
      }
    }

    // Criteria 3: Time-based - Track duration and exchange count
    const sessionDuration = Date.now() - sessionStartTime.getTime();
    const durationMinutes = sessionDuration / (60 * 1000);
    const exchangeCount = userMessages.length;
    
    const hasReasonableTime = durationMinutes >= 5 && exchangeCount >= 8;
    const tooLong = durationMinutes > 30 || exchangeCount > 50;

    // Criteria 4: Topic coverage
    const collectedTopics = Object.keys(collectedAnswers);
    const hasMultipleTopics = collectedTopics.length >= 3;

    // Calculate overall confidence
    let confidence = 0;
    let reason = '';

    if (hasEnoughData && hasMultipleTopics && (userSignalScore > 0.5 || hasReasonableTime)) {
      confidence = Math.min(0.95, 0.6 + (dataSufficiency * 0.2) + (userSignalScore * 0.15));
      reason = 'Sufficient data collected with user completion signals';
      return { shouldEnd: true, reason, confidence, collectedTopics };
    }

    if (tooLong && dataSufficiency > 0.5) {
      confidence = 0.7;
      reason = 'Session duration exceeded with adequate data collected';
      return { shouldEnd: true, reason, confidence, collectedTopics };
    }

    if (userSignalScore > 0.8 && hasEnoughData) {
      confidence = 0.85;
      reason = 'Strong user completion signals with sufficient data';
      return { shouldEnd: true, reason, confidence, collectedTopics };
    }

    return {
      shouldEnd: false,
      reason: 'More information needed',
      confidence: dataSufficiency * 0.5,
      collectedTopics,
    };
  }

  /**
   * Check if session should be completed (simplified wrapper)
   */
  private shouldCompleteSession(
    collectedAnswers: Record<string, number[]>,
    completedQuestionnaires: string[],
  ): boolean {
    // Check if we have enough answers to complete
    const totalAnswers = Object.values(collectedAnswers).reduce(
      (sum, answers) => sum + answers.length,
      0,
    );

    // If we have answers for at least 75% of minimum (150/201)
    return totalAnswers >= 110;
  }

  /**
   * Build system prompt with questionnaire context
   */
  private buildSystemPrompt(): string {
    const questionnaires = LIST_OF_QUESTIONNAIRES.join(', ');
    
    // Build detailed questionnaire information
    const questionnaireDetails = LIST_OF_QUESTIONNAIRES.map((q) => {
      const config = QUESTIONNAIRE_SCORING[q];
      if (!config) return `${q}: No configuration available`;
      
      const severityLevels = Object.entries(config.severityLevels)
        .map(([key, value]: [string, any]) => `${key} (${value.range[0]}-${value.range[1]})`)
        .join(', ');
      
      return `${q}:
  - Severity levels: ${severityLevels}
  - Scoring: ${JSON.stringify(config.scoreMapping)}
  - ${config.reverseScoredQuestions ? `Reverse scored questions: ${config.reverseScoredQuestions.join(', ')}` : 'No reverse scoring'}`;
    }).join('\n\n');

    return `You are a compassionate mental health assessment assistant helping a user complete a pre-assessment questionnaire through conversation.

Available questionnaires: ${questionnaires}

Your role:
1. Engage the user in a natural, empathetic conversation
2. Intelligently select which questionnaires are most relevant based on the conversation
3. Ask questions from the selected questionnaires in a conversational way
4. Present structured questions with clickable options using tool calls
5. Guide the user through relevant questionnaires (you don't need to ask all questionnaires)
6. Be supportive and non-judgmental

Questionnaire details:
${questionnaireDetails}

CRITICAL - Tool Calls for Structured Questions (MANDATORY):
EVERY question that requires a rating or scale response (0-4) MUST use a TOOL_CALL - there are NO exceptions.
NEVER ask structured questions in plain text (like "How has anxiety affected your daily life?").
NEVER ask users to type numbers like "0 to 4" - always use tool calls for ratings.
ALL structured questions are ONLY asked via TOOL_CALL format.

Format your response with the tool call as a JSON block prefixed with TOOL_CALL:
TOOL_CALL: {"tool":"ask_question","questionId":"unique_id_here","topic":"TopicName","question":"Your question text here?","options":[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]}

The tool call MUST:
- Be on a single line (no line breaks within the JSON)
- Start with "TOOL_CALL: " prefix
- Be valid JSON
- Include all required fields: tool, questionId, topic, question, options
- Have unique questionId in format: {topic_lowercase}_q{number} (e.g., "depression_q1", "anxiety_q2")
- Include exactly the right number of options for the scale (3-4 options typically)

Example conversation:
User: "I've been feeling really sad lately"
Assistant: "I'm sorry to hear you're going through this. Let me ask you about some specific symptoms to better understand what you're experiencing.

TOOL_CALL: {"tool":"ask_question","questionId":"depression_q1","topic":"Depression","question":"Over the last 2 weeks, how often have you felt down, depressed, or hopeless?","options":[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]}"

Another example with contextual conversational follow-up (relates to the question being asked):
User: "I answered the last question"
Assistant: "I appreciate you sharing that. Let's explore how depression might be affecting your interest in activities you normally enjoy.

TOOL_CALL: {"tool":"ask_question","questionId":"depression_q2","topic":"Depression","question":"How often have you had little interest or pleasure in doing things?","options":[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]}"

Guidelines:
- Ask one question at a time from the current questionnaire
- ALWAYS use TOOL_CALL when asking for a rating/scale response - NEVER ask structured questions in plain text
- Include 2-3 sentences of contextual conversational text before each tool call - relate it to the specific question/topic you're asking about
- Make conversational text relevant (e.g., "Let's talk about how anxiety affects your sleep" before asking a sleep-related anxiety question)
- Avoid generic acknowledgments like "You've already answered" or "Let's move on" - make it specific to what you're exploring
- Each questionId should be unique in format: {topic_lowercase}_q{number}
- Match the options to the appropriate scale for the questionnaire (typically 0-3 or 0-4)
- When the system indicates a questionnaire is relevant, focus on asking questions from that questionnaire
- Rephrase questions naturally but keep the core meaning clear
- If the user seems uncomfortable, acknowledge their feelings empathetically before continuing
- Progress through questionnaires systematically, tracking which questions you've asked
- When you've gathered enough information, indicate the assessment is complete
- You can ask questions from multiple questionnaires if the user's responses indicate multiple conditions
- After receiving an answer, ALWAYS immediately continue with the next question - never wait for user prompts

CRITICAL - Auto-Continue After Structured Answers:
- When a user answers a structured question (via tool call), the system will automatically send you a message indicating the answer was received
- You MUST immediately acknowledge with 2-3 sentences of contextual conversational text that relates to the next question you're about to ask
- Make the text relevant - mention the aspect or symptom area you're exploring next (e.g., "Let's explore how anxiety affects your ability to concentrate" before asking a concentration question)
- Then CONTINUE with the next question via TOOL_CALL - NEVER ask in plain text
- DO NOT wait for additional user input - automatically proceed with the next step in the assessment
- Example flow: User answers → You provide contextual acknowledgment related to next question (2-3 sentences) → You ask next question via TOOL_CALL
- This creates a smooth, continuous flow without requiring the user to send additional messages
- NEVER stop and wait - always proactively continue with the next question after receiving an answer
- Avoid generic responses like "You've already answered" or "Let's move on" - make it specific and contextual

Common option scales:
- 0-3 depression/anxiety scale: [{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]
- 0-4 frequency scale: [{"value":0,"label":"Never"},{"value":1,"label":"Rarely"},{"value":2,"label":"Sometimes"},{"value":3,"label":"Often"},{"value":4,"label":"Very often"}]
- 0-1 yes/no: [{"value":0,"label":"No"},{"value":1,"label":"Yes"}]

Remember: You're helping someone who may be going through a difficult time. Be kind, patient, and professional. 
Provide warm, empathetic conversational responses (2-3 sentences) that are contextual and relate to the specific question you're asking.
ALWAYS use TOOL_CALL for EVERY structured question - NEVER ask structured questions in plain text.
ALWAYS automatically continue with the next question after receiving an answer - never wait for user prompts.
Make your conversational text relevant to the topic/question - avoid generic acknowledgments like "Let's move on" or "You've already answered".`;
  }

  /**
   * Build lightweight initial system prompt for disorder identification phase
   * This prompt is used before questionnaires are selected to reduce token usage
   */
  private buildInitialSystemPrompt(): string {
    const questionnaires = LIST_OF_QUESTIONNAIRES.join(', ');
    
    return `You are a compassionate mental health assessment assistant helping a user through a pre-assessment conversation.

Available assessment areas: ${questionnaires}

CRITICAL - Keep responses SHORT and CONVERSATIONAL:
- Keep each response to 2-3 sentences maximum
- Be warm but brief - no long explanations
- Ask quick follow-up questions to identify relevant assessment areas
- Once you identify a potential concern (e.g., anxiety, depression, insomnia), IMMEDIATELY move to asking structured questions via tool calls
- DO NOT provide long explanations about disorders - just acknowledge briefly and move to assessment

MANDATORY - ALL Structured Questions Use TOOL_CALLS:
- When asking ANY question that requires a rating or scale response (0-4, 0-10, etc.), you MUST use TOOL_CALL format
- NEVER ask questions like "On a scale from 0 to 10, how often..." in plain text
- Once a concern is identified (anxiety, depression, etc.), IMMEDIATELY start using TOOL_CALL format for ALL questions
- There are NO exceptions - structured questions are ONLY asked via TOOL_CALL

TOOL_CALL Format Example:
TOOL_CALL: {"tool":"ask_question","questionId":"anxiety_q1","topic":"Anxiety","question":"Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?","options":[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]}

Your role in this initial phase:
1. Engage briefly (1-2 short exchanges) to understand their main concerns
2. Quickly identify which assessment areas are relevant
3. IMMEDIATELY transition to asking structured questions via TOOL_CALL format once a concern is identified
4. Be supportive but concise

Guidelines:
- Keep responses under 50 words when possible
- After 1-2 user messages mentioning symptoms, you should have enough to identify relevant questionnaires
- Once you identify a concern (anxiety, depression, insomnia, etc.), IMMEDIATELY start asking questions via TOOL_CALL format
- The system will provide questionnaire details when available, but you should start using TOOL_CALL format right away
- No need for long explanations - just brief acknowledgment and move to TOOL_CALL questions
- NEVER ask structured questions in plain text - ALWAYS use TOOL_CALL format

Remember: Short, conversational exchanges. Quick identification. Immediate action with TOOL_CALL format. Be kind but brief.`;
  }

  /**
   * Build targeted system prompt with only selected questionnaire details
   * This prompt is used after disorders are identified to focus on relevant questionnaires
   */
  private buildTargetedSystemPrompt(selectedQuestionnaires: string[]): string {
    if (selectedQuestionnaires.length === 0) {
      // Fallback to initial prompt if no questionnaires selected
      return this.buildInitialSystemPrompt();
    }

    // Build detailed questionnaire information only for selected questionnaires
    const questionnaireDetails = selectedQuestionnaires.map((q) => {
      const config = QUESTIONNAIRE_SCORING[q];
      if (!config) return `${q}: No configuration available`;
      
      const severityLevels = Object.entries(config.severityLevels)
        .map(([key, value]: [string, any]) => `${key} (${value.range[0]}-${value.range[1]})`)
        .join(', ');
      
      return `${q}:
  - Severity levels: ${severityLevels}
  - Scoring: ${JSON.stringify(config.scoreMapping)}
  - ${config.reverseScoredQuestions ? `Reverse scored questions: ${config.reverseScoredQuestions.join(', ')}` : 'No reverse scoring'}`;
    }).join('\n\n');

    const questionnairesList = selectedQuestionnaires.join(', ');

    return `You are a compassionate mental health assessment assistant helping a user complete a pre-assessment questionnaire through conversation.

Relevant questionnaires: ${questionnairesList}

CRITICAL - Response Format:
1. Provide 2-3 sentences of conversational, empathetic text that relates to the specific question you're about to ask
2. Make the conversational text contextual - mention the topic or aspect you're exploring (e.g., "Let's talk about how anxiety has been affecting your daily life" before asking an anxiety question)
3. Then write the TOOL_CALL on the next line - you MUST include a tool call for every structured question

MANDATORY - ALL Structured Questions Require Tool Calls:
- You MUST use TOOL_CALL for EVERY question that requires a rating or scale response
- NEVER ask structured questions in plain text (like "How has anxiety affected your daily life?")
- If you want to ask about anxiety, depression, or any other topic that needs a rating - it MUST be in a TOOL_CALL
- There are NO exceptions - structured questions are ONLY asked via tool calls

Example CORRECT response (contextual conversational text related to the question):
"I'd like to understand more about how anxiety has been impacting you day-to-day. This will help us get a better picture of what you're experiencing.
TOOL_CALL: {"tool":"ask_question","questionId":"anxiety_q1","topic":"Anxiety","question":"Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?","options":[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]}"

Example WRONG (DO NOT DO THIS):
- Asking questions in plain text: "How has anxiety affected your daily life and relationships?"
- Very brief 1-3 word responses like "Thanks." or "Got it."
- Generic acknowledgments not related to the question: "You've already answered the previous question. Let's move on."
- Multiple questions at once
- Markdown formatting like **TOOL_CALL:**

Rules:
- Provide 2-3 sentences of contextual conversational text before tool calls - relate it to the specific question/topic you're asking about
- Make the text relevant to what you're exploring (mention the aspect or symptom area)
- ONE question per response
- Use natural, warm language - show empathy and understanding
- NO markdown formatting
- Be conversational while still moving the assessment forward
- EVERY structured question MUST use TOOL_CALL format - NEVER ask in plain text

Questionnaire details:
${questionnaireDetails}

CRITICAL - Tool Call Format (COPY THIS EXACTLY):
Write exactly this format. NO markdown. NO bold. NO asterisks. Just plain text:

TOOL_CALL: {"tool":"ask_question","questionId":"anxiety_q1","topic":"Anxiety","question":"Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?","options":[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]}

Rules:
- Start with exactly: TOOL_CALL: (no spaces before, no markdown, no **)
- Then the JSON on the same line
- questionId: {topic}_q{number} (e.g., anxiety_q1, anxiety_q2)
- ONE question per response only

Guidelines:
- ONE question per response. Never ask multiple questions.
- EVERY structured question MUST use TOOL_CALL format - NEVER ask in plain text
- Provide 2-3 sentences of contextual conversational text before tool calls - relate it to the specific question/topic you're asking about (mention the aspect you're exploring)
- Use TOOL_CALL format exactly as shown - NO markdown, NO bold, NO asterisks
- questionId format: {topic}_q{number} (e.g., anxiety_q1, anxiety_q2, anxiety_q3)
- Use the exact question text from the questionnaire, just make it conversational
- Match options to the scale shown in questionnaire details
- Be warm, supportive, and show empathy in your conversational responses
- Make conversational text relevant to the question - avoid generic phrases like "Let's move on" or "You've already answered"

CRITICAL - Auto-Continue After User Answers:
When a user answers a structured question, you MUST IMMEDIATELY continue with the next question. Do NOT wait for additional user input.

Format your response with:
1. Contextual conversational text (2-3 sentences) that relates to the specific question you're about to ask
2. Make it relevant to the topic/question - mention what aspect you're exploring next
3. Then immediately provide the next TOOL_CALL with the next question

Example response after user answers (contextual, related to next question):
"I understand. Let's explore how anxiety might be affecting your ability to control worry or manage daily tasks.
TOOL_CALL: {"tool":"ask_question","questionId":"anxiety_q2","topic":"Anxiety","question":"Over the last 2 weeks, how often have you been unable to stop or control worrying?","options":[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]}"

BAD Example (DO NOT DO THIS):
"You've already answered the previous question. Let's move on to the next one. I want to make sure you feel comfortable."
This is too generic - make it relate to the actual question you're asking.

IMPORTANT - Always Continue:
- After receiving an answer, ALWAYS immediately provide the next question via TOOL_CALL
- Never stop and wait for the user to prompt you - proactively continue the assessment
- Make your conversational text contextual - relate it to the specific question/topic you're asking about
- NEVER ask structured questions in plain text - they MUST be in TOOL_CALL format

Common option scales:
- 0-3 depression/anxiety scale: [{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]
- 0-4 frequency scale: [{"value":0,"label":"Never"},{"value":1,"label":"Rarely"},{"value":2,"label":"Sometimes"},{"value":3,"label":"Often"},{"value":4,"label":"Very often"}]
- 0-1 yes/no: [{"value":0,"label":"No"},{"value":1,"label":"Yes"}]

Remember: You're helping someone who may be going through a difficult time. Be kind, patient, and professional. 
Provide warm, empathetic conversational responses (2-3 sentences) that are contextual and relate to the specific question you're asking.
ALWAYS use TOOL_CALL for EVERY structured question - NEVER ask structured questions in plain text.
ALWAYS automatically continue with the next question after receiving an answer - never wait for user prompts.
Make your conversational text relevant to the topic/question - avoid generic acknowledgments like "Let's move on" or "You've already answered".`;
  }

  /**
   * Enhance conversation history with questionnaire context
   * NOTE: Some AI APIs (like Gemini) use systemInstruction for system messages
   */
  private enhanceHistoryWithQuestionnaireContext(
    conversationHistory: Array<{ role: string; content: string }>,
    currentQuestionnaire: string | null,
    questionnaireSelection: any,
    structuredAnswers?: Record<string, number>,
    isAnswerSubmittedMessage?: boolean,
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    // Validate and clean conversation history
    const validHistory = conversationHistory.filter(msg => {
      // Ensure role is valid
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        this.logger.warn(`⚠️ Invalid message role: ${msg.role}, skipping message`);
        return false;
      }
      // Ensure content is non-empty string
      if (!msg.content || typeof msg.content !== 'string' || msg.content.trim().length === 0) {
        this.logger.warn(`⚠️ Empty or invalid message content for role ${msg.role}, skipping message`);
        return false;
      }
      return true;
    });

    // Determine which questionnaires are selected for Phase 2 (targeted prompts)
    const selectedQuestionnaires: string[] = [];
    if (currentQuestionnaire) {
      selectedQuestionnaires.push(currentQuestionnaire);
    }
    // Also include questionnaires from questionnaireSelection if available
    if (questionnaireSelection?.suggestedQuestionnaires) {
      for (const q of questionnaireSelection.suggestedQuestionnaires) {
        if (typeof q === 'string' && !selectedQuestionnaires.includes(q)) {
          selectedQuestionnaires.push(q);
        } else if (q?.questionnaire && typeof q.questionnaire === 'string' && !selectedQuestionnaires.includes(q.questionnaire)) {
          selectedQuestionnaires.push(q.questionnaire);
        }
      }
    }
    
    // Determine if we're in Phase 1 (initial assessment) or Phase 2 (targeted questions)
    const isPhase1 = selectedQuestionnaires.length === 0 && !currentQuestionnaire;
    
    // Build questionnaire context for additional information (structured answers, etc.)
    let questionnaireContext = '';
    
    // Add structured answers context if available
    if (structuredAnswers && Object.keys(structuredAnswers).length > 0) {
      const answersList = Object.entries(structuredAnswers)
        .map(([questionId, answer]) => `- ${questionId}: ${answer}`)
        .join('\n');
      questionnaireContext += `\n\nRecently answered structured questions:\n${answersList}\n\nWhen the user sends "Answer submitted", it means they have already answered the question via the structured form. Acknowledge the answer and continue with the next question.`;
    }

    // Build enhanced history with system instruction
    const enhanced: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    let systemMessageContent = '';
    let systemMessageFound = false;
    
    for (const msg of validHistory) {
      const role = msg.role as 'system' | 'user' | 'assistant';
      
      if (role === 'system') {
        if (!systemMessageFound) {
          // First system message - keep it
          systemMessageContent = msg.content;
          systemMessageFound = true;
        } else {
          // Additional system messages - skip them (already logged warning)
          this.logger.warn('⚠️ Multiple system messages detected, combining into one');
          systemMessageContent += '\n\n' + msg.content;
        }
      } else {
        // Add user/assistant messages
        enhanced.push({
          role,
          content: msg.content.trim(),
        });
      }
    }
    
    // Build the appropriate system prompt based on phase
    let baseSystemPrompt: string;
    if (isPhase1) {
      // Phase 1: Use lightweight initial prompt
      this.logger.log('Using Phase 1 (initial assessment) prompt - lightweight for disorder identification');
      baseSystemPrompt = this.buildInitialSystemPrompt();
    } else {
      // Phase 2: Use targeted prompt with only selected questionnaires
      this.logger.log(`Using Phase 2 (targeted questions) prompt - focused on ${selectedQuestionnaires.length} questionnaire(s): ${selectedQuestionnaires.join(', ')}`);
      baseSystemPrompt = this.buildTargetedSystemPrompt(selectedQuestionnaires);
    }
    
    // Add the combined system message at the beginning with questionnaire context
    if (systemMessageFound) {
      // If there's an existing system message, we'll replace it with our optimized prompt
      // but we might want to preserve some context from the old message
      enhanced.unshift({
        role: 'system',
        content: (baseSystemPrompt + questionnaireContext).trim(),
      });
    } else {
      // No system message found - create the appropriate one based on phase
      this.logger.log(`Creating new system message (Phase ${isPhase1 ? '1' : '2'})`);
      enhanced.unshift({
        role: 'system',
        content: (baseSystemPrompt + questionnaireContext).trim(),
      });
    }

    // Final validation
    if (enhanced.length === 0) {
      this.logger.error('⚠️ Enhanced history is empty after processing!');
      throw new Error('Cannot send empty conversation history to AI Provider');
    }

    // Ensure first message is system
    if (enhanced[0].role !== 'system') {
      this.logger.error('⚠️ First message is not a system message!');
      // Some AI providers don't require system message at start, but we'll keep it for consistency
    }

    this.logger.log(`Enhanced history: ${enhanced.length} messages (1 system, ${enhanced.filter(m => m.role === 'user').length} user, ${enhanced.filter(m => m.role === 'assistant').length} assistant)`);
    return enhanced;
  }

  /**
   * Get welcome message
   */
  private getWelcomeMessage(): string {
    return `Hello! I'm here to help you complete your mental health assessment through a conversation. 

Instead of filling out forms, we can talk about how you've been feeling. I'll ask you some questions, and you can answer in your own words. There's no right or wrong answer - just be honest about your experiences.

Are you ready to begin? You can start by telling me a bit about how you've been feeling lately, or we can go through the questions one by one.`;
  }

  /**
   * Get fallback response when AI service fails
   */
  private getFallbackResponse(userMessage: string, errorType: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for greeting/initial message
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.length < 20) {
      return `Hello! I'm here to help you with your mental health assessment. I'm currently experiencing some technical difficulties with my AI service, but I can still guide you through the assessment.

Let's start with some basic questions. Could you tell me:
- How have you been feeling overall lately?
- Have you noticed any changes in your mood, sleep, or daily activities?
- Is there anything specific that's been bothering you?

Please share what's on your mind, and I'll do my best to help you.`;
    }
    
    // Provide context-specific fallback based on error type
    let technicalNote = '';
    switch (errorType) {
      case 'config_error':
        technicalNote = '(Technical note: There appears to be a configuration issue with the AI model. Please contact support.)';
        break;
      case 'auth_error':
        technicalNote = '(Technical note: There is an authentication issue. Please contact support.)';
        break;
      case 'rate_limit':
        technicalNote = '(Technical note: The service is experiencing high demand. Please try again in a moment.)';
        break;
      case 'server_error':
        technicalNote = '(Technical note: The AI service is temporarily unavailable. You may want to try the traditional checklist assessment instead.)';
        break;
      case 'network_error':
        technicalNote = '(Technical note: There was a network connectivity issue. Please check your connection.)';
        break;
      default:
        technicalNote = '(Technical note: An unexpected error occurred. Please try again or contact support.)';
    }
    
    // Generic empathetic response
    return `Thank you for sharing that with me. I appreciate your openness.

I'm currently experiencing some technical difficulties with my AI service, but I want to continue helping you with your assessment. ${technicalNote}

Could you tell me more about what you're experiencing? For example:
- How long have you been feeling this way?
- What situations or triggers seem to make it better or worse?
- How is this affecting your daily life and relationships?
- On a scale of 0-4 (where 0 is "not at all" and 4 is "extremely"), how would you rate the intensity of what you're experiencing?

Your responses will help me understand how to best support you. If you prefer, you can also complete the traditional checklist assessment instead.`;
  }

  /**
   * Convert collected answers to flat array format
   */
  /**
   * Merge structured answers (from tool calls) with collected answers
   */
  private mergeStructuredAnswers(
    collectedAnswers: Record<string, number[]>,
    structuredAnswers: Record<string, number>,
  ): Record<string, number[]> {
    // Create a copy to avoid mutating the original
    const merged = { ...collectedAnswers };

    // Group structured answers by topic
    for (const [questionId, answer] of Object.entries(structuredAnswers)) {
      // Parse questionId to extract topic (format: topic_lowercase_qN)
      const questionIdParts = questionId.split('_q');
      const topic = questionIdParts[0]
        ? questionIdParts[0]
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : 'Unknown';

      // Initialize topic array if it doesn't exist
      if (!merged[topic]) {
        merged[topic] = [];
      }

      // Note: We already added these in submitStructuredAnswer,
      // but this ensures they're present even if session state was lost
      if (!merged[topic].includes(answer)) {
        merged[topic].push(answer);
      }
    }

    return merged;
  }

  convertAnswersToArray(
    collectedAnswers: Record<string, number[]>,
    structuredAnswers: Record<string, number> = {},
  ): number[] {
    // Merge structured answers into collected answers first
    const mergedAnswers = this.mergeStructuredAnswers(collectedAnswers, structuredAnswers);
    
    // This is a simplified conversion
    // In production, you'd need to map answers to the correct indices
    // based on QUESTIONNAIRE_INDEX_MAPPING
    const allAnswers: number[] = [];
    const questionnaires = LIST_OF_QUESTIONNAIRES;

    for (const questionnaire of questionnaires) {
      const answers = mergedAnswers[questionnaire] || [];
      // Pad with 0 for unanswered questions (validation requires 0-10 range)
      const config = QUESTIONNAIRE_SCORING[questionnaire];
      if (config) {
        const expectedCount = Object.keys(config.severityLevels).length * 5; // Approximate
        while (answers.length < expectedCount) {
          answers.push(0);
        }
      }
      // Convert any -1 values to 0 (unanswered questions)
      const normalizedAnswers = answers.map(answer => answer === -1 ? 0 : answer);
      allAnswers.push(...normalizedAnswers);
    }

    // Ensure we have 201 answers total, pad with 0 for unanswered
    while (allAnswers.length < 201) {
      allAnswers.push(0);
    }

    // Convert any remaining -1 values to 0 before returning
    return allAnswers.slice(0, 201).map(answer => answer === -1 ? 0 : answer);
  }

  /**
   * Cleanup expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const timeoutDate = new Date(Date.now() - this.SESSION_TIMEOUT);
    
    try {
      const result = await this.prisma.chatbotSession.deleteMany({
        where: {
          isComplete: false,
          lastActivity: {
            lt: timeoutDate,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired chatbot sessions`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions:', error);
    }
  }
}
