"use client";

import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Loader2, MessageSquare, Sparkles, Bot, User, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { fadeDown } from "@/lib/animations";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { TOKEN_STORAGE_KEY } from "@/lib/constants/auth";
import { getDemoLoginConfig } from "@/lib/demo-config";
import { QuestionnaireChatBubble } from "@/components/pre-assessment/QuestionnaireChatBubble";
import { AssessmentProgressBar } from "@/components/pre-assessment/AssessmentProgressBar";
import { ChatbotDebugPanel } from "@/components/pre-assessment/ChatbotDebugPanel";
import { AssessmentContextModal } from "@/components/pre-assessment/AssessmentContextModal";
import { SoftSnapshotModal } from "@/components/pre-assessment/SoftSnapshotModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BaseMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface TextMessage extends BaseMessage {
  type?: 'text';
}

interface QuestionnaireMessage extends BaseMessage {
  type: 'questionnaire';
  questionData: {
    questionId: string;
    question: string;
    options: Array<{ value: number; label: string }>;
    topic?: string;
  };
  userAnswer?: number;
  thankYouMessage?: string;
}

type Message = TextMessage | QuestionnaireMessage;

const DEMO_WORK_STRESS_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm here to help assess your mental health needs. This will help us match you with the right therapist. How are you feeling today?",
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "user",
    content: "I've been really stressed lately, mostly from work.",
    timestamp: new Date(),
  },
  {
    id: "3",
    role: "assistant",
    content:
      "I hear you. Work stress can take a real toll. Can you tell me a bit more about what's been going on at work? For example, is it the workload, relationships with colleagues, or something else?",
    timestamp: new Date(),
  },
  {
    id: "4",
    role: "user",
    content:
      "It's the workload mostly. I can't switch off and I feel burned out.",
    timestamp: new Date(),
  },
  {
    id: "5",
    role: "user",
    content:
      "Sleep has been bad. I lie awake thinking about deadlines and then I'm exhausted the next day. My energy is pretty low.",
    timestamp: new Date(),
  },
  {
    id: "6",
    role: "assistant",
    content:
      "That sounds really tough—both the burnout and the sleep. That's a common pattern when stress builds up. How long would you say this has been going on? Weeks, or more like months?",
    timestamp: new Date(),
  },
  {
    id: "8",
    role: "user",
    content: "Probably a few months now. It got worse after we had a big project launch.",
    timestamp: new Date(),
  },
  {
    id: "9",
    role: "assistant",
    content:
      "Thanks for sharing that. So it's been building for a while and the project launch intensified things. Do you have any support at work—someone you can talk to, or flexibility to set boundaries around hours?",
    timestamp: new Date(),
  },
  {
    id: "10",
    role: "user",
    content:
      "Not really. My manager is nice but everyone is stretched. I feel guilty if I log off on time.",
    timestamp: new Date(),
  },
  {
    id: "10b",
    role: "user",
    content: "I've tried setting boundaries but it's hard to stick to them.",
    timestamp: new Date(),
  },
  {
    id: "11",
    role: "assistant",
    content:
      "It makes sense that you'd feel that way when the whole team is under pressure. Guilt can keep us overgiving. Besides work, do you have people or activities that help you recharge—family, friends, hobbies?",
    timestamp: new Date(),
  },
  {
    id: "12",
    role: "user",
    content:
      "I used to go to the gym and see friends on weekends. Lately I've been cancelling a lot because I'm too tired or I'm catching up on work.",
    timestamp: new Date(),
  },
  {
    id: "13",
    role: "assistant",
    content:
      "So the stress has started to crowd out the things that usually help you recharge. That's a big signal. When you do have a bit of time to yourself, how do you feel—relieved, or still on edge?",
    timestamp: new Date(),
  },
  {
    id: "14",
    role: "user",
    content: "Mostly still on edge. I check my phone for messages and can't really relax.",
    timestamp: new Date(),
  },
  {
    id: "15",
    role: "assistant",
    content:
      "That difficulty switching off is something we can work on. Have you ever talked to a therapist or counselor before, or would this be your first time considering it?",
    timestamp: new Date(),
  },
  {
    id: "16",
    role: "user",
    content:
      "I had a few sessions years ago when I was in college. It helped. I've been thinking about trying again but wasn't sure where to start.",
    timestamp: new Date(),
  },
  {
    id: "17",
    role: "assistant",
    content:
      "It's a good step that you're reaching out now. Based on what you've shared—workload, burnout, sleep, and pulling back from support and hobbies—we have a clearer picture. I'll summarize this as a soft snapshot so any therapist you're matched with can pick up from here. Is there anything else you'd want them to know before we move to matching?",
    timestamp: new Date(),
  },
  {
    id: "18",
    role: "user",
    content: "I think that covers it. I'm open to someone who gets work stress and maybe CBT or something practical.",
    timestamp: new Date(),
  },
  {
    id: "19",
    role: "assistant",
    content:
      "Noted—we'll look for a therapist who has experience with work-related stress and can offer practical, structured approaches like CBT. You've shared a lot today; thank you. When you're ready, you can view your snapshot and we'll suggest matches that fit. Anything else on your mind right now?",
    timestamp: new Date(),
  },
  {
    id: "20",
    role: "user",
    content: "No, that's it for now. Thanks for listening.",
    timestamp: new Date(),
  },
];

function PreAssessmentChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useApi();
  const isDemoMode = searchParams.get("demo") === "1";
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [showEndConversationDialog, setShowEndConversationDialog] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [answeredQuestionsCount, setAnsweredQuestionsCount] = useState(0);
  const [assessmentContextOpen, setAssessmentContextOpen] = useState(false);
  const [softSnapshotOpen, setSoftSnapshotOpen] = useState(false);
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const demoLoginConfig = useMemo(() => getDemoLoginConfig(), []);

  useEffect(() => {
    setMounted(true);
    // Start chatbot session on mount
    const startSession = async () => {
      try {
        setIsLoading(true);
        console.log('[Chatbot] Starting session...');
        const result = await api.preAssessment.startChatbotSession();
        console.log('[Chatbot] Session started:', result.sessionId);
        setSessionId(result.sessionId);

        if (isDemoMode) {
          setMessages(DEMO_WORK_STRESS_MESSAGES);
        } else {
          setMessages([
            {
              id: "1",
              role: "assistant",
              content:
                "Hi! I'm here to help assess your mental health needs. This will help us match you with the right therapist. How are you feeling today?",
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('[Chatbot] Failed to start session:', error);
        toast.error('Failed to start chatbot. Please try again.');
        router.push('/pre-assessment');
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      startSession();
    }
  }, [api.preAssessment, router, isDemoMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStructuredAnswer = async (questionId: string, answer: number) => {
    if (!sessionId) return;

    try {
      console.log('[Chatbot] Submitting structured answer:', { questionId, answer });
      await api.preAssessment.submitStructuredAnswer(sessionId, questionId, answer);
      
      // Update the message to show the answer was recorded with thank you message
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.type === 'questionnaire' && msg.questionData.questionId === questionId) {
            return { 
              ...msg, 
              userAnswer: answer,
              thankYouMessage: 'Thank you for your answer!'
            };
          }
          return msg;
        })
      );
      
      // Update answered questions count
      setAnsweredQuestionsCount((prev) => prev + 1);
      
      console.log('[Chatbot] Structured answer submitted successfully');
      
      // Auto-continue: Trigger next AI response automatically
      // Send a message to trigger the AI to continue (the backend prompt instructs AI to auto-continue)
      // Note: We don't add this message to the UI - it's just to trigger the AI response
      setTimeout(async () => {
        try {
          setIsLoading(true);
          // Send a message that indicates the answer was submitted, prompting AI to continue
          // This message won't be shown in the UI - we'll only show the AI's response
          const response = await api.preAssessment.sendChatbotMessage(sessionId, 'Answer submitted');
          
          // Parse tool call from response if not already extracted by backend
          let toolCall = response.toolCall;
          let cleanResponseText = response.response || '';
          
          // Fallback: Extract tool call from response text if backend didn't parse it
          // Use the same robust parsing logic as in handleSend
          if (!toolCall && cleanResponseText) {
            const toolCallPatterns = [
              /TOOL_CALL:\s*(\{[\s\S]*?\})\s*(?:\n|$)/,
              /TOOL_CALL:\s*(\{[^}]*\{[^}]*\}[^}]*\})/,
              /TOOL_CALL:\s*(\{[^}]*\})/,
            ];
            
            let match: RegExpMatchArray | null = null;
            let matchedPattern: RegExp | null = null;
            
            for (const pattern of toolCallPatterns) {
              const testMatch = cleanResponseText.match(pattern);
              if (testMatch) {
                match = testMatch;
                matchedPattern = pattern;
                break;
              }
            }
            
            if (match && match[1]) {
              try {
                let jsonString = match[1];
                
                // Try to find complete JSON by balancing braces
                if (!jsonString.endsWith('}')) {
                  const startIndex = cleanResponseText.indexOf('TOOL_CALL:');
                  if (startIndex !== -1) {
                    const afterPrefix = cleanResponseText.substring(startIndex + 'TOOL_CALL:'.length).trim();
                    let braceCount = 0;
                    let jsonEnd = 0;
                    
                    for (let i = 0; i < afterPrefix.length; i++) {
                      if (afterPrefix[i] === '{') braceCount++;
                      if (afterPrefix[i] === '}') braceCount--;
                      if (braceCount === 0 && i > 0) {
                        jsonEnd = i + 1;
                        break;
                      }
                    }
                    
                    if (jsonEnd > 0) {
                      jsonString = afterPrefix.substring(0, jsonEnd);
                    }
                  }
                }
                
                const parsed = JSON.parse(jsonString);
                
                const isValidToolCall = 
                  parsed.tool === 'ask_question' &&
                  typeof parsed.questionId === 'string' &&
                  parsed.questionId.length > 0 &&
                  typeof parsed.question === 'string' &&
                  parsed.question.length > 0 &&
                  Array.isArray(parsed.options) &&
                  parsed.options.length > 0 &&
                  parsed.options.every((opt: any) => 
                    typeof opt === 'object' &&
                    typeof opt.value === 'number' &&
                    typeof opt.label === 'string'
                  );
                
                if (isValidToolCall) {
                  toolCall = {
                    tool: parsed.tool,
                    questionId: parsed.questionId,
                    topic: parsed.topic || undefined,
                    question: parsed.question,
                    options: parsed.options,
                  };
                  
                  if (matchedPattern) {
                    cleanResponseText = cleanResponseText.replace(matchedPattern, '').trim();
                  }
                }
              } catch (error) {
                console.error('[Chatbot] Failed to parse tool call in auto-continue:', error);
              }
            }
          } else if (toolCall) {
            // Validate backend tool call structure
            if (!toolCall.questionId || !toolCall.question || !Array.isArray(toolCall.options) || toolCall.options.length === 0) {
              console.error('[Chatbot] ⚠️ Invalid tool call structure from backend in auto-continue:', toolCall);
              toolCall = undefined;
            }
          }

          // Add assistant response to UI (conversational text, cleaned of tool calls)
          // Only add if there's actual content (not just empty acknowledgment)
          if (cleanResponseText && cleanResponseText.trim() && cleanResponseText.length > 10) {
            try {
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: cleanResponseText,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
            } catch (error) {
              console.error('[Chatbot] Failed to add assistant message in auto-continue:', error);
            }
          }

          // Handle tool call - add as questionnaire message bubble
          if (toolCall && toolCall.tool === 'ask_question') {
            try {
              // Validate tool call before adding
              if (
                toolCall.questionId &&
                toolCall.question &&
                Array.isArray(toolCall.options) &&
                toolCall.options.length > 0 &&
                toolCall.options.every(opt => typeof opt.value === 'number' && typeof opt.label === 'string')
              ) {
                const questionnaireMessage: QuestionnaireMessage = {
                  id: (Date.now() + 2).toString(),
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  type: 'questionnaire',
                  questionData: {
                    questionId: toolCall.questionId,
                    question: toolCall.question,
                    options: toolCall.options,
                    topic: toolCall.topic,
                  },
                };
                setMessages((prev) => [...prev, questionnaireMessage]);
              } else {
                console.error('[Chatbot] ⚠️ Invalid tool call in auto-continue, skipping:', toolCall);
              }
            } catch (error) {
              console.error('[Chatbot] Failed to add questionnaire message in auto-continue:', error);
            }
          }

          // Update quick replies
          updateQuickReplies(cleanResponseText);

          // Check if assessment is complete
          if (response.isComplete) {
            setAssessmentComplete(true);
            handleComplete();
          }
        } catch (error: any) {
          const errorType = error.code || error.details?.code || 'UNKNOWN';
          const isTimeout = errorType === 'TIMEOUT' || errorType === 'TIMEOUT_ERROR' || error.code === 'ECONNABORTED';
          
          console.error('[Chatbot] Failed to auto-continue:', {
            errorType,
            isTimeout,
            message: error.message || (error instanceof Error ? error.message : String(error)),
            status: error.status,
            code: error.code,
            details: error.details,
          });
          
          // Only show error for timeouts (network errors might be transient)
          if (isTimeout) {
            console.warn('[Chatbot] Auto-continue timed out - user can continue manually');
          }
          // Don't show error toast for auto-continue failures - user can continue manually
        } finally {
          setIsLoading(false);
        }
      }, 800); // Delay to show thank you message first, then continue
      
    } catch (error) {
      console.error('[Chatbot] Failed to submit structured answer:', error);
      toast.error('Failed to submit answer. Please try again.');
    }
  };

  const handleAskQuestionFromDialog = async (question: string) => {
    if (!sessionId || !question.trim()) return;

    // Add user question to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to chatbot
    try {
      setIsLoading(true);
      const response = await api.preAssessment.sendChatbotMessage(sessionId, question);
      
      if (response.response && response.response.trim()) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      if (response.isComplete) {
        setAssessmentComplete(true);
        handleComplete();
      }
    } catch (error) {
      console.error('[Chatbot] Failed to send question:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
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
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const getAssessmentProgress = (): number => {
    // Calculate progress based on answered questions
    // Rough estimate: ~15-20 questions per assessment, so each question is ~5-7%
    const questionProgress = answeredQuestionsCount * 6; // ~6% per question
    
    // Also factor in conversation length (user messages indicate engagement)
    const messageCount = messages.filter(m => m.role === 'user').length;
    const conversationProgress = Math.min(messageCount * 2, 30); // Max 30% from conversation
    
    // Combine both metrics
    const totalProgress = Math.min(questionProgress + conversationProgress, 100);
    return totalProgress;
  };

  const canEndConversation = (): boolean => {
    const progress = getAssessmentProgress();
    return progress >= 30;
  };

  const handleEndConversation = async () => {
    if (!canEndConversation()) {
      setShowEndConversationDialog(true);
      return;
    }
    await handleComplete();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || assessmentComplete || !sessionId) return;

    const userMessageText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log('[Chatbot] Sending message:', { sessionId, message: userMessageText.substring(0, 50) + '...' });
      const response = await api.preAssessment.sendChatbotMessage(sessionId, userMessageText);
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
      // Use a more robust regex that can match TOOL_CALL anywhere in the text
      if (!toolCall && cleanResponseText) {
        // Try multiple regex patterns to catch different formats
        const toolCallPatterns = [
          /TOOL_CALL:\s*(\{[\s\S]*?\})\s*(?:\n|$)/,  // Original pattern
          /TOOL_CALL:\s*(\{[^}]*\{[^}]*\}[^}]*\})/,  // Nested braces
          /TOOL_CALL:\s*(\{[^}]*\})/,  // Simple pattern
        ];
        
        let match: RegExpMatchArray | null = null;
        let matchedPattern: RegExp | null = null;
        
        for (const pattern of toolCallPatterns) {
          const testMatch = cleanResponseText.match(pattern);
          if (testMatch) {
            match = testMatch;
            matchedPattern = pattern;
            break;
          }
        }
        
        console.log('[Chatbot] Attempting to extract tool call from text:', {
          foundMatch: !!match,
          matchPreview: match ? match[0].substring(0, 200) : 'none',
          patternUsed: matchedPattern?.toString(),
        });
        
        if (match && match[1]) {
          try {
            let jsonString = match[1];
            
            // Try to find the complete JSON object by balancing braces
            // This handles cases where the regex might have cut off early
            if (!jsonString.endsWith('}')) {
              const startIndex = cleanResponseText.indexOf('TOOL_CALL:');
              if (startIndex !== -1) {
                const afterPrefix = cleanResponseText.substring(startIndex + 'TOOL_CALL:'.length).trim();
                let braceCount = 0;
                let jsonEnd = 0;
                
                for (let i = 0; i < afterPrefix.length; i++) {
                  if (afterPrefix[i] === '{') braceCount++;
                  if (afterPrefix[i] === '}') braceCount--;
                  if (braceCount === 0 && i > 0) {
                    jsonEnd = i + 1;
                    break;
                  }
                }
                
                if (jsonEnd > 0) {
                  jsonString = afterPrefix.substring(0, jsonEnd);
                }
              }
            }
            
            console.log('[Chatbot] Parsing tool call JSON (length:', jsonString.length, '):', jsonString.substring(0, 200));
            const parsed = JSON.parse(jsonString);
            
            // Validate tool call structure more thoroughly
            const isValidToolCall = 
              parsed.tool === 'ask_question' &&
              typeof parsed.questionId === 'string' &&
              parsed.questionId.length > 0 &&
              typeof parsed.question === 'string' &&
              parsed.question.length > 0 &&
              Array.isArray(parsed.options) &&
              parsed.options.length > 0 &&
              parsed.options.every((opt: any) => 
                typeof opt === 'object' &&
                typeof opt.value === 'number' &&
                typeof opt.label === 'string'
              );
            
            if (isValidToolCall) {
              toolCall = {
                tool: parsed.tool,
                questionId: parsed.questionId,
                topic: parsed.topic || undefined,
                question: parsed.question,
                options: parsed.options,
              };
              
              console.log('[Chatbot] ✅ Successfully extracted tool call:', toolCall);
              
              // Remove tool call from response text using the matched pattern
              if (matchedPattern) {
                cleanResponseText = cleanResponseText.replace(matchedPattern, '').trim();
              }
            } else {
              console.warn('[Chatbot] Tool call validation failed:', {
                hasTool: parsed.tool === 'ask_question',
                hasQuestionId: !!parsed.questionId,
                hasQuestion: !!parsed.question,
                hasValidOptions: Array.isArray(parsed.options) && parsed.options.length > 0,
                parsed,
              });
            }
          } catch (error) {
            console.error('[Chatbot] Failed to parse tool call from response text:', error);
            console.error('[Chatbot] Error details:', {
              message: error instanceof Error ? error.message : String(error),
              jsonString: match ? match[1].substring(0, 200) : 'no match',
            });
            // Don't break the flow - continue without tool call
          }
        }
      } else if (toolCall) {
        console.log('[Chatbot] ✅ Tool call received from backend:', toolCall);
        
        // Validate backend tool call structure
        if (!toolCall.questionId || !toolCall.question || !Array.isArray(toolCall.options) || toolCall.options.length === 0) {
          console.error('[Chatbot] ⚠️ Invalid tool call structure from backend:', toolCall);
          toolCall = undefined; // Clear invalid tool call
        }
      }

      // Add assistant response to UI (conversational text, cleaned of tool calls)
      // Only add if there's actual content (not just empty after cleaning)
      if (cleanResponseText && cleanResponseText.trim() && cleanResponseText.length > 0) {
        try {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: cleanResponseText,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
          console.error('[Chatbot] Failed to add assistant message:', error);
        }
      }

      // Handle tool call - add as questionnaire message bubble
      if (toolCall && toolCall.tool === 'ask_question') {
        try {
          // Validate tool call one more time before adding to UI
          if (
            toolCall.questionId &&
            toolCall.question &&
            Array.isArray(toolCall.options) &&
            toolCall.options.length > 0 &&
            toolCall.options.every(opt => typeof opt.value === 'number' && typeof opt.label === 'string')
          ) {
            console.log('[Chatbot] 🎯 Adding questionnaire bubble:', toolCall);
            const questionnaireMessage: QuestionnaireMessage = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: '', // Empty content since we'll render the questionnaire
              timestamp: new Date(),
              type: 'questionnaire',
              questionData: {
                questionId: toolCall.questionId,
                question: toolCall.question,
                options: toolCall.options,
                topic: toolCall.topic,
              },
            };
            setMessages((prev) => [...prev, questionnaireMessage]);
          } else {
            console.error('[Chatbot] ⚠️ Invalid tool call structure, skipping questionnaire:', toolCall);
          }
        } catch (error) {
          console.error('[Chatbot] Failed to add questionnaire message:', error);
          console.error('[Chatbot] Tool call that failed:', toolCall);
        }
      } else {
        console.log('[Chatbot] No tool call to display');
      }

      // Update quick replies
      updateQuickReplies(cleanResponseText);

      // Check if assessment is complete
      if (response.isComplete) {
        setAssessmentComplete(true);
        handleComplete();
      }
    } catch (error: any) {
      console.error('[Chatbot] Error sending message:', error);
      
      // Extract detailed error information
      const errorType = error.code || error.details?.code || 'UNKNOWN';
      const isTimeout = errorType === 'TIMEOUT' || errorType === 'TIMEOUT_ERROR' || error.code === 'ECONNABORTED';
      const isNetworkError = errorType === 'NETWORK_ERROR' || error.status === 0;
      
      console.error('[Chatbot] Error details:', {
        errorType,
        isTimeout,
        isNetworkError,
        message: error.message || (error instanceof Error ? error.message : String(error)),
        status: error.status,
        code: error.code,
        details: error.details,
        originalError: error.originalError,
      });
      
      // Show user-friendly error message
      let userMessage: string;
      if (isTimeout) {
        userMessage = "The AI is taking longer than expected to respond. This can happen with complex requests. Please try again in a moment.";
        toast.error("Request timeout - The AI response is taking too long. Please try again.");
      } else if (isNetworkError) {
        userMessage = "I'm having trouble connecting to the server. Please check your internet connection and make sure the backend is running.";
        toast.error("Network error - Unable to connect to server. Please check your connection.");
      } else {
        userMessage = "I apologize, but I encountered an error processing your message. Please try again.";
        toast.error("Failed to send message. Please try again.");
      }
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: userMessage,
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
      setAssessmentComplete(true);
      const results = await api.preAssessment.completeChatbotSession(sessionId);
      
      // Show processing state
      const processingMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: 'Processing your assessment results...',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, processingMessage]);
      
      // Wait a bit for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('[Chatbot] Session completed with results:', results);
      
      // Store pre-assessment results in localStorage for registration
      // Include the converted answers array so registration can use it
      localStorage.setItem('preassessment_chatbot_results', JSON.stringify({
        sessionId,
        scores: results.scores,
        severityLevels: results.severityLevels,
        answers: results.answers, // Converted answers array (201 items)
        method: 'chatbot',
        timestamp: Date.now()
      }));
      
      // Redirect to sign-up page
      router.push("/auth/sign-up?method=chat&sessionId=" + sessionId);
    } catch (error) {
      console.error('[Chatbot] Failed to complete session:', error);
      toast.error('Failed to complete assessment. Please try again.');
      setIsProcessing(false);
      setAssessmentComplete(false);
    } finally {
      setIsProcessing(false);
    }
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
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: debugResponse.text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }

    // Handle tool call if present
    if (debugResponse.toolCall && debugResponse.toolCall.tool === 'ask_question') {
      console.log('[Chatbot] 🐛 Debug tool call:', debugResponse.toolCall);
      const questionnaireMessage: QuestionnaireMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        type: 'questionnaire',
        questionData: {
          questionId: debugResponse.toolCall.questionId,
          question: debugResponse.toolCall.question,
          options: debugResponse.toolCall.options,
          topic: debugResponse.toolCall.topic,
        },
      };
      setMessages((prev) => [...prev, questionnaireMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDemoSubmit = async () => {
    if (!demoLoginConfig.enabled) return;
    setDemoLoginLoading(true);
    try {
      const response = await api.auth.login({
        email: demoLoginConfig.email,
        password: demoLoginConfig.password,
      });
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      // Always show welcome (Your Matches) after demo login, not the dashboard
      const welcomeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/client/welcome?demo=1`;
      window.location.replace(welcomeUrl);
      return;
    } catch {
      toast.error("Demo login failed. Check credentials or try again.");
    } finally {
      setDemoLoginLoading(false);
    }
  };

  // Don't render anything during SSR
  if (typeof window === 'undefined' || !mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-b from-tertiary/50 via-tertiary/20 to-transparent w-full min-h-screen flex flex-col">
      <motion.nav
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-50 flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200/80 bg-white/95 backdrop-blur-md shadow-sm"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/pre-assessment")}
            className="rounded-full w-9 h-9 hover:bg-primary/10 hover:text-primary transition-all active:scale-95 flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap truncate">AI Assessment</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Logo />
        </div>
      </motion.nav>

      {/* Progress Bar - sticky below nav with padding so label is not cut off */}
      <AssessmentProgressBar
        progress={getAssessmentProgress()}
        answeredQuestions={answeredQuestionsCount}
      />

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 min-h-0">
        {/* Messages - same sender grouped (tight), new sender has more gap */}
        <div className="flex-1 overflow-y-auto pb-4 scroll-smooth px-1">
          <AnimatePresence>
            {messages.map((message, index) => {
              const prevRole = index > 0 ? (messages[index - 1].type === 'questionnaire' ? 'assistant' : messages[index - 1].role) : null;
              const currentRole = message.type === 'questionnaire' ? 'assistant' : message.role;
              const isSameSender = prevRole === currentRole;
              const spacingClass = index === 0 ? 'mt-0' : isSameSender ? 'mt-1.5' : 'mt-4';

              // Handle questionnaire messages
              if (message.type === 'questionnaire') {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`flex gap-3 justify-start ${spacingClass}`}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[90%] sm:max-w-[80%] md:max-w-[75%]">
                      <QuestionnaireChatBubble
                        question={message.questionData.question}
                        options={message.questionData.options}
                        questionId={message.questionData.questionId}
                        topic={message.questionData.topic}
                        onAnswer={handleStructuredAnswer}
                        onAskQuestion={handleAskQuestionFromDialog}
                        disabled={isLoading || isProcessing}
                        initialAnswer={message.userAnswer}
                        thankYouMessage={message.thankYouMessage}
                      />
                    </div>
                  </motion.div>
                );
              }

              // Handle regular text messages
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} ${spacingClass}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] rounded-2xl overflow-hidden transition-all hover:shadow-md py-2 px-3 sm:px-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20"
                        : "bg-white border border-gray-200/90 shadow-sm hover:border-gray-300"
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                      message.role === "user" ? "text-primary-foreground" : "text-gray-900"
                    }`}>{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 justify-start mt-4"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-white border border-gray-200/90 shadow-sm rounded-2xl py-2 px-3 sm:px-4">
                <div className="flex items-center gap-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-gray-600 font-medium">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 justify-start mt-4"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center ring-2 ring-green-200">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm rounded-2xl py-2 px-3 sm:px-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-800 font-medium">Processing your assessment...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {!assessmentComplete && !isLoading && quickReplies.length > 0 && messages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 flex-wrap px-2"
          >
            {quickReplies.map((reply, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs h-8 hover:bg-primary/10 hover:border-primary/40 transition-all"
                >
                  {reply}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View My Snapshot + Assessment Context - at bottom beside input */}
        {!assessmentComplete && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 px-1 flex-shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => setSoftSnapshotOpen(true)}
            >
              View My Snapshot
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 hover:bg-gray-50 text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => setAssessmentContextOpen(true)}
              aria-label="Assessment Context"
            >
              <Info className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Assessment Context</span>
            </Button>
            {isDemoMode && demoLoginConfig.enabled && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={handleDemoSubmit}
                disabled={demoLoginLoading}
              >
                {demoLoginLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </div>
        )}

        {/* Input Area - plain div to avoid ShadCN Card default padding */}
        {!assessmentComplete ? (
          <div className="border border-gray-200/80 rounded-xl shadow-lg bg-white/95 backdrop-blur-sm sticky bottom-0 z-40 py-3 sm:py-3.5 px-3 sm:px-4">
            <div className="flex gap-2 sm:gap-2.5">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading || isProcessing}
                className="flex-1 h-10 sm:h-11 rounded-xl border-2 focus:border-primary/50 transition-colors text-sm"
                aria-label="Type your message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isProcessing}
                className="px-4 sm:px-6 h-10 sm:h-11 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex-shrink-0"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {canEndConversation() && (
              <div className="mt-2.5 sm:mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEndConversation}
                  disabled={isLoading || isProcessing}
                  className="text-xs h-7 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                >
                  End Conversation
                </Button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="border border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg py-5 px-4 sm:px-6 text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Assessment Complete!</h3>
            </div>
            <p className="text-sm text-gray-700">
              Based on our conversation, we're ready to match you with a therapist.
            </p>
            <Button 
              onClick={() => router.push(`/auth/sign-up?method=chat&sessionId=${sessionId || ''}`)} 
              className="w-full h-11 rounded-xl shadow-md hover:shadow-lg transition-all" 
              size="lg"
            >
              Continue to Sign Up
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
            {isDemoMode && demoLoginConfig.enabled && (
              <Button
                variant="outline"
                onClick={handleDemoSubmit}
                disabled={demoLoginLoading}
                className="w-full h-11 rounded-xl border-primary/30"
                size="lg"
              >
                {demoLoginLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </motion.div>
        )}
      </div>

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

      {/* Assessment Context & Soft Snapshot modals - pitch demo */}
      <AssessmentContextModal
        open={assessmentContextOpen}
        onOpenChange={setAssessmentContextOpen}
        useDemoContent={true}
      />
      <SoftSnapshotModal
        open={softSnapshotOpen}
        onOpenChange={setSoftSnapshotOpen}
        useDemoContent={true}
      />

      {/* Debug Panel */}
      <ChatbotDebugPanel onInjectResponse={handleDebugInject} />
    </div>
  );
}

export default function PreAssessmentChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PreAssessmentChatPageContent />
    </Suspense>
  );
}
