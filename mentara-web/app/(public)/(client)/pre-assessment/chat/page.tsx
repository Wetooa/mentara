"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { fadeDown } from "@/lib/animations";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function PreAssessmentChatPage() {
  const router = useRouter();
  const api = useApi();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm here to help assess your mental health needs. This will help us match you with the right therapist. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || assessmentComplete) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual chatbot API endpoint when backend is ready
      // For now, simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate AI response based on user input
      let assistantResponse = "";
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes("anxious") || lowerInput.includes("anxiety") || lowerInput.includes("worried")) {
        assistantResponse = "I understand you're feeling anxious. Can you tell me more about what situations trigger these feelings?";
      } else if (lowerInput.includes("sad") || lowerInput.includes("depressed") || lowerInput.includes("down")) {
        assistantResponse = "I hear you're feeling down. How long have you been feeling this way? Has it been affecting your daily activities?";
      } else if (lowerInput.includes("stress") || lowerInput.includes("stressed")) {
        assistantResponse = "Stress can be really challenging. What are the main sources of stress in your life right now?";
      } else if (lowerInput.includes("good") || lowerInput.includes("fine") || lowerInput.includes("okay")) {
        assistantResponse = "That's good to hear. What brings you to Mentara today? Is there something specific you'd like support with?";
      } else {
        assistantResponse = "Thank you for sharing that with me. Can you help me understand a bit more? What specific challenges or concerns would you like to address through therapy?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Check if we should complete the assessment (after a few exchanges)
      if (messages.length >= 6) {
        setAssessmentComplete(true);
        const finalMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "Thank you for sharing with me! I have enough information to help match you with a therapist. Would you like to proceed with creating an account to see your matches?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, finalMessage]);
      }
    } catch (error) {
      logger.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleComplete = () => {
    router.push("/pre-assessment/signup?method=chat");
  };

  return (
    <div className="bg-gradient-to-b from-tertiary to-transparent w-full min-h-screen flex flex-col">
      <motion.nav
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className="flex justify-between items-center p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm"
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/pre-assessment")}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-gray-900">AI Assessment</span>
        </div>
        <Logo />
      </motion.nav>

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 space-y-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    {message.role === "assistant" && (
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </CardContent>
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!assessmentComplete ? (
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Sparkles className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Assessment Complete!</h3>
              </div>
              <p className="text-sm text-gray-600">
                Based on our conversation, we're ready to match you with a therapist.
              </p>
              <Button onClick={handleComplete} className="w-full" size="lg">
                Continue to Sign Up
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
