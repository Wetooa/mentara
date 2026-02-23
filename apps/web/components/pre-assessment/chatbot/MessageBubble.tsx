"use client";

import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
    id: string;
    role: "assistant" | "user";
    content: string;
    timestamp: Date;
}

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
    const isAssistant = message.role === "assistant";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
                "flex gap-3 mb-4",
                isAssistant ? "justify-start" : "justify-end"
            )}
        >
            {isAssistant && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                </div>
            )}
            <div className={cn(
                "max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm",
                isAssistant
                    ? "bg-white border border-gray-100 text-gray-800"
                    : "bg-primary text-primary-foreground shadow-primary/20"
            )}>
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <span className={cn(
                    "text-[10px] mt-1 block opacity-50 text-right",
                    isAssistant ? "text-gray-500" : "text-primary-foreground/70"
                )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            {!isAssistant && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-1 ring-primary/20 shadow-sm">
                    <User className="h-4 w-4 text-primary-foreground" />
                </div>
            )}
        </motion.div>
    );
};
