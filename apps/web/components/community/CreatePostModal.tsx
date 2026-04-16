"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileAttachment, AttachedFile } from "@/components/attachments/FileAttachment";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName?: string;
  communityName?: string;
}

interface PostFormData {
  title: string;
  content: string;
  roomId: string;
  files?: File[];
}

export function CreatePostModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  communityName,
}: CreatePostModalProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const createPostMutation = useMutation({
    mutationFn: (postData: PostFormData) => api.communities.createPost(postData),
    onSuccess: () => {
      toast.success("Post created successfully!");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["rooms", roomId, "posts"] });
      handleClose();
    },
    onError: (error: any) => {
      console.error("Failed to create post:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create post. Please try again."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a post title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter post content");
      return;
    }

    // Extract uploaded files from attachedFiles
    const uploadedFiles = attachedFiles
      .filter(file => file.file && file.isUploaded)
      .map(file => file.file!)
      .filter(Boolean);

    const postData: PostFormData = {
      title: title.trim(),
      content: content.trim(),
      roomId,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };

    createPostMutation.mutate(postData);
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setAttachedFiles([]);
    onClose();
  };

  const isFormValid = title.trim() && content.trim();
  const isSubmitting = createPostMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Create New Post
            </h2>
            {(communityName || roomName) && (
              <p className="text-sm text-gray-500 mt-1">
                {communityName && roomName
                  ? `in ${communityName} → ${roomName}`
                  : communityName || roomName}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Post Title */}
            <div>
              <Label htmlFor="post-title" className="text-sm font-medium text-gray-700 mb-1">
                Post Title *
              </Label>
              <Input
                id="post-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title for your post..."
                className="w-full"
                disabled={isSubmitting}
                maxLength={200}
              />
              {title.length > 180 && (
                <p className="text-xs text-gray-500 mt-1">
                  {200 - title.length} characters remaining
                </p>
              )}
            </div>

            {/* Post Content */}
            <div>
              <Label htmlFor="post-content" className="text-sm font-medium text-gray-700 mb-1">
                Post Content *
              </Label>
              <Textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                rows={6}
                className="w-full resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Be respectful and follow community guidelines
              </p>
            </div>

            {/* File Attachments */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Attachments
              </Label>
              <FileAttachment
                attachedFiles={attachedFiles}
                onFilesChange={setAttachedFiles}
                maxFiles={5}
                maxFileSize={10}
                uploadType="message"
                disabled={isSubmitting}
                showPreview={true}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can attach images, documents, and other files to your post
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 sm:space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="order-1 sm:order-2 bg-[#436B00] hover:bg-[#129316] focus:ring-[#436B00]"
            >
              {isSubmitting ? "Creating Post..." : "Create Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;