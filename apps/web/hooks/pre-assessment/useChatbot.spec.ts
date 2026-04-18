"use client";

import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import {
  usePreAssessmentControllerChat,
  usePreAssessmentControllerCreateSession,
  usePreAssessmentControllerEndSession,
} from 'api-client';
import { useChatbot } from './useChatbot';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

describe('useChatbot', () => {
  const createSessionMutation = { mutateAsync: jest.fn() };
  const chatMutation = { mutateAsync: jest.fn() };
  const endSessionMutation = { mutateAsync: jest.fn() };
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    (usePreAssessmentControllerCreateSession as jest.Mock).mockReturnValue(
      createSessionMutation,
    );
    (usePreAssessmentControllerChat as jest.Mock).mockReturnValue(chatMutation);
    (usePreAssessmentControllerEndSession as jest.Mock).mockReturnValue(
      endSessionMutation,
    );
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('starts a session and seeds the first assistant message', async () => {
    createSessionMutation.mutateAsync.mockResolvedValue({
      session_id: 'session-123',
      opening_message: 'Welcome to Mentara.',
    });

    const { result } = renderHook(() => useChatbot());

    await act(async () => {
      await result.current.startSession();
    });

    expect(result.current.sessionId).toBe('session-123');
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Welcome to Mentara.');
  });

  it('marks the assessment complete when the backend returns a snapshot state', async () => {
    createSessionMutation.mutateAsync.mockResolvedValue({
      session_id: 'session-123',
      opening_message: 'Welcome to Mentara.',
    });
    chatMutation.mutateAsync.mockResolvedValue({
      response: 'Thanks. I have enough information.',
      state: {
        assessment_phase: 'SNAPSHOT',
        completion_reason: 'assessment_complete',
        total_questions_asked: 3,
        message_count: 4,
        is_complete: false,
        requires_crisis_protocol: false,
        extracted_data: {},
        identified_questionnaires: {},
        candidate_scales: ['PHQ-9'],
      },
      results: {
        assessmentId: 'assessment-123',
        method: 'CHATBOT',
        completedAt: '2026-04-16T00:00:00.000Z',
        data: {
          questionnaireScores: {
            phq9: { score: 10, severity: 'moderate' },
          },
        },
        context: {
          pastTherapyExperiences: [],
          medicationHistory: [],
          accessibilityNeeds: [],
        },
      },
    });

    const { result } = renderHook(() => useChatbot());

    await act(async () => {
      await result.current.startSession();
      await result.current.sendMessage('I have felt anxious for weeks.');
    });

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });
    expect(result.current.assessmentResults?.data.questionnaireScores.phq9.score).toBe(10);
    expect(toast.success).toHaveBeenCalledWith('Assessment complete!');
  });

  it('surfaces API failures to the user', async () => {
    createSessionMutation.mutateAsync.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useChatbot());

    await act(async () => {
      await result.current.startSession();
    });

    expect(result.current.sessionId).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('Failed to initialize assessment session.');
  });
});
