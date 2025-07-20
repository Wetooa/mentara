"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Smile, AtSign, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileAttachment, AttachedFile } from "@/components/attachments/FileAttachment";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: string[]) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  allowAttachments?: boolean;
  allowEmojis?: boolean;
  allowMentions?: boolean;
  allowThreading?: boolean;
  className?: string;
  compact?: boolean;
  threadId?: string;
  replyingTo?: {
    id: string;
    content: string;
    author: string;
  };
  onCancelReply?: () => void;
}

export function MessageInput({
  onSendMessage,
  placeholder = "Type your message...",
  disabled = false,
  maxLength = 2000,
  allowAttachments = true,
  allowEmojis = true,
  allowMentions = true,
  allowThreading = false,
  className,
  compact = false,
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = compact ? 100 : 200;
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
    }
  }, [compact]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!message.trim() && attachedFiles.filter(f => f.isUploaded).length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    if (message.length > maxLength) {
      toast.error(`Message is too long. Maximum ${maxLength} characters allowed.`);
      return;
    }

    setIsSending(true);
    try {
      const uploadedAttachments = attachedFiles
        .filter(f => f.isUploaded && f.id)
        .map(f => f.id!);

      await onSendMessage(message.trim(), uploadedAttachments.length > 0 ? uploadedAttachments : undefined);
      
      // Clear form after successful send
      setMessage("");
      setAttachedFiles([]);
      setShowAttachments(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentToggle = () => {
    setShowAttachments(!showAttachments);
  };

  const hasContent = message.trim().length > 0 || attachedFiles.some(f => f.isUploaded);
  const hasUploading = attachedFiles.some(f => f.uploadProgress !== undefined && !f.isUploaded);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Reply Context */}
      {replyingTo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between p-3 bg-muted rounded-lg border-l-4 border-primary"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Replying to {replyingTo.author}</p>
            <p className="text-sm text-muted-foreground truncate">
              {replyingTo.content}
            </p>
          </div>
          {onCancelReply && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="ml-2"
            >
              Cancel
            </Button>
          )}
        </motion.div>
      )}

      {/* File Attachments */}
      {showAttachments && allowAttachments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <FileAttachment
            attachedFiles={attachedFiles}
            onFilesChange={setAttachedFiles}
            maxFiles={5}
            maxFileSize={10}
            uploadType="message"
            disabled={disabled}
            compact={compact}
            className="border rounded-lg p-4 bg-card"
          />
        </motion.div>
      )}

      {/* Message Input Area */}
      <div className="relative">
        <div className={cn(
          "flex items-end gap-2 p-2 border rounded-lg bg-background",
          compact ? "min-h-[50px]" : "min-h-[60px]",
          disabled && "opacity-50"
        )}>
          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              maxLength={maxLength}
              className={cn(
                "min-h-[40px] max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 p-0",
                compact && "text-sm"
              )}
              rows={1}
            />
            
            {/* Character Count */}
            {message.length > maxLength * 0.8 && (
              <div className="text-xs text-right mt-1">
                <span className={cn(
                  "text-muted-foreground",
                  message.length > maxLength && "text-destructive"
                )}>
                  {message.length}/{maxLength}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Attachment Button */}
            {allowAttachments && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAttachmentToggle}
                disabled={disabled}
                className={cn(
                  "h-8 w-8 p-0",
                  showAttachments && "bg-primary/10 text-primary"
                )}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            )}

            {/* Emoji Picker Button */}
            {allowEmojis && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Emoji picker coming soon...
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Mentions Button */}
            {allowMentions && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="h-8 w-8 p-0"
                onClick={() => setMessage(prev => prev + "@")}
              >
                <AtSign className="h-4 w-4" />
              </Button>
            )}

            {/* Threading Button */}
            {allowThreading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                <Hash className="h-4 w-4" />
              </Button>
            )}

            {/* Send Button */}
            <Button
              type="button"
              onClick={handleSend}
              disabled={disabled || isSending || !hasContent || hasUploading}
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                hasContent && !hasUploading && !disabled && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {hasUploading && (
        <div className="text-xs text-muted-foreground text-center">
          Uploading files...
        </div>
      )}
    </div>
  );
}