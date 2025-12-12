'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePreAssessmentService } from '@/hooks/pre-assessment/usePreAssessmentService';
import { Loader2, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { QuestionnaireProgress } from './QuestionnaireProgress';
import { QuestionnaireDialog } from './QuestionnaireDialog';
import { ChatbotDebugPanel } from './ChatbotDebugPanel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TextMessage extends BaseMessage {
  type?: 'text';
}

interface StructuredQuestionMessage extends BaseMessage {
  type: 'structured_question';
  questionData: {
    questionId: string;
    question: string;
    options: Array<{ value: number; label: string }>;
    topic?: string;
  };
  userAnswer?: number;
}

type Message = TextMessage | StructuredQuestionMessage;

interface ChatbotInterfaceProps {
  onComplete?: (results: {
    scores: Record<string, { score: number; severity: string }>;
    severityLevels: Record<string, string>;
  }) => void;
  onCancel?: () => void;
  onTransitionToRegistration?: () => void;
}

export default function ChatbotInterface({
  onComplete,
  onCancel,
  onTransitionToRegistration,
}: ChatbotInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState<string | null>(null);
  const [completedQuestionnaires, setCompletedQuestionnaires] = useState<string[]>([]);
  const [suggestedQuestionnaires, setSuggestedQuestionnaires] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    questionId: string;
    question: string;
    options: Array<{ value: number; label: string }>;
    topic?: string;
  } | null>(null);
  const [showEndConversationDialog, setShowEndConversationDialog] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { service } = usePreAssessmentService();

  useEffect(() => {
    // Start chatbot session on mount
    const startSession = async () => {
      try {
        setIsLoading(true);
        console.log('[Chatbot] Starting session...');
        const result = await service.startChatbotSession();
        console.log('[Chatbot] Session started:', result.sessionId);
        setSessionId(result.sessionId);
        
        // Fetch session state to get initial questionnaire info and messages
        try {
          const session = await service.getChatbotSession(result.sessionId);
          console.log('[Chatbot] Session data:', session);
          
          if (session.currentQuestionnaire) {
            setCurrentQuestionnaire(session.currentQuestionnaire);
          }
          if (session.completedQuestionnaires) {
            setCompletedQuestionnaires(session.completedQuestionnaires);
          }
        } catch (error) {
          console.warn('[Chatbot] Failed to fetch session state (non-critical):', error);
        }
        
        // Note: The backend creates the welcome message when starting the session
        // We'll display a loading message initially, and the first user message will trigger
        // the actual conversation. The backend's welcome message is stored in the session.
        setMessages([
          {
            role: 'assistant',
            content: 'Hello! I\'m here to help you complete your mental health assessment through a conversation. Instead of filling out forms, we can talk about how you\'ve been feeling. I\'ll ask you some questions, and you can answer in your own words. Are you ready to begin?',
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('[Chatbot] Failed to start chatbot session:', error);
        console.error('[Chatbot] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
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
      console.log('[Chatbot] Sending message:', { sessionId, message: userMessage.substring(0, 50) + '...' });
      const response = await service.sendChatbotMessage(sessionId, userMessage);
      console.log('[Chatbot] Full response object:', response);
      console.log('[Chatbot] Response details:', {
        responseLength: response.response?.length || 0,
        responsePreview: response.response?.substring(0, 200) + '...',
        isComplete: response.isComplete,
        currentQuestionnaire: response.currentQuestionnaire,
        hasToolCall: !!response.toolCall,
        toolCallDetails: response.toolCall ? JSON.stringify(response.toolCall, null, 2) : 'none',
      });
      
      // Parse tool call from response if not already extracted by backend
      let toolCall = response.toolCall;
      let cleanResponseText = response.response || '';
      
      console.log('[Chatbot] Initial tool call check:', {
        hasToolCallInResponse: !!response.toolCall,
        responseTextContainsToolCall: cleanResponseText.includes('TOOL_CALL'),
        responseTextPreview: cleanResponseText.substring(0, 300),
      });
      
      // Fallback: Extract tool call from response text if backend didn't parse it
      if (!toolCall && cleanResponseText) {
        const toolCallRegex = /TOOL_CALL:\s*(\{[\s\S]*?\})\s*(?:\n|$)/;
        const match = cleanResponseText.match(toolCallRegex);
        
        console.log('[Chatbot] Attempting to extract tool call from text:', {
          foundMatch: !!match,
          matchPreview: match ? match[0].substring(0, 200) : 'none',
        });
        
        if (match) {
          try {
            const jsonString = match[1];
            console.log('[Chatbot] Parsing tool call JSON:', jsonString.substring(0, 200));
            const parsed = JSON.parse(jsonString);
            
            if (
              parsed.tool === 'ask_question' &&
              parsed.questionId &&
              parsed.question &&
              Array.isArray(parsed.options) &&
              parsed.options.length > 0
            ) {
              toolCall = {
                tool: parsed.tool,
                questionId: parsed.questionId,
                topic: parsed.topic,
                question: parsed.question,
                options: parsed.options,
              };
              
              console.log('[Chatbot] ✅ Successfully extracted tool call:', toolCall);
              
              // Remove tool call from response text
              cleanResponseText = cleanResponseText.replace(toolCallRegex, '').trim();
            } else {
              console.warn('[Chatbot] Tool call missing required fields:', parsed);
            }
          } catch (error) {
            console.error('[Chatbot] Failed to parse tool call from response text:', error);
            console.error('[Chatbot] JSON string that failed:', match[1].substring(0, 200));
          }
        }
      } else if (toolCall) {
        console.log('[Chatbot] ✅ Tool call received from backend:', toolCall);
      }
      
      // Add assistant response to UI (conversational text, cleaned of tool calls)
      if (cleanResponseText && cleanResponseText.trim()) {
        const assistantMessage: TextMessage = {
          role: 'assistant',
          content: cleanResponseText,
          timestamp: new Date(),
          type: 'text',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Handle tool call - open dialog instead of inline bubble
      if (toolCall && toolCall.tool === 'ask_question') {
        console.log('[Chatbot] 🎯 Opening dialog with tool call:', toolCall);
        setCurrentQuestionData({
          questionId: toolCall.questionId,
          question: toolCall.question,
          options: toolCall.options,
          topic: toolCall.topic,
        });
        setDialogOpen(true);
      } else {
        console.log('[Chatbot] No tool call to display');
      }

      // Update questionnaire progress
      if (response.currentQuestionnaire) {
        setCurrentQuestionnaire(response.currentQuestionnaire);
      }

      // Fetch updated session state to get completed questionnaires
      try {
        const session = await service.getChatbotSession(sessionId);
        if (session.completedQuestionnaires) {
          setCompletedQuestionnaires(session.completedQuestionnaires);
        }
      } catch (error) {
        // Silently fail - not critical
      }

      // Fetch suggested questionnaires periodically
      if (messages.length % 5 === 0) {
        try {
          const suggestions = await service.suggestQuestionnaires(sessionId);
          setSuggestedQuestionnaires(suggestions.recommendedOrder);
        } catch (error) {
          // Silently fail - not critical
        }
      }

      // Update quick replies based on context
      updateQuickReplies(response.response);

      if (response.isComplete) {
        setIsComplete(true);
        // Auto-complete the session
        handleComplete();
      }
    } catch (error) {
      console.error('[Chatbot] Failed to send message:', error);
      console.error('[Chatbot] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        // Check if it's an API error with status/details
        status: (error as any)?.status,
        details: (error as any)?.details,
      });
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
      setIsProcessing(true);
      setIsComplete(true);
      const results = await service.completeChatbotSession(sessionId);
      
      // Show processing state
      const processingMessage: TextMessage = {
        role: 'assistant',
        content: 'Processing your assessment results...',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages((prev) => [...prev, processingMessage]);
      
      // Wait a bit for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onComplete?.(results);
      
      // Transition to registration
      if (onTransitionToRegistration) {
        setTimeout(() => {
          onTransitionToRegistration();
        }, 500);
      }
    } catch (error) {
      console.error('[Chatbot] Failed to complete session:', error);
      console.error('[Chatbot] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        status: (error as any)?.status,
        details: (error as any)?.details,
      });
      alert('Failed to complete assessment. Please try again.');
      setIsProcessing(false);
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStructuredAnswer = async (questionId: string, answer: number) => {
    if (!sessionId) return;

    try {
      console.log('[Chatbot] Submitting structured answer:', { questionId, answer });
      await service.submitStructuredAnswer(sessionId, questionId, answer);
      
      // Close dialog after answering
      setDialogOpen(false);
      
      // Add confirmation message
      const confirmationMessage: TextMessage = {
        role: 'assistant',
        content: 'Thank you for your answer!',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages((prev) => [...prev, confirmationMessage]);
      
      // Fetch updated session state
      try {
        const session = await service.getChatbotSession(sessionId);
        if (session.completedQuestionnaires) {
          setCompletedQuestionnaires(session.completedQuestionnaires);
        }
      } catch (error) {
        // Silently fail
      }
      
      console.log('[Chatbot] Structured answer submitted successfully');
    } catch (error) {
      console.error('[Chatbot] Failed to submit structured answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  const handleAskQuestionFromDialog = async (question: string) => {
    if (!sessionId || !question.trim()) return;

    // Add user question to chat
    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to chatbot
    try {
      setIsLoading(true);
      const response = await service.sendChatbotMessage(sessionId, question);
      
      if (response.response && response.response.trim()) {
        const assistantMessage: TextMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          type: 'text',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      if (response.isComplete) {
        setIsComplete(true);
        handleComplete();
      }
    } catch (error) {
      console.error('[Chatbot] Failed to send question:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuickReplies = (responseText?: string) => {
    const replies: string[] = [];
    if (responseText) {
      if (responseText.toLowerCase().includes('tell me more') || responseText.toLowerCase().includes('elaborate')) {
        replies.push('Tell me more', 'I understand', 'Skip this');
      } else if (responseText.toLowerCase().includes('question') || responseText.toLowerCase().includes('ask')) {
        replies.push('I\'m not sure', 'Can you explain?', 'Continue');
      } else {
        replies.push('Got it', 'Continue', 'Tell me more');
      }
    } else {
      replies.push('Got it', 'Continue', 'Tell me more');
    }
    setQuickReplies(replies.slice(0, 3));
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    // Auto-send after a brief delay for better UX
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleDebugInject = (debugResponse: {
    text: string;
    toolCall?: {
      tool: string;
      questionId: string;
      topic?: string;
      question: string;
      options: Array<{ value: number; label: string }>;
    };
  }) => {
    console.log('[Chatbot] 🐛 Debug injection:', debugResponse);
    
    // Add assistant response
    if (debugResponse.text) {
      const assistantMessage: TextMessage = {
        role: 'assistant',
        content: debugResponse.text,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }

    // Handle tool call if present
    if (debugResponse.toolCall && debugResponse.toolCall.tool === 'ask_question') {
      console.log('[Chatbot] 🐛 Debug tool call:', debugResponse.toolCall);
      setCurrentQuestionData({
        questionId: debugResponse.toolCall.questionId,
        question: debugResponse.toolCall.question,
        options: debugResponse.toolCall.options,
        topic: debugResponse.toolCall.topic,
      });
      setDialogOpen(true);
    }
  };

  const getAssessmentProgress = (): number => {
    // Calculate progress based on completed questionnaires and messages
    const questionnaireCount = completedQuestionnaires.length;
    const messageCount = messages.filter(m => m.role === 'user').length;
    // Minimum threshold: at least 3 questionnaires started or 20+ messages
    return Math.max(questionnaireCount * 10, Math.min(messageCount * 2, 100));
  };

  const canEndConversation = (): boolean => {
    const progress = getAssessmentProgress();
    return progress >= 30; // At least 30% progress
  };

  const handleEndConversation = async () => {
    if (!canEndConversation()) {
      setShowEndConversationDialog(true);
      return;
    }

    await handleComplete();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">AI Assistant</h3>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-sm hover:bg-gray-100 text-gray-700">
              Cancel
            </Button>
          )}
        </div>
        {/* Questionnaire Progress */}
        <QuestionnaireProgress
          currentQuestionnaire={currentQuestionnaire}
          completedQuestionnaires={completedQuestionnaires}
          suggestedQuestionnaires={suggestedQuestionnaires}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <AnimatePresence>
          {messages.map((message, index) => {
            // Handle regular text messages
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
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
                  className={`max-w-[80%] rounded-xl py-2.5 px-4 shadow-sm transition-all ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl py-1.5 px-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl py-1.5 px-3 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-800 font-medium">Processing your assessment...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {!isComplete && !isLoading && quickReplies.length > 0 && messages.length > 0 && (
        <div className="px-4 pb-2 border-t bg-gradient-to-t from-white to-primary/5">
          <div className="flex gap-2 flex-wrap">
            {quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                className="text-xs h-7"
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      {!isComplete && (
        <div className="p-4 border-t bg-gradient-to-t from-white to-primary/5">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              disabled={isLoading || isProcessing}
              className="flex-1 rounded-xl border-2 focus:border-primary/50"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || isProcessing || !input.trim()}
              size="icon"
              className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {canEndConversation() && (
            <div className="mt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndConversation}
                disabled={isLoading || isProcessing}
                className="text-xs"
              >
                End Conversation
              </Button>
            </div>
          )}
        </div>
      )}

      {isComplete && !isProcessing && (
        <div className="p-4 border-t bg-primary/5">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="text-sm text-gray-900 font-medium text-center">
              Assessment complete! Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Questionnaire Dialog */}
      {currentQuestionData && (
        <QuestionnaireDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          question={currentQuestionData.question}
          options={currentQuestionData.options}
          questionId={currentQuestionData.questionId}
          topic={currentQuestionData.topic}
          onAnswer={handleStructuredAnswer}
          onAskQuestion={handleAskQuestionFromDialog}
          disabled={isLoading || isProcessing}
        />
      )}

      {/* End Conversation Confirmation Dialog */}
      <AlertDialog open={showEndConversationDialog} onOpenChange={setShowEndConversationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't completed enough of the assessment yet. We recommend continuing to get more accurate results. 
              Are you sure you want to end the conversation now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              End Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Debug Panel */}
      <ChatbotDebugPanel onInjectResponse={handleDebugInject} />
    </div>
  );
}

