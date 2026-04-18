import {
  Injectable,
  Logger,
  InternalServerErrorException,
  Inject,
  forwardRef,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { randomUUID } from 'crypto';
import { PreAssessmentService } from './pre-assessment.service';
import {
  AurisResponseDto,
  AurisResultDto,
  AurisStateDto,
  CreatePreAssessmentDto,
  NewSessionResponseDto,
} from './types/pre-assessment.dto';

type ChatRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatSession {
  userId?: string;
  messages: ChatMessage[];
  persisted: boolean;
  lastResponse?: AurisResponseDto;
}

interface StructuredAssessmentState {
  assessmentPhase?: string;
  completionReason?: string;
  requiresCrisisProtocol?: boolean;
  extractedData?: Record<string, unknown>;
  identifiedQuestionnaires?: Record<string, string>;
  candidateScales?: string[];
  totalQuestionsAsked?: number;
  messageCount?: number;
}

interface StructuredAssessmentResults {
  assessmentId?: string;
  completedAt?: string;
  questionnaireScores?: Record<string, { score: number; severity: string }>;
  context?: {
    pastTherapyExperiences?: string[];
    medicationHistory?: string[];
    accessibilityNeeds?: string[];
  };
}

interface StructuredAssessmentReply {
  assistantResponse: string;
  state?: StructuredAssessmentState;
  isComplete: boolean;
  results?: StructuredAssessmentResults;
}

const SESSION_OPENING_MESSAGE =
  "Hi, I'm Mentara's AI pre-assessment assistant. I'll ask a few questions to understand how you've been feeling and what kind of support may fit you best. What feels most important for you to share today?";

const CHATBOT_SYSTEM_PROMPT = `
You are Mentara's clinical pre-assessment chatbot for a mental health platform.
Your goals:
- Ask one concise follow-up question at a time.
- Build rapport while gathering enough detail for therapist matching.
- Focus on symptoms, duration, intensity, functional impact, support goals, past therapy, medication history, and accessibility needs.
- Never diagnose, promise outcomes, or invent facts not mentioned by the user.
- Keep responses supportive and under 120 words.
- Mark isComplete as true only when you have enough information to summarize the user's current concerns, context, and likely next-step screening scales.

Return valid JSON only using this shape:
{
  "assistantResponse": "string",
  "state": {
    "assessmentPhase": "RAPPORT|ASSESSMENT|SNAPSHOT|COMPLETE",
    "completionReason": "string",
    "requiresCrisisProtocol": false,
    "extractedData": {},
    "identifiedQuestionnaires": {},
    "candidateScales": []
  },
  "isComplete": false,
  "results": {
    "assessmentId": "string",
    "completedAt": "ISO-8601 datetime",
    "questionnaireScores": {},
    "context": {
      "pastTherapyExperiences": [],
      "medicationHistory": [],
      "accessibilityNeeds": []
    }
  }
}

Rules:
- If isComplete is false, omit results.
- If isComplete is true, include results with best-effort questionnaireScores using stable keys like "phq9" or "gad7" and integer scores only when justified by the conversation. Otherwise use an empty object.
- Put concise structured facts in extractedData.
- Use assessmentPhase RAPPORT at the beginning, ASSESSMENT while gathering information, SNAPSHOT when you can summarize, COMPLETE when the user ends the session or you have enough detail.
`.trim();

const FINALIZATION_PROMPT = `
The user has asked to end the pre-assessment.
Return a final JSON response that:
- thanks the user briefly,
- marks isComplete as true,
- sets assessmentPhase to COMPLETE,
- includes the best available summary results from the conversation so far.
Do not ask another question.
`.trim();

const OLLAMA_FORMAT_SCHEMA = {
  type: 'object',
  required: ['assistantResponse', 'isComplete'],
  properties: {
    assistantResponse: { type: 'string' },
    isComplete: { type: 'boolean' },
    state: {
      type: 'object',
      properties: {
        assessmentPhase: { type: 'string' },
        completionReason: { type: 'string' },
        requiresCrisisProtocol: { type: 'boolean' },
        extractedData: { type: 'object', additionalProperties: true },
        identifiedQuestionnaires: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
        candidateScales: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      additionalProperties: false,
    },
    results: {
      type: 'object',
      properties: {
        assessmentId: { type: 'string' },
        completedAt: { type: 'string' },
        questionnaireScores: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              severity: { type: 'string' },
            },
            required: ['score', 'severity'],
            additionalProperties: false,
          },
        },
        context: {
          type: 'object',
          properties: {
            pastTherapyExperiences: {
              type: 'array',
              items: { type: 'string' },
            },
            medicationHistory: {
              type: 'array',
              items: { type: 'string' },
            },
            accessibilityNeeds: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

@Injectable()
export class AurisService {
  private readonly logger = new Logger(AurisService.name);
  private readonly ollamaBaseUrl: string;
  private readonly ollamaModel: string;
  private readonly sessions = new Map<string, ChatSession>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => PreAssessmentService))
    private readonly preAssessmentService: PreAssessmentService,
  ) {
    this.ollamaBaseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') ||
      'http://localhost:11434';
    this.ollamaModel =
      this.configService.get<string>('OLLAMA_MODEL') ||
      'gemma4:31b-cloud';
  }

  async createSession(userId?: string): Promise<NewSessionResponseDto> {
    const sessionId = randomUUID();

    this.logger.log(
      `${userId ? `User ${userId}` : 'Anonymous user'} creating new Ollama session ${sessionId}`,
    );

    this.sessions.set(sessionId, {
      userId,
      persisted: false,
      messages: [
        { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
        { role: 'assistant', content: SESSION_OPENING_MESSAGE },
      ],
    });

    return {
      session_id: sessionId,
      opening_message: SESSION_OPENING_MESSAGE,
    };
  }

  async chat(
    userId: string | undefined,
    sessionId: string,
    message: string,
  ): Promise<AurisResponseDto> {
    try {
      const session = this.getSessionOrThrow(sessionId);
      session.messages.push({ role: 'user', content: message });

      this.logger.log(
        `${userId ? `User ${userId}` : 'Anonymous user'} sending chat to Ollama session ${sessionId}`,
      );

      const structuredReply = await this.requestStructuredReply(session.messages);
      const mappedResponse = this.mapStructuredReply(
        structuredReply,
        sessionId,
        session.messages,
      );

      session.messages.push({
        role: 'assistant',
        content: mappedResponse.response,
      });
      session.lastResponse = mappedResponse;

      if (mappedResponse.state.is_complete && mappedResponse.results) {
        await this.persistCompletedSession(session, sessionId, mappedResponse.results);
      }

      return mappedResponse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error in Auris chat: ${error.message}`);
      throw new InternalServerErrorException('Failed to communicate with AI service');
    }
  }

  async endSession(
    userId: string | undefined,
    sessionId: string,
  ): Promise<AurisResponseDto> {
    try {
      const session = this.getSessionOrThrow(sessionId);

      this.logger.log(
        `${userId ? `User ${userId}` : 'Anonymous user'} ending Ollama session ${sessionId}`,
      );

      if (session.lastResponse?.state.is_complete) {
        return session.lastResponse;
      }

      const structuredReply = await this.requestStructuredReply([
        ...session.messages,
        { role: 'system', content: FINALIZATION_PROMPT },
      ]);
      const mappedResponse = this.mapStructuredReply(
        {
          ...structuredReply,
          isComplete: true,
          state: {
            ...structuredReply.state,
            assessmentPhase: 'COMPLETE',
            completionReason:
              structuredReply.state?.completionReason || 'session_ended_by_user',
          },
        },
        sessionId,
        session.messages,
      );

      session.messages.push({
        role: 'assistant',
        content: mappedResponse.response,
      });
      session.lastResponse = mappedResponse;

      if (mappedResponse.results) {
        await this.persistCompletedSession(session, sessionId, mappedResponse.results);
      }

      return mappedResponse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error ending Auris session: ${error.message}`);
      throw new InternalServerErrorException('Failed to end AI session');
    }
  }

  private async saveAurisResults(
    userId: string | undefined,
    sessionId: string,
    results: AurisResultDto,
  ): Promise<void> {
    const payload: CreatePreAssessmentDto = {
      assessmentId: results.assessmentId,
      method: 'CHATBOT',
      completedAt: results.completedAt,
      data: results.data,
      pastTherapyExperiences:
        results.context.pastTherapyExperiences?.join(', ') || null,
      medicationHistory: results.context.medicationHistory?.join(', ') || null,
      accessibilityNeeds: results.context.accessibilityNeeds?.join(', ') || null,
    };

    if (userId) {
      await this.preAssessmentService.createPreAssessment(userId, payload);
      return;
    }

    await this.preAssessmentService.createAnonymousPreAssessment({
      ...payload,
      assessmentId: sessionId,
    });
  }

  async getPdfSummary(sessionId: string): Promise<AxiosResponse> {
    throw new NotImplementedException(
      `PDF summary export is not supported for Ollama assessment session ${sessionId}`,
    );
  }

  async getPdfHistory(sessionId: string): Promise<AxiosResponse> {
    throw new NotImplementedException(
      `PDF history export is not supported for Ollama assessment session ${sessionId}`,
    );
  }

  private getSessionOrThrow(sessionId: string): ChatSession {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Assessment session not found');
    }

    return session;
  }

  private async requestStructuredReply(
    messages: ChatMessage[],
  ): Promise<StructuredAssessmentReply> {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post(
        `${this.ollamaBaseUrl}/api/chat`,
        {
          model: this.ollamaModel,
          stream: false,
          format: OLLAMA_FORMAT_SCHEMA,
          messages,
        },
        { timeout: 120_000 },
      ),
    );

    const rawContent = response.data?.message?.content;

    if (typeof rawContent !== 'string') {
      throw new InternalServerErrorException('Ollama returned an invalid chat payload');
    }

    try {
      return JSON.parse(rawContent) as StructuredAssessmentReply;
    } catch {
      this.logger.error(`Invalid Ollama JSON response: ${rawContent}`);
      throw new InternalServerErrorException('Ollama returned malformed assessment data');
    }
  }

  private mapStructuredReply(
    reply: StructuredAssessmentReply,
    sessionId: string,
    messages: ChatMessage[],
  ): AurisResponseDto {
    return {
      response: reply.assistantResponse,
      state: this.buildState(reply, messages),
      results:
        reply.isComplete || reply.results
          ? {
              assessmentId: reply.results?.assessmentId || sessionId,
              method: 'CHATBOT',
              completedAt:
                reply.results?.completedAt || new Date().toISOString(),
              data: {
                questionnaireScores: reply.results?.questionnaireScores || {},
              },
              context: {
                pastTherapyExperiences:
                  reply.results?.context?.pastTherapyExperiences || [],
                medicationHistory:
                  reply.results?.context?.medicationHistory || [],
                accessibilityNeeds:
                  reply.results?.context?.accessibilityNeeds || [],
              },
            }
          : undefined,
    };
  }

  private buildState(
    reply: StructuredAssessmentReply,
    messages: ChatMessage[],
  ): AurisStateDto {
    const assistantMessages = messages.filter((entry) => entry.role === 'assistant');
    const conversationalMessages = messages.filter((entry) => entry.role !== 'system');

    return {
      assessment_phase:
        reply.state?.assessmentPhase || (reply.isComplete ? 'COMPLETE' : 'ASSESSMENT'),
      completion_reason:
        reply.state?.completionReason ||
        (reply.isComplete ? 'assessment_complete' : 'collecting_context'),
      total_questions_asked:
        reply.state?.totalQuestionsAsked ?? assistantMessages.length,
      message_count: reply.state?.messageCount ?? conversationalMessages.length,
      is_complete: reply.isComplete,
      requires_crisis_protocol: reply.state?.requiresCrisisProtocol || false,
      extracted_data: reply.state?.extractedData || {},
      identified_questionnaires: reply.state?.identifiedQuestionnaires || {},
      candidate_scales: reply.state?.candidateScales || [],
    };
  }

  private async persistCompletedSession(
    session: ChatSession,
    sessionId: string,
    results: AurisResultDto,
  ): Promise<void> {
    if (session.persisted) {
      return;
    }

    this.logger.log(
      `Ollama session ${sessionId} complete. Saving results for ${session.userId ? `user ${session.userId}` : 'anonymous session'}...`,
    );
    await this.saveAurisResults(session.userId, sessionId, results);
    session.persisted = true;
  }
}
