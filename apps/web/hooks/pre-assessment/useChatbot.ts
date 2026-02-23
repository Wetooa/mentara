"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
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
    sendMessage: (content: string) => Promise<void>;
    resetSession: () => void;
    endSession: () => Promise<void>;
}

export function useChatbot(): UseChatbotReturn {
    const api = useApi();
    const { isAuthenticated } = useAuth();

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const isInitializing = useRef(false);

    // Initialize session
    const startSession = useCallback(async () => {
        if (isInitializing.current || sessionId) return;

        try {
            if (!isAuthenticated) {
                console.warn("[useChatbot] Attempted to start session without authentication.");
                return;
            }
            isInitializing.current = true;
            setIsLoading(true);
            const result = await api.preAssessment.startChatbotSession();
            setSessionId(result.sessionId);
            setMessages([
                {
                    id: "1",
                    role: "assistant",
                    content: "Hi! I'm AURIS, your clinical assessment assistant. I'm here to help understand your needs so we can match you with the best specialized care. How have you been feeling lately?",
                    timestamp: new Date()
                }
            ]);
        } catch (error) {
            console.error("[useChatbot] Failed to start session:", error);
            toast.error("Failed to initialize assessment session.");
        } finally {
            setIsLoading(false);
            isInitializing.current = false;
        }
    }, [api.preAssessment, sessionId]);

    useEffect(() => {
        if (isAuthenticated) {
            startSession();
        }
    }, [isAuthenticated, startSession]);

    // Send message
    const sendMessage = async (content: string) => {
        if (!content.trim() || !sessionId || isLoading || isComplete) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await api.preAssessment.sendChatbotMessage(sessionId, content);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.response,
                timestamp: new Date(),
                type: response.toolCall ? "questionnaire" : "text",
                questionData: response.toolCall ? {
                    questionId: response.toolCall.questionId,
                    question: response.toolCall.question,
                    options: response.toolCall.options,
                    topic: response.toolCall.topic
                } : undefined
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (response.isComplete) {
                setIsComplete(true);
                toast.success("Assessment complete!");
            }
        } catch (error) {
            console.error("[useChatbot] Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
            // Option to remove the failed user message or mark it as failed
        } finally {
            setIsLoading(false);
        }
    };

    // Reset session
    const resetSession = useCallback(() => {
        if (confirm("Are you sure you want to reset? All progress will be lost.")) {
            setSessionId(null);
            setMessages([]);
            setIsComplete(false);
            window.location.reload(); // Simplest way to ensure clean state
        }
    }, []);

    // End session manually
    const endSession = async () => {
        if (!sessionId || isComplete) return;

        try {
            setIsLoading(true);
            await api.preAssessment.completeChatbotSession(sessionId);
            setIsComplete(true);
            toast.success("Assessment finalized.");
        } catch (error) {
            console.error("[useChatbot] Failed to end session:", error);
            toast.error("Failed to finalize session.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        sessionId,
        messages,
        isLoading,
        isComplete,
        sendMessage,
        resetSession,
        endSession
    };
}
