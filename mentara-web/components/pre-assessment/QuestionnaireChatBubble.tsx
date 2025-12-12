'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, MessageSquare, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionnaireChatBubbleProps {
  question: string;
  options: Array<{ value: number; label: string }>;
  questionId: string;
  topic?: string;
  onAnswer: (questionId: string, answer: number) => void;
  onAskQuestion?: (question: string) => void;
  disabled?: boolean;
  initialAnswer?: number;
  thankYouMessage?: string;
}

export function QuestionnaireChatBubble({
  question,
  options,
  questionId,
  topic,
  onAnswer,
  onAskQuestion,
  disabled = false,
  initialAnswer,
  thankYouMessage,
}: QuestionnaireChatBubbleProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(initialAnswer);
  const [questionInput, setQuestionInput] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(!!initialAnswer);
  const [showThankYou, setShowThankYou] = useState(false);

  // Show thank you when answer is submitted
  useEffect(() => {
    if (hasAnswered && thankYouMessage) {
      // Delay showing thank you slightly for better UX
      const timer = setTimeout(() => {
        setShowThankYou(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hasAnswered, thankYouMessage]);

  const handleSelectAnswer = (value: number) => {
    if (disabled || selectedAnswer !== undefined) return;
    
    setSelectedAnswer(value);
    setHasAnswered(true);
    onAnswer(questionId, value);
  };

  const handleAskQuestion = () => {
    if (questionInput.trim() && onAskQuestion) {
      onAskQuestion(questionInput.trim());
      setQuestionInput('');
      setShowQuestionInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm max-w-full hover:shadow-md transition-shadow">
      {/* Topic badge */}
      {topic && (
        <div className="text-xs font-medium text-primary/70 uppercase tracking-wide">
          {topic}
        </div>
      )}
      
      {/* Question text */}
      <div className="text-sm font-medium text-gray-800 leading-relaxed">
        {question}
      </div>

      {/* Options as clickable buttons */}
      <div className="flex flex-col gap-2 mt-1">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.value;
          const isDisabled = disabled || (selectedAnswer !== undefined && !isSelected);
          
          return (
            <Button
              key={option.value}
              onClick={() => handleSelectAnswer(option.value)}
              disabled={isDisabled}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "justify-start text-left h-auto py-2.5 px-3 transition-all text-sm",
                isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 shadow-sm",
                !isSelected && !isDisabled && "bg-white hover:bg-primary/10 hover:border-primary/40 hover:shadow-sm",
                isDisabled && !isSelected && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Option indicator */}
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected 
                    ? "bg-white border-white" 
                    : "border-gray-300 bg-white"
                )}>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                  )}
                </div>
                
                {/* Option label */}
                <span className="flex-1 text-sm font-medium">
                  {option.label}
                </span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Thank you message - inline within bubble */}
      {hasAnswered && showThankYou && thankYouMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3 mt-2"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm text-primary font-medium">{thankYouMessage}</p>
          </div>
        </motion.div>
      )}
      
      {/* Confirmation indicator (minimal) */}
      {hasAnswered && !showThankYou && (
        <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
          <Check className="h-3 w-3" />
          <span>Answer recorded</span>
        </div>
      )}

      {/* Ask a question section */}
      {onAskQuestion && (
        <div className="border-t pt-3 space-y-2 mt-1">
          {!showQuestionInput ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQuestionInput(true)}
              className="w-full text-xs h-8"
            >
              <MessageSquare className="h-3 w-3 mr-2" />
              Ask a question about this
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1 h-8 text-xs"
                />
                <Button
                  type="button"
                  onClick={handleAskQuestion}
                  disabled={!questionInput.trim()}
                  size="sm"
                  className="h-8 px-3"
                >
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowQuestionInput(false);
                    setQuestionInput('');
                  }}
                  size="sm"
                  className="h-8 px-3"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your question will appear in the chat below.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


