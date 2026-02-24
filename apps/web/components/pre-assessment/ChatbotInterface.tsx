"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Send,
    RotateCcw,
    XCircle,
    Sparkles,
    Loader2,
    ShieldCheck,
    Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Hooks & Components
import { useChatbot } from "@/hooks/pre-assessment";
import type { AurisStateDto, AurisResultDto } from "api-client";
import { MessageBubble } from "@/components/pre-assessment/chatbot/MessageBubble";

interface ChatbotInterfaceProps {
    onComplete?: (state: AurisStateDto | null, results: AurisResultDto | null) => void;
    onCancel?: () => void;
    onTransitionToRegistration?: () => void;
    hideHeader?: boolean;
}

export default function ChatbotInterface({
    onComplete,
    onCancel,
    onTransitionToRegistration,
    hideHeader = false,
}: ChatbotInterfaceProps) {
    const {
        messages,
        isLoading,
        isComplete,
        appState,
        assessmentResults,
        sendMessage,
        resetSession,
        endSession,
        startSession,
        sessionId,
    } = useChatbot();

    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isComplete) {
            if (onComplete) onComplete(appState, assessmentResults);
            if (onTransitionToRegistration) {
                setTimeout(onTransitionToRegistration, 1500);
            }
        }
    }, [isComplete, appState, assessmentResults, onComplete, onTransitionToRegistration]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || isComplete) return;
        const content = input;
        setInput("");
        await sendMessage(content);
    };

    const handleReset = () => {
        resetSession();
        // resetSession clears state synchronously; kick off a fresh session
        startSession();
    };

    // ── Phase badge colour ────────────────────────────────────────────────────
    const phaseColour: Record<string, string> = {
        RAPPORT: "bg-green-100 text-green-700 border-green-200",
        ASSESSMENT: "bg-blue-100 text-blue-700 border-blue-200",
        SNAPSHOT: "bg-purple-100 text-purple-700 border-purple-200",
        COMPLETE: "bg-slate-100 text-slate-600 border-slate-200",
    };
    const phase = appState?.assessment_phase ?? "—";
    const phaseCls = phaseColour[phase] ?? "bg-slate-100 text-slate-600 border-slate-200";

    const hasQuestionnaires =
        !!appState?.identified_questionnaires &&
        Object.keys(appState.identified_questionnaires).length > 0;

    return (
        <div className="flex flex-col h-full w-full bg-[#F8FAFC]">
            {/* Internal Header */}
            {!hideHeader && (
                <header className="h-14 flex items-center justify-between px-6 border-b bg-white z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold tracking-tight">AI Clinical Assistant</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                                    Session Active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-red-500"
                            onClick={handleReset}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset Session
                        </Button>
                        {onCancel && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-8 text-muted-foreground"
                                onClick={onCancel}
                            >
                                Exit
                            </Button>
                        )}
                    </div>
                </header>
            )}

            {/* Body: chat + insights panel */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Chat Column */}
                <div className="flex-1 flex flex-col relative bg-dot-pattern overflow-hidden">
                    <ScrollArea className="flex-1 px-4 sm:px-10 py-8">
                        <div className="w-full max-w-5xl mx-auto space-y-6">
                            <AnimatePresence mode="popLayout">
                                {!sessionId ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center py-20 text-center space-y-6"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="h-10 w-10 text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                                            Ready to start your assessment?
                                        </h2>
                                        <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
                                            AURIS, your AI clinical assistant, will ask you a few questions
                                            to understand your needs and match you with the best care.
                                        </p>
                                        <Button
                                            size="lg"
                                            onClick={startSession}
                                            disabled={isLoading}
                                            className="rounded-2xl px-10 h-14 text-lg font-medium shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            ) : (
                                                <Sparkles className="mr-2 h-5 w-5" />
                                            )}
                                            Begin Assessment
                                        </Button>
                                    </motion.div>
                                ) : (
                                    messages.map((m, idx) => (
                                        <MessageBubble key={m.id ?? idx} message={m} />
                                    ))
                                )}
                            </AnimatePresence>

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3 mb-4"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                    </div>
                                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm text-xs font-medium text-muted-foreground italic">
                                        AURIS is analyzing...
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} className="h-12" />
                        </div>
                    </ScrollArea>

                    {/* Floating Input Area */}
                    <div className="p-4 sm:p-10 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent shrink-0">
                        <div className="w-full max-w-5xl mx-auto">
                                {sessionId ? (
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <Input
                                                placeholder="Describe how you've been feeling..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey && !e.repeat) {
                                                        e.preventDefault();
                                                        handleSend();
                                                    }
                                                }}
                                                disabled={isLoading}
                                                className="pr-16 h-16 rounded-2xl border-gray-200 focus:ring-primary/20 transition-all shadow-xl text-lg bg-white"
                                            />
                                            <div className="absolute right-3 top-3">
                                                <Button
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl shadow-md hover:shadow-lg transition-all"
                                                    disabled={!input.trim() || isLoading}
                                                    onClick={handleSend}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <Send className="h-5 w-5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                HIPAA Secure Protocol
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[10px] gap-1.5 px-3 rounded-lg opacity-40 hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-tighter"
                                                onClick={endSession}
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Complete Assessment
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            
                        </div>
                    </div>
                </div>

                {/* Session Insights Sidebar — only visible when a session is active */}
                {sessionId && (
                    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-l border-slate-200 bg-white px-5 py-6 overflow-y-auto gap-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                <h2 className="text-sm font-semibold text-slate-800">Session Insights</h2>
                            </div>
                            <Badge className={cn("text-[10px] font-semibold border px-2 py-0.5", phaseCls)}>
                                {phase}
                            </Badge>
                        </div>

                        {/* Current Phase */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                Current Phase
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                                {phase === "—" ? "Not started" : phase}
                            </p>
                            {appState?.total_questions_asked !== undefined && (
                                <p className="text-xs text-slate-500">
                                    {appState.total_questions_asked} question
                                    {appState.total_questions_asked !== 1 ? "s" : ""} asked
                                </p>
                            )}
                        </div>

                        {/* Identified Questionnaires */}
                        {hasQuestionnaires && (
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                    Rapport Questionnaires
                                </p>
                                {Object.entries(appState?.identified_questionnaires ?? {}).map(
                                    ([scale, reason]) => (
                                        <div
                                            key={scale}
                                            className="p-2 bg-white rounded-lg border border-slate-200 space-y-0.5"
                                        >
                                            <p className="text-xs font-semibold text-blue-700">{scale}</p>
                                            <p className="text-[11px] text-slate-500 leading-snug">{reason}</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* JSON Debug Panel */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                Assessment Data
                            </p>
                            <pre className="text-[10px] text-slate-700 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto max-h-64 leading-relaxed">
                                {JSON.stringify(
                                    {
                                        assessment_phase: appState?.assessment_phase,
                                        completion_reason: appState?.completion_reason,
                                        total_questions_asked: appState?.total_questions_asked,
                                        extracted_data: appState?.extracted_data,
                                        candidate_scales: appState?.candidate_scales,
                                    },
                                    null,
                                    2
                                )}
                            </pre>
                        </div>
                    </aside>
                )}
            </div>

            <style jsx global>{`
                .bg-dot-pattern {
                    background-image: radial-gradient(#E2E8F0 1px, transparent 1px);
                    background-size: 24px 24px;
                }
            `}</style>
        </div>
    );
}
