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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Hooks & Components
import { useChatbot } from "@/hooks/pre-assessment";
import { MessageBubble } from "@/components/pre-assessment/chatbot/MessageBubble";

interface ChatbotInterfaceProps {
  onComplete?: (results: any) => void;
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
    sendMessage,
    resetSession,
    endSession
  } = useChatbot();

  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isComplete) {
      if (onComplete) {
        onComplete({});
      }
      if (onTransitionToRegistration) {
        setTimeout(onTransitionToRegistration, 1500);
      }
    }
  }, [isComplete, onComplete, onTransitionToRegistration]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isComplete) return;
    const content = input;
    setInput("");
    await sendMessage(content);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC]">
      {/* Internal Header - Only shown if not provided by parent */}
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
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">Session Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-red-500" onClick={resetSession}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Session
            </Button>
            {onCancel && (
              <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground" onClick={onCancel}>
                Exit
              </Button>
            )}
          </div>
        </header>
      )}

      {/* Main Chat Content - Full width */}
      <div className="flex-1 flex flex-col relative bg-dot-pattern overflow-hidden">
        <ScrollArea className="flex-1 px-4 sm:px-10 py-8">
          <div className="w-full max-w-5xl mx-auto space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((m, idx) => (
                <MessageBubble key={m.id || idx} message={m} />
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mb-4">
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

        {/* Floating Input Area - Full width */}
        <div className="p-4 sm:p-10 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent shrink-0">
          <div className="w-full max-w-5xl mx-auto">
            {!isComplete ? (
              <div className="space-y-4">
                <div className="relative group">
                  <Input
                    placeholder="Describe how you've been feeling..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
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
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-primary/20 bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden rounded-3xl max-w-md mx-auto">
                  <CardContent className="p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Great work!
                    </h3>
                    <p className="text-sm text-muted-foreground">Your intake is complete. Our clinicians are reviewing your profile now.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
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
