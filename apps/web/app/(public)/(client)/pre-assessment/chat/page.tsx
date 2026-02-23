"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    Send,
    RotateCcw,
    XCircle,
    ChevronRight,
    Sparkles,
    Loader2,
    ShieldCheck,
    Bug,
    ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Hooks & Components
import { useChatbot } from "@/hooks/pre-assessment";
import { MessageBubble } from "@/components/pre-assessment/chatbot/MessageBubble";
import { SessionInsights } from "@/components/pre-assessment/chatbot/SessionInsights";

function ChatbotPageContent() {
    const router = useRouter();
    const {
        sessionId,
        messages,
        isLoading,
        isComplete,
        sendMessage,
        resetSession,
        endSession
    } = useChatbot();

    const [input, setInput] = useState("");
    const [isInsightExpanded, setIsInsightExpanded] = useState(true);
    const [showDebug, setShowDebug] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || isComplete) return;
        const content = input;
        setInput("");
        await sendMessage(content);
    };

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/pre-assessment")} className="h-8 w-8 rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold tracking-tight">AURIS <span className="text-primary/60 font-medium">Assistant</span></h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Secure Session</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowDebug(!showDebug)}>
                                    <Bug className={cn("h-4 w-4 transition-colors", showDebug ? "text-primary" : "text-muted-foreground")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Development Debug</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button variant="ghost" size="sm" className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-red-500" onClick={resetSession}>
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                    </Button>
                </div>
            </header>

            {/* Main Layout Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Chat Section */}
                <div className="flex-1 flex flex-col relative bg-dot-pattern">
                    <ScrollArea className="flex-1 px-4 sm:px-6 py-6">
                        <div className="max-w-2xl mx-auto">
                            <AnimatePresence mode="popLayout">
                                {messages.map(m => (
                                    <MessageBubble key={m.id} message={m} />
                                ))}
                            </AnimatePresence>
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mb-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                    </div>
                                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm text-xs font-medium text-muted-foreground italic">
                                        AURIS is thinking...
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Section */}
                    <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm border-t">
                        <div className="max-w-2xl mx-auto relative">
                            {!isComplete ? (
                                <>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                placeholder="Type your message..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                                disabled={isLoading}
                                                className="pr-12 h-12 rounded-2xl border-gray-200 focus:ring-primary/20 transition-all shadow-sm"
                                            />
                                            <div className="absolute right-2 top-1.5">
                                                <Button
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl shadow-md hover:shadow-lg transition-all"
                                                    disabled={!input.trim() || isLoading}
                                                    onClick={handleSend}
                                                >
                                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between px-1">
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                            Clinical data is encrypted and HIPAA compliant
                                        </p>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-1.5 opacity-50 hover:opacity-100" onClick={endSession}>
                                                <XCircle className="h-3 w-3" />
                                                End Session
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
                                        <CardContent className="p-6 text-center">
                                            <h3 className="text-lg font-bold text-primary mb-2 flex items-center justify-center gap-2">
                                                <Sparkles className="h-5 w-5" />
                                                Assessment Complete
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4">You have successfully completed your clinical intake. We're now matching you with the right therapist.</p>
                                            <Button className="w-full sm:w-auto px-8" onClick={() => router.push("/client/welcome")}>
                                                View My Matches
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Insight Sidebar */}
                <div className={cn(
                    "hidden md:block transition-all duration-300 ease-in-out border-l shadow-2xl z-40 bg-white",
                    isInsightExpanded ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
                )}>
                    <SessionInsights
                        assessmentComplete={isComplete}
                        messagesCount={messages.length}
                        sessionId={sessionId}
                        showDebug={showDebug}
                    />
                </div>

                {/* Visibility Toggle Button */}
                <button
                    onClick={() => setIsInsightExpanded(!isInsightExpanded)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-12 bg-white border border-gray-200 rounded-full shadow-lg z-50 flex items-center justify-start pl-1.5 hover:bg-gray-50 transition-colors"
                >
                    <ChevronRight className={cn("h-4 w-4 transition-transform text-muted-foreground", isInsightExpanded && "rotate-180")} />
                </button>
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

export default function PreAssessmentChatPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <ChatbotPageContent />
        </Suspense>
    );
}
