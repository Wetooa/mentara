"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { usePreAssessmentControllerChat, usePreAssessmentControllerEndSession } from "api-client";
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
    const { isAuthenticated } = useAuth();
    const chatMutation = usePreAssessmentControllerChat();
    const endSessionMutation = usePreAssessmentControllerEndSession();

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
            
            // Client-side session start since the backend handles it via Python microservice seamlessly 
            const newSessionId = crypto.randomUUID();
            setSessionId(newSessionId);
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
    }, [sessionId, isAuthenticated]);

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
            const rawResponse = await chatMutation.mutateAsync({
                data: {
                    sessionId,
                    message: content,
                }
            });

            // Map the `PreAssessmentControllerChat200` to expected structure.
            // Auris microservice returns `{ response, state: { is_complete } }`
            const response = rawResponse as unknown as {
                response: string;
                state: { is_complete: boolean };
                toolCall?: {
                    questionId: string;
                    question: string;
                    options: Array<{ value: number; label: string }>;
                    topic?: string;
                };
            };

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.response || "I didn't quite catch that, could you repeat?",
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

            if (response.state?.is_complete) {
                setIsComplete(true);
                toast.success("Assessment complete!");
            }
        } catch (error) {
            console.error("[useChatbot] Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
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
            await endSessionMutation.mutateAsync({ sessionId });
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
