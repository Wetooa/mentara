'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bug, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatbotDebugPanelProps {
  onInjectResponse: (response: {
    text: string;
    toolCall?: {
      tool: string;
      questionId: string;
      topic?: string;
      question: string;
      options: Array<{ value: number; label: string }>;
    };
  }) => void;
}

export function ChatbotDebugPanel({ onInjectResponse }: ChatbotDebugPanelProps) {
  const [open, setOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [hasToolCall, setHasToolCall] = useState(false);
  const [toolCallData, setToolCallData] = useState({
    questionId: 'debug_q1',
    topic: 'Debug',
    question: 'This is a debug question?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
      { value: 4, label: 'Every day' },
    ],
  });

  const handleInject = () => {
    onInjectResponse({
      text: responseText || 'Debug response from manual injection',
      toolCall: hasToolCall
        ? {
            tool: 'ask_question',
            questionId: toolCallData.questionId,
            topic: toolCallData.topic,
            question: toolCallData.question,
            options: toolCallData.options,
          }
        : undefined,
    });
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chatbot Debug Panel</DialogTitle>
            <DialogDescription>
              Manually inject responses and tool calls for testing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode">Debug Mode</Label>
              <Switch
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={setDebugMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="response-text">Response Text</Label>
              <Textarea
                id="response-text"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Enter the AI response text here..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has-tool-call"
                checked={hasToolCall}
                onCheckedChange={setHasToolCall}
              />
              <Label htmlFor="has-tool-call">Include Tool Call</Label>
            </div>

            {hasToolCall && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="question-id">Question ID</Label>
                  <Input
                    id="question-id"
                    value={toolCallData.questionId}
                    onChange={(e) =>
                      setToolCallData({ ...toolCallData, questionId: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={toolCallData.topic}
                    onChange={(e) =>
                      setToolCallData({ ...toolCallData, topic: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={toolCallData.question}
                    onChange={(e) =>
                      setToolCallData({ ...toolCallData, question: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options (JSON format)</Label>
                  <Textarea
                    value={JSON.stringify(toolCallData.options, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        if (Array.isArray(parsed)) {
                          setToolCallData({ ...toolCallData, options: parsed });
                        }
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInject}>Inject Response</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


