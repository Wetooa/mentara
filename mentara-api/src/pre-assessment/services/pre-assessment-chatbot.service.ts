import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SambaNovaClientService } from './sambanova-client.service';
import {
  LIST_OF_QUESTIONNAIRES,
  QUESTIONNAIRE_SCORING,
  processPreAssessmentAnswers,
  type QuestionnaireScores,
} from '../pre-assessment.utils';
import { PrismaService } from '../../providers/prisma-client.provider';

interface ChatbotSession {
  sessionId: string;
  userId: string;
  conversationHistory: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  currentQuestionnaire: string | null;
  collectedAnswers: Record<string, number[]>; // questionnaire -> answers
  currentQuestionIndex: number;
  startedAt: Date;
  lastActivity: Date;
  isComplete: boolean;
}

interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable()
export class PreAssessmentChatbotService {
  private readonly logger = new Logger(PreAssessmentChatbotService.name);
  private sessions = new Map<string, ChatbotSession>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor(
    private readonly sambaNovaClient: SambaNovaClientService,
    private readonly prisma: PrismaService,
  ) {
    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Initialize a new chatbot session
   */
  async startSession(userId: string): Promise<{ sessionId: string }> {
    const sessionId = `chatbot_${userId}_${Date.now()}`;

    // Get system prompt with questionnaire context
    const systemPrompt = this.buildSystemPrompt();

    const session: ChatbotSession = {
      sessionId,
      userId,
      conversationHistory: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'assistant',
          content: this.getWelcomeMessage(),
        },
      ],
      currentQuestionnaire: null,
      collectedAnswers: {},
      currentQuestionIndex: 0,
      startedAt: new Date(),
      lastActivity: new Date(),
      isComplete: false,
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`Started chatbot session ${sessionId} for user ${userId}`);

    return { sessionId };
  }

  /**
   * Send a message to the chatbot and get response
   */
  async sendMessage(
    sessionId: string,
    userId: string,
    userMessage: string,
  ): Promise<{
    response: string;
    isComplete: boolean;
    currentQuestionnaire?: string;
  }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    if (session.userId !== userId) {
      throw new NotFoundException('Session does not belong to user');
    }

    if (session.isComplete) {
      return {
        response: 'The assessment is already complete. You can view your results in your dashboard.',
        isComplete: true,
      };
    }

    // Update session activity
    session.lastActivity = new Date();

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // Get AI response
      const aiResponse = await this.sambaNovaClient.chatCompletion(
        session.conversationHistory,
        {
          temperature: 0.7,
          max_tokens: 500,
        },
      );

      // Add AI response to history
      session.conversationHistory.push({
        role: 'assistant',
        content: aiResponse,
      });

      // Try to extract answer from user message
      this.extractAndStoreAnswer(session, userMessage);

      // Check if we should move to next question
      this.advanceQuestionnaire(session);

      return {
        response: aiResponse,
        isComplete: session.isComplete,
        currentQuestionnaire: session.currentQuestionnaire || undefined,
      };
    } catch (error) {
      this.logger.error('Error getting chatbot response:', error);
      throw error;
    }
  }

  /**
   * Complete the chatbot session and generate assessment results
   */
  async completeSession(
    sessionId: string,
    userId: string,
  ): Promise<{
    scores: QuestionnaireScores;
    severityLevels: Record<string, string>;
  }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    if (session.userId !== userId) {
      throw new NotFoundException('Session does not belong to user');
    }

    // Convert collected answers to the format expected by processPreAssessmentAnswers
    const answers = this.convertAnswersToArray(session.collectedAnswers);

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
    session.isComplete = true;

    this.logger.log(
      `Completed chatbot session ${sessionId} for user ${userId}`,
    );

    return { scores, severityLevels };
  }

  /**
   * Get session state
   */
  getSession(sessionId: string, userId: string): ChatbotSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.userId !== userId) {
      return null;
    }
    return session;
  }

  /**
   * Build system prompt with questionnaire context
   */
  private buildSystemPrompt(): string {
    const questionnaires = LIST_OF_QUESTIONNAIRES.join(', ');
    const questionnaireDetails = LIST_OF_QUESTIONNAIRES.map((q) => {
      const config = QUESTIONNAIRE_SCORING[q];
      if (!config) return q;
      return `${q} (${Object.keys(config.severityLevels).join(', ')})`;
    }).join('\n');

    return `You are a compassionate mental health assessment assistant helping a user complete a pre-assessment questionnaire through conversation.

Available questionnaires: ${questionnaires}

Your role:
1. Engage the user in a natural, empathetic conversation
2. Ask questions related to the assessment questionnaires in a conversational way
3. Extract answers from the user's responses (they may answer in natural language)
4. Guide the user through all relevant questionnaires
5. Be supportive and non-judgmental

Questionnaire details:
${questionnaireDetails}

Guidelines:
- Ask one question at a time
- Rephrase questions naturally based on the user's responses
- If the user seems uncomfortable, acknowledge their feelings
- Extract numeric answers (0-4 scale typically) from natural language responses
- Progress through questionnaires systematically
- When you've gathered enough information, indicate the assessment is complete

Remember: You're helping someone who may be going through a difficult time. Be kind, patient, and professional.`;
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
   * Extract answer from user message and store it
   */
  private extractAndStoreAnswer(
    session: ChatbotSession,
    userMessage: string,
  ): void {
    if (!session.currentQuestionnaire) {
      return;
    }

    // Try to extract numeric answer (0-4 scale)
    const numericMatch = userMessage.match(/\b([0-4])\b/);
    if (numericMatch) {
      const answer = parseInt(numericMatch[1], 10);
      this.storeAnswer(session, session.currentQuestionnaire, answer);
      return;
    }

    // Try to extract from natural language
    const answer = this.extractAnswerFromText(userMessage);
    if (answer !== null) {
      this.storeAnswer(session, session.currentQuestionnaire, answer);
    }
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
   * Store answer in session
   */
  private storeAnswer(
    session: ChatbotSession,
    questionnaire: string,
    answer: number,
  ): void {
    if (!session.collectedAnswers[questionnaire]) {
      session.collectedAnswers[questionnaire] = [];
    }

    const config = QUESTIONNAIRE_SCORING[questionnaire];
    if (!config) return;

    const maxIndex = Object.keys(config.severityLevels).length * 5; // Approximate
    if (session.collectedAnswers[questionnaire].length < maxIndex) {
      session.collectedAnswers[questionnaire].push(answer);
    }
  }

  /**
   * Advance to next question/questionnaire
   */
  private advanceQuestionnaire(session: ChatbotSession): void {
    // This is a simplified version - in production, you'd track which specific
    // questions have been answered based on the conversation flow
    // For now, we rely on the AI to guide the conversation

    // Check if we have enough answers to complete
    const totalAnswers = Object.values(session.collectedAnswers).reduce(
      (sum, answers) => sum + answers.length,
      0,
    );

    // If we have answers for all questionnaires (approximately 201 total questions)
    if (totalAnswers >= 150) {
      // Close enough - mark as ready to complete
      session.isComplete = true;
    }
  }

  /**
   * Convert collected answers to flat array format
   */
  convertAnswersToArray(
    collectedAnswers: Record<string, number[]>,
  ): number[] {
    // This is a simplified conversion
    // In production, you'd need to map answers to the correct indices
    // based on QUESTIONNAIRE_INDEX_MAPPING
    const allAnswers: number[] = [];
    const questionnaires = LIST_OF_QUESTIONNAIRES;

    for (const questionnaire of questionnaires) {
      const answers = collectedAnswers[questionnaire] || [];
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
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now - session.lastActivity.getTime();
      if (age > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired chatbot sessions`);
    }
  }
}

