"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MentaraLogo } from "@/components/common/MentaraLogo";
import { Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DEMO_WELCOME_MESSAGE =
  "Hi! I'm Mentara. This is a demo — ask me anything and I'll show you how chat works. Sign up to connect with real support.";

const DEMO_REPLIES = [
  "Thanks for sharing. We're here to help — this is a demo. Sign up to connect with real support.",
  "That's a great question! In the full app you'll be able to talk with our team. This is just a preview.",
  "We appreciate you trying Mentara. Create an account to get matched with a therapist.",
  "I'm a demo bot, so I can't give real advice. Reach out through Mentara when you're ready for support.",
  "You're in the right place. When you're ready, sign up to start your wellness journey with us.",
  "This chat is for demonstration only. Create an account to access real conversations and care.",
];

export interface DemoChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function DemoChatbotModal({ open, onOpenChange }: DemoChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyIndexRef = useRef(0);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: DEMO_WELCOME_MESSAGE,
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsTyping(true);

    const reply =
      DEMO_REPLIES[replyIndexRef.current % DEMO_REPLIES.length];
    replyIndexRef.current += 1;

    const delay = 800 + Math.random() * 400;
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
        )}
      >
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <MentaraLogo
              variant="icon"
              href={undefined}
              showGradient={false}
              width={36}
              height={36}
            />
            <SheetTitle className="text-lg font-semibold text-foreground">
              Mentara
            </SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Demo — conversations are simulated
          </p>
        </SheetHeader>

        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
          role="log"
          aria-label="Chat messages"
        >
          <div className="flex flex-col gap-3 pr-2">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-2",
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                      <MentaraLogo
                        variant="icon"
                        href={undefined}
                        showGradient={false}
                        width={24}
                        height={24}
                      />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl py-2.5 px-4 shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border border-border"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 justify-start"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  <MentaraLogo
                    variant="icon"
                    href={undefined}
                    showGradient={false}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="bg-muted border border-border rounded-xl py-2.5 px-4">
                  <span className="text-sm text-muted-foreground">
                    Typing...
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              aria-label="Message"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
