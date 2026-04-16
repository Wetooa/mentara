'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StructuredQuestionBubbleProps {
  question: string;
  options: Array<{ value: number; label: string }>;
  questionId: string;
  topic?: string;
  onAnswer: (questionId: string, answer: number) => void;
  disabled?: boolean;
  initialAnswer?: number;
}

export function StructuredQuestionBubble({
  question,
  options,
  questionId,
  topic,
  onAnswer,
  disabled = false,
  initialAnswer,
}: StructuredQuestionBubbleProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(initialAnswer);

  const handleSelectAnswer = (value: number) => {
    if (disabled || selectedAnswer !== undefined) return;
    
    setSelectedAnswer(value);
    onAnswer(questionId, value);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      {/* Topic badge */}
      {topic && (
        <div className="text-xs font-medium text-primary/70 uppercase tracking-wide">
          {topic}
        </div>
      )}
      
      {/* Question text */}
      <div className="text-sm font-medium text-gray-800">
        {question}
      </div>

      {/* Options as clickable buttons */}
      <div className="flex flex-col gap-2 mt-2">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.value;
          const isDisabled = disabled || selectedAnswer !== undefined;
          
          return (
            <Button
              key={option.value}
              onClick={() => handleSelectAnswer(option.value)}
              disabled={isDisabled && !isSelected}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "justify-start text-left h-auto py-3 px-4 transition-all",
                isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                !isSelected && !isDisabled && "hover:bg-primary/10 hover:border-primary/40",
                isDisabled && !isSelected && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Option indicator */}
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected 
                    ? "bg-white border-white" 
                    : "border-gray-300 bg-white"
                )}>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary" strokeWidth={3} />
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

      {/* Confirmation message */}
      {selectedAnswer !== undefined && (
        <div className="text-xs text-primary/70 mt-1 flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>Answer recorded</span>
        </div>
      )}
    </div>
  );
}


