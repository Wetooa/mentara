"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
    usePreAssessmentControllerChat,
    usePreAssessmentControllerEndSession,
    usePreAssessmentControllerCreateSession,
} from "api-client";
import type { AurisStateDto, AurisResultDto } from "api-client";
import { useAuth } from "@/contexts/AuthContext";

export type Role = "assistant" | "user";

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
    type?: "text" | "questionnaire";
    questionData?: {
        questionId: string;
        question: string;
        options: Array<{ value: number; label: string }>;
        topic?: string;
    };
}

export interface UseChatbotReturn {
    sessionId: string | null;
    messages: Message[];
    isLoading: boolean;
    isComplete: boolean;
    appState: AurisStateDto | null;
    assessmentResults: AurisResultDto | null;
    sendMessage: (content: string) => Promise<void>;
    resetSession: () => void;
    resetAndRestart: () => Promise<void>;
    endSession: () => Promise<void>;
    startSession: () => Promise<void>;
}

/** Returns true when the AURIS microservice considers the assessment done */
function isSessionComplete(state?: AurisStateDto | null): boolean {
    if (!state) return false;
    return state.is_complete || state.assessment_phase === "SNAPSHOT";
}

export function useChatbot(): UseChatbotReturn {
    const { isAuthenticated } = useAuth();
    const chatMutation = usePreAssessmentControllerChat({
        // Chat is non-idempotent — retrying would re-send the same message to AURIS.
        // Errors surface to the UI (toast) and the user decides whether to resend.
        mutation: { retry: false },
    });
    const endSessionMutation = usePreAssessmentControllerEndSession({
        mutation: { retry: false },
    });
    const createSessionMutation = usePreAssessmentControllerCreateSession({
        mutation: { retry: false },
    });

    const [sessionId, setSessionId] = useState<string | null>(null);
    // Mirror sessionId in a ref so startSession's guard is never stale
    const sessionIdRef = useRef<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [appState, setAppState] = useState<AurisStateDto | null>(null);
    const [assessmentResults, setAssessmentResults] = useState<AurisResultDto | null>(null);

    const isInitializing = useRef(false);
    const isSending = useRef(false); // synchronous guard — state lags a render behind

    // Keep ref in sync with state
    useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

    // ─── Session init ──────────────────────────────────────────────────────────

    const startSession = useCallback(async () => {
        // Use ref so this guard is never stale after a synchronous resetSession
        if (isInitializing.current || sessionIdRef.current) return;

        if (!isAuthenticated) {
            console.warn("[useChatbot] Attempted to start session without authentication.");
            return;
        }

        isInitializing.current = true;
        setIsLoading(true);

        try {
            // createSession returns { session_id, opening_message } directly
            const payload = await createSessionMutation.mutateAsync();

            console.log("Payload", payload);

            const newSessionId = payload.session_id ?? null;
            const openingMessage =
                payload.opening_message ??
                "Hi! I'm AURIS, your clinical assessment assistant. How have you been feeling lately?";

            setSessionId(newSessionId);
            sessionIdRef.current = newSessionId;
            setMessages([
                {
                    id: "opening",
                    role: "assistant",
                    content: openingMessage,
                    timestamp: new Date(),
                },
            ]);
        } catch (error) {
            console.error("[useChatbot] Failed to start session:", error);
            toast.error("Failed to initialize assessment session.");
        } finally {
            setIsLoading(false);
            isInitializing.current = false;
        }
    }, [sessionId, isAuthenticated]);

    // ─── Send message ──────────────────────────────────────────────────────────

    const sendMessage = async (content: string) => {
        // isSending.current flips synchronously so concurrent calls are blocked
        // even before isLoading state has had a chance to re-render.
        if (!content.trim() || !sessionId || isSending.current || isComplete) return;
        isSending.current = true;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // The chat endpoint returns the raw Flask payload (AurisResponseDto) directly —
            // AurisService passes the Flask body through as-is (no NestJS envelope).
            const chatPayload = await chatMutation.mutateAsync({
                data: { sessionId, message: content },
            });

            const responseText = chatPayload.response ?? "I didn't quite catch that, could you repeat?";
            const state = chatPayload.state ?? null;

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseText,
                timestamp: new Date(),
                type: "text",
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setAppState(state);

            if (isSessionComplete(state)) {
                // Extract results (questionnaireScores + context) if the assessment finished
                if (chatPayload.results) setAssessmentResults(chatPayload.results);
                setIsComplete(true);
                toast.success("Assessment complete!");
            }
        } catch (error) {
            console.error("[useChatbot] Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
            isSending.current = false;
        }
    };

    // ─── End session ───────────────────────────────────────────────────────────

    const endSession = async () => {
        if (!sessionId) return;

        setIsLoading(true);
        try {
            // endSession also returns the raw AurisResponseDto — no NestJS envelope
            const endPayload = await endSessionMutation.mutateAsync({ sessionId });
            const state = endPayload.state ?? null;

            if (endPayload.response) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        role: "assistant" as const,
                        content: endPayload.response,
                        timestamp: new Date(),
                    },
                ]);
            }

            setAppState(state);
            if (endPayload.results) setAssessmentResults(endPayload.results);
            setIsComplete(true);
            toast.success("Assessment finalized.");
        } catch (error) {
            console.error("[useChatbot] Failed to end session:", error);
            toast.error("Failed to finalize session.");
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Reset session ─────────────────────────────────────────────────────────

    const resetSession = useCallback(() => {
        if (!confirm("Are you sure you want to reset? All progress will be lost.")) return;
        setSessionId(null);
        sessionIdRef.current = null;
        setMessages([]);
        setIsComplete(false);
        setAppState(null);
        setAssessmentResults(null);
        isInitializing.current = false;
    }, []);

    /** Confirm reset then immediately begin a new session */
    const resetAndRestart = useCallback(async () => {
        if (!confirm("Are you sure you want to reset? All progress will be lost.")) return;
        setSessionId(null);
        sessionIdRef.current = null;
        setMessages([]);
        setIsComplete(false);
        setAppState(null);
        isInitializing.current = false;
        await startSession();
    }, [startSession]);

    return {
        sessionId,
        messages,
        isLoading,
        isComplete,
        appState,
        assessmentResults,
        sendMessage,
        resetSession,
        resetAndRestart,
        endSession,
        startSession,
    };
}
