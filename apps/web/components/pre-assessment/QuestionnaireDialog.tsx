'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, MessageSquare, Send, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  options: Array<{ value: number; label: string }>;
  questionId: string;
  topic?: string;
  onAnswer: (questionId: string, answer: number) => void;
  onAskQuestion?: (question: string) => void;
  disabled?: boolean;
  initialAnswer?: number;
}

export function QuestionnaireDialog({
  open,
  onOpenChange,
  question,
  options,
  questionId,
  topic,
  onAnswer,
  onAskQuestion,
  disabled = false,
  initialAnswer,
}: QuestionnaireDialogProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(initialAnswer);
  const [questionInput, setQuestionInput] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(!!initialAnswer);

  const handleSelectAnswer = (value: number) => {
    if (disabled || selectedAnswer !== undefined) return;
    
    setSelectedAnswer(value);
    setHasAnswered(true);
    onAnswer(questionId, value);
  };

  const handleClose = (open: boolean) => {
    if (!open && !hasAnswered) {
      // Show warning if trying to close without answering
      const confirmed = window.confirm(
        'You haven\'t answered this question yet. Are you sure you want to close? You can come back to it later.'
      );
      if (!confirmed) {
        return;
      }
    }
    onOpenChange(open);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {topic && (
            <div className="text-xs font-medium text-primary/70 uppercase tracking-wide mb-2">
              {topic}
            </div>
          )}
          <DialogTitle className="text-lg text-center text-secondary">
            {question}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Please select the option that best describes your experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Options */}
          <div className="flex flex-col gap-2">
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
                    "justify-start text-left h-auto py-3 px-4 transition-all",
                    isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                    !isSelected && !isDisabled && "bg-white hover:bg-primary/10 hover:border-primary/40",
                    isDisabled && !isSelected && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
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
                    <span className="flex-1 text-sm font-medium">
                      {option.label}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Confirmation message */}
          {hasAnswered && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Answer recorded! You can ask a question below or close this dialog.
              </AlertDescription>
            </Alert>
          )}

          {/* Ask a question section */}
          {onAskQuestion && (
            <div className="border-t pt-4 space-y-2">
              {!showQuestionInput ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQuestionInput(true)}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
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
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAskQuestion}
                      disabled={!questionInput.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowQuestionInput(false);
                        setQuestionInput('');
                      }}
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your question will appear in the chat, and the assistant will respond there.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={disabled}
            >
              {hasAnswered ? 'Close' : 'Close (Skip for now)'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

