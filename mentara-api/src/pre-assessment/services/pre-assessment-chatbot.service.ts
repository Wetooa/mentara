import { Injectable, Logger, NotFoundException, HttpException, BadRequestException } from '@nestjs/common';
import { GeminiClientService } from './gemini-client.service';
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
    private readonly geminiClient: GeminiClientService,
    private readonly prisma: PrismaService,
    private readonly questionnaireSelector: QuestionnaireSelectorService,
    private readonly formGenerator: QuestionnaireFormGeneratorService,
    private readonly insightsService: ConversationInsightsService,
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

    // Get system prompt with questionnaire context
    const systemPrompt = this.buildSystemPrompt();
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
      let newInsights: ConversationInsights | null = null;
      let updatedInsights = (session.conversationInsights as any) || null;
      if (!isAnswerSubmittedMessage) {
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
        this.logger.log('Skipping insights extraction for "Answer submitted" message to reduce API calls');
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
      if (!hasCurrentQuestionnaire && !isAnswerSubmittedMessage && !hasRecentStructuredAnswerBeforeRefresh) {
        try {
          questionnaireSelection = await this.questionnaireSelector.suggestQuestionnaires(
            conversationHistory,
          );
        } catch (questionnaireError) {
          this.logger.warn('Failed to suggest questionnaires (non-critical):', questionnaireError);
          // Continue with empty selection
        }
      } else {
        this.logger.log('Skipping AI-based questionnaire selection to reduce API calls (has current questionnaire or is answer submission)');
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

      // Enhance conversation history with questionnaire context for AI
      const enhancedHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = this.enhanceHistoryWithQuestionnaireContext(
        conversationHistory,
        currentQuestionnaire,
        questionnaireSelection,
        session.structuredAnswers as Record<string, number> | undefined,
        isAnswerSubmittedMessage,
      );

      // Log conversation history being sent to Gemini
      this.logger.log('=== Sending to Gemini ===');
      this.logger.log(`Session ID: ${sessionId}`);
      this.logger.log(`Current Questionnaire: ${currentQuestionnaire || 'none'}`);
      this.logger.log(`Conversation History Length: ${conversationHistory.length}`);
      this.logger.log(`Enhanced History Length: ${enhancedHistory.length}`);
      this.logger.log(`Enhanced History: ${JSON.stringify(enhancedHistory, null, 2)}`);

      // Get AI response
      this.logger.log('Calling Gemini chatCompletion...');
      let aiResponse: string;
      let usedFallback = false;
      
      try {
        aiResponse = await this.geminiClient.chatCompletion(
          enhancedHistory,
          {
            temperature: 0.7,
            max_tokens: 500,
          },
        );
        this.logger.log(`✅ Received AI Response (first 200 chars): ${aiResponse.substring(0, 200)}...`);
      } catch (geminiError) {
        // If Gemini fails, provide a helpful fallback response
        this.logger.error('❌ Gemini API call failed, using fallback response');
        this.logger.error('Error details:', geminiError instanceof Error ? geminiError.message : String(geminiError));
        
        usedFallback = true;
        
        // Determine fallback response based on error type
        if (geminiError instanceof HttpException) {
          const status = geminiError.getStatus();
          const errorMessage = geminiError.message;
          
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
            this.logger.error('⚠️ Server Error - Gemini service issue');
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
      const structuredAnswers = (session.structuredAnswers as Record<string, number>) || {};
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
    const toolCallRegex = /TOOL_CALL:\s*(\{[\s\S]*?\})\s*(?:\n|$)/;
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

CRITICAL - Tool Calls for Structured Questions:
When you need to ask a question that requires a rating or scale response (0-4), you MUST use a tool call to present structured options.
NEVER ask users to type numbers like "0 to 4" - always use tool calls for ratings.

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

Another example with conversational follow-up:
User: "I answered the last question"
Assistant: "Thank you for sharing. Let's continue.

TOOL_CALL: {"tool":"ask_question","questionId":"depression_q2","topic":"Depression","question":"How often have you had little interest or pleasure in doing things?","options":[{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]}

Take your time with each question - there's no rush."

Guidelines:
- Ask one question at a time from the current questionnaire
- ALWAYS use TOOL_CALL when asking for a rating/scale response (NEVER ask users to type "0 to 4" or similar)
- You can include conversational text before or after the tool call for warmth and context
- Each questionId should be unique in format: {topic_lowercase}_q{number}
- Match the options to the appropriate scale for the questionnaire (typically 0-3 or 0-4)
- When the system indicates a questionnaire is relevant, focus on asking questions from that questionnaire
- Rephrase questions naturally but keep the core meaning clear
- If the user seems uncomfortable, acknowledge their feelings before continuing
- Progress through questionnaires systematically, tracking which questions you've asked
- When you've gathered enough information, indicate the assessment is complete
- You can ask questions from multiple questionnaires if the user's responses indicate multiple conditions

CRITICAL - Auto-Continue After Structured Answers:
- When a user answers a structured question (via tool call), the system will automatically send you a message indicating the answer was received
- You MUST immediately acknowledge the answer briefly (e.g., "Thank you" or "Got it") and then CONTINUE with the next question or relevant follow-up
- DO NOT wait for additional user input - automatically proceed with the next step in the assessment
- Keep acknowledgments brief (1-2 sentences max) and then immediately present the next question or continue the conversation
- Example flow: User answers → You acknowledge briefly → You ask next question or provide next tool call
- This creates a smooth, continuous flow without requiring the user to send additional messages

Common option scales:
- 0-3 depression/anxiety scale: [{"value":0,"label":"Not at all"},{"value":1,"label":"Several days"},{"value":2,"label":"More than half the days"},{"value":3,"label":"Nearly every day"}]
- 0-4 frequency scale: [{"value":0,"label":"Never"},{"value":1,"label":"Rarely"},{"value":2,"label":"Sometimes"},{"value":3,"label":"Often"},{"value":4,"label":"Very often"}]
- 0-1 yes/no: [{"value":0,"label":"No"},{"value":1,"label":"Yes"}]

Remember: You're helping someone who may be going through a difficult time. Be kind, patient, and professional. ALWAYS use tool calls for structured questions - never ask users to type numbers.`;
  }

  /**
   * Enhance conversation history with questionnaire context
   * NOTE: Gemini API uses systemInstruction for system messages
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

    // Build questionnaire context if available
    let questionnaireContext = '';
    if (currentQuestionnaire) {
      const config = QUESTIONNAIRE_SCORING[currentQuestionnaire];
      if (config) {
        questionnaireContext = `\n\nCurrent questionnaire: ${currentQuestionnaire}
Scoring: ${JSON.stringify(config.scoreMapping)}
Severity levels: ${Object.keys(config.severityLevels).join(', ')}

Focus on asking questions from this questionnaire. Extract answers on a 0-4 scale.`;
      }
    }
    
    // Add structured answers context if available
    if (structuredAnswers && Object.keys(structuredAnswers).length > 0) {
      const answersList = Object.entries(structuredAnswers)
        .map(([questionId, answer]) => `- ${questionId}: ${answer}`)
        .join('\n');
      questionnaireContext += `\n\nRecently answered structured questions:\n${answersList}\n\nWhen the user sends "Answer submitted", it means they have already answered the question via the structured form. Acknowledge the answer and continue with the next question.`;
    }

    // Gemini API uses systemInstruction for system messages
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
    
    // Add the combined system message at the beginning with questionnaire context
    if (systemMessageFound) {
      enhanced.unshift({
        role: 'system',
        content: (systemMessageContent + questionnaireContext).trim(),
      });
    } else {
      // No system message found - create a basic one
      this.logger.warn('⚠️ No system message found in conversation history, creating default system message');
      enhanced.unshift({
        role: 'system',
        content: (this.buildSystemPrompt() + questionnaireContext).trim(),
      });
    }

    // Final validation
    if (enhanced.length === 0) {
      this.logger.error('⚠️ Enhanced history is empty after processing!');
      throw new Error('Cannot send empty conversation history to Gemini API');
    }

    // Ensure first message is system
    if (enhanced[0].role !== 'system') {
      this.logger.error('⚠️ First message is not a system message!');
      // Gemini doesn't require system message at start, but we'll keep it for consistency
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
      // Pad with -1 for unanswered questions
      const config = QUESTIONNAIRE_SCORING[questionnaire];
      if (config) {
        const expectedCount = Object.keys(config.severityLevels).length * 5; // Approximate
        while (answers.length < expectedCount) {
          answers.push(-1);
        }
      }
      allAnswers.push(...answers);
    }

    // Ensure we have 201 answers total
    while (allAnswers.length < 201) {
      allAnswers.push(-1);
    }

    return allAnswers.slice(0, 201);
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
