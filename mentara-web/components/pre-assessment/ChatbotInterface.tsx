'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePreAssessmentService } from '@/hooks/pre-assessment/usePreAssessmentService';
import { Loader2, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotInterfaceProps {
  onComplete?: (results: {
    scores: Record<string, { score: number; severity: string }>;
    severityLevels: Record<string, string>;
  }) => void;
  onCancel?: () => void;
}

export default function ChatbotInterface({
  onComplete,
  onCancel,
}: ChatbotInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { service } = usePreAssessmentService();

  useEffect(() => {
    // Start chatbot session on mount
    const startSession = async () => {
      try {
        setIsLoading(true);
        const result = await service.startChatbotSession();
        setSessionId(result.sessionId);
        
        // Add welcome message
        setMessages([
          {
            role: 'assistant',
            content: 'Hello! I\'m here to help you complete your mental health assessment through a conversation. Instead of filling out forms, we can talk about how you\'ve been feeling. I\'ll ask you some questions, and you can answer in your own words. Are you ready to begin?',
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Failed to start chatbot session:', error);
        alert('Failed to start chatbot. Please try again.');
        onCancel?.();
      } finally {
        setIsLoading(false);
      }
    };

    startSession();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isLoading || isComplete) {
      return;
    }

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      setIsLoading(true);
      const response = await service.sendChatbotMessage(sessionId, userMessage);
      
      // Add assistant response to UI
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (response.isComplete) {
        setIsComplete(true);
        // Auto-complete the session
        handleComplete();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or use the traditional checklist instead.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const results = await service.completeChatbotSession(sessionId);
      onComplete?.(results);
    } catch (error) {
      console.error('Failed to complete session:', error);
      alert('Failed to complete assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-gradient-to-br from-white to-primary/5 rounded-lg shadow-xl border-2 border-primary/10">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base whitespace-nowrap bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">AI Assistant</h3>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs sm:text-sm hover:bg-primary/10">
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm transition-all ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="p-4 border-t bg-gradient-to-t from-white to-primary/5">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              disabled={isLoading}
              className="flex-1 rounded-xl border-2 focus:border-primary/50"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isComplete && (
        <div className="p-4 border-t bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm text-green-800 font-medium text-center">
              Assessment complete! Processing your results...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

