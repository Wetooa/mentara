"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Image,
  FileText,
  X,
  Download,
  Eye,
  AlertCircle,
  Paperclip,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export interface AttachedFile {
  id?: string;
  file?: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  isUploaded?: boolean;
  uploadError?: string;
}

interface FileAttachmentProps {
  attachedFiles: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  uploadType?: "message" | "worksheet" | "report_evidence" | "profile_picture";
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  compact?: boolean;
}

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

const FILE_TYPE_ICONS = {
  "image/": Image,
  "application/pdf": FileText,
  "text/": FileText,
  "application/msword": FileText,
  "application/vnd.openxmlformats": FileText,
  "application/vnd.ms-excel": FileText,
  default: File,
};

const getFileIcon = (type: string) => {
  for (const [prefix, Icon] of Object.entries(FILE_TYPE_ICONS)) {
    if (type.startsWith(prefix)) {
      return Icon;
    }
  }
  return FILE_TYPE_ICONS.default;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function FileAttachment({
  attachedFiles,
  onFilesChange,
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  uploadType = "message",
  disabled = false,
  className,
  showPreview = true,
  compact = false,
}: FileAttachmentProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const api = useApi();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileIndex }: { file: File; fileIndex: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      // Update progress during upload
      const updateProgress = (progress: number) => {
        onFilesChange(
          attachedFiles.map((f, i) =>
            i === fileIndex ? { ...f, uploadProgress: progress } : f
          )
        );
      };

      // Simulate progress updates (replace with real progress if API supports it)
      const progressInterval = setInterval(() => {
        const currentFile = attachedFiles[fileIndex];
        if (currentFile && currentFile.uploadProgress !== undefined && currentFile.uploadProgress < 90) {
          updateProgress(currentFile.uploadProgress + 10);
        }
      }, 200);

      try {
        const response = await api.files.upload(formData);
        clearInterval(progressInterval);
        return response;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (response, { fileIndex }) => {
      onFilesChange(
        attachedFiles.map((f, i) =>
          i === fileIndex
            ? {
                ...f,
                id: response.id,
                url: response.url,
                uploadProgress: 100,
                isUploaded: true,
                uploadError: undefined,
              }
            : f
        )
      );
      toast.success("File uploaded successfully");
    },
    onError: (error, { fileIndex }) => {
      onFilesChange(
        attachedFiles.map((f, i) =>
          i === fileIndex
            ? {
                ...f,
                uploadError: "Upload failed",
                uploadProgress: undefined,
              }
            : f
        )
      );
      toast.error("Failed to upload file");
    },
  });

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File type "${file.type}" is not supported`;
    }

    return null;
  };

  const handleFileSelect = (files: File[]) => {
    if (attachedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: AttachedFile[] = [];
    
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      const attachedFile: AttachedFile = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        isUploaded: false,
      };

      validFiles.push(attachedFile);
    }

    if (validFiles.length > 0) {
      const newFiles = [...attachedFiles, ...validFiles];
      onFilesChange(newFiles);

      // Start uploading each file
      validFiles.forEach((_, index) => {
        const fileIndex = attachedFiles.length + index;
        uploadMutation.mutate({
          file: validFiles[index].file!,
          fileIndex,
        });
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
      // Reset input value
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const retryUpload = (index: number) => {
    const file = attachedFiles[index];
    if (file.file) {
      onFilesChange(
        attachedFiles.map((f, i) =>
          i === index ? { ...f, uploadError: undefined, uploadProgress: 0 } : f
        )
      );
      uploadMutation.mutate({ file: file.file, fileIndex: index });
    }
  };

  const openFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileSelect}
          disabled={disabled || attachedFiles.length >= maxFiles}
          className="w-full"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Attach Files ({attachedFiles.length}/{maxFiles})
        </Button>

        {attachedFiles.length > 0 && (
          <div className="space-y-1">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded text-sm"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {React.createElement(getFileIcon(file.type), { className: "h-4 w-4 flex-shrink-0" })}
                  <span className="truncate">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(file.size)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  {file.uploadProgress !== undefined && !file.isUploaded && !file.uploadError && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {file.isUploaded && <Check className="h-4 w-4 text-green-500" />}
                  {file.uploadError && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{file.uploadError}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(",")}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver && !disabled ? "border-primary bg-primary/5" : "border-border",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={disabled ? undefined : openFileSelect}
      >
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {disabled ? "File upload disabled" : "Drop files here or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum {maxFiles} files, {maxFileSize}MB each
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: Images, PDFs, Documents
          </p>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {attachedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              const isImage = file.type.startsWith("image/");
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {showPreview && isImage && file.url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.url}
                          alt={file.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      </>
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <FileIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                    
                    {/* Upload Progress */}
                    {file.uploadProgress !== undefined && !file.isUploaded && !file.uploadError && (
                      <div className="mt-2">
                        <Progress value={file.uploadProgress} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading... {file.uploadProgress}%
                        </p>
                      </div>
                    )}
                    
                    {/* Upload Status */}
                    {file.isUploaded && (
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">Uploaded</span>
                      </div>
                    )}
                    
                    {file.uploadError && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600">{file.uploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {file.url && (
                      <>
                        {showPreview && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(file.url, "_blank")}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Preview</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = file.url!;
                                  link.download = file.name;
                                  link.click();
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                    
                    {file.uploadError && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => retryUpload(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}