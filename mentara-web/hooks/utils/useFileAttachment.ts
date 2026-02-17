import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/utils/common';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string;
}

interface UseFileAttachmentReturn {
  // State
  attachedFiles: AttachedFile[];
  isDragOver: boolean;
  
  // Actions
  handleFileSelect: (files: FileList | null) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  removeFile: (fileId: string) => void;
  uploadFiles: () => Promise<AttachedFile[]>;
  clearFiles: () => void;
  
  // State setters
  setAttachedFiles: (files: AttachedFile[]) => void;
  
  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // Upload state
  isUploading: boolean;
  
  // Utilities
  formatFileSize: (bytes: number) => string;
  getFileIcon: (type: string) => any;
  validateFile: (file: File) => { valid: boolean; error?: string };
}

interface UseFileAttachmentOptions {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  uploadType?: string;
  onFilesChange?: (files: AttachedFile[]) => void;
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

export function useFileAttachment({
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  uploadType = "message",
  onFilesChange
}: UseFileAttachmentOptions = {}): UseFileAttachmentReturn {
  const api = useApi();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileIndex }: { file: File; fileIndex: number }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', uploadType);

      // Update progress for this file
      setAttachedFiles(prev => prev.map((f, i) => 
        i === fileIndex 
          ? { ...f, isUploading: true, uploadProgress: 0 }
          : f
      ));

      const response = await api.files.upload(formData);
      
      // Update with successful upload
      setAttachedFiles(prev => prev.map((f, i) => 
        i === fileIndex 
          ? { 
              ...f, 
              isUploading: false, 
              uploadProgress: 100, 
              url: response.url,
              id: response.id 
            }
          : f
      ));

      return response;
    },
    onError: (error: any, { fileIndex }) => {
      // Update with error
      setAttachedFiles(prev => prev.map((f, i) => 
        i === fileIndex 
          ? { 
              ...f, 
              isUploading: false, 
              error: error?.message || 'Upload failed' 
            }
          : f
      ));
      toast.error(`Failed to upload file: ${error?.message || 'Unknown error'}`);
    },
  });


  const getFileIcon = (type: string) => {
    // This would return icon components based on file type
    // Implementation depends on the icon library being used
    if (type.startsWith('image/')) return 'Image';
    if (type === 'application/pdf') return 'FileText';
    if (type.startsWith('text/')) return 'FileText';
    return 'File';
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxFileSize}MB limit` };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    return { valid: true };
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (attachedFiles.length + newFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        break;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }

      newFiles.push({
        id: `temp-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        isUploading: false,
      });
    }

    const updatedFiles = [...attachedFiles, ...newFiles];
    setAttachedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = attachedFiles.filter(f => f.id !== fileId);
    setAttachedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const uploadFiles = async (): Promise<AttachedFile[]> => {
    const filesToUpload = attachedFiles.filter(f => !f.url && !f.isUploading);
    
    if (filesToUpload.length === 0) {
      return attachedFiles;
    }

    // Create File objects for upload (this would need to be handled differently in a real app)
    // This is a simplified version - in reality you'd need to store the original File objects
    const uploadPromises = filesToUpload.map((attachedFile, index) => {
      const fileIndex = attachedFiles.findIndex(f => f.id === attachedFile.id);
      // This is a placeholder - you'd need the actual File object
      const file = new File([], attachedFile.name, { type: attachedFile.type });
      return uploadMutation.mutateAsync({ file, fileIndex });
    });

    await Promise.all(uploadPromises);
    return attachedFiles;
  };

  const clearFiles = () => {
    setAttachedFiles([]);
    onFilesChange?.([]);
  };

  const handleSetAttachedFiles = (files: AttachedFile[]) => {
    setAttachedFiles(files);
    onFilesChange?.(files);
  };

  return {
    // State
    attachedFiles,
    isDragOver,
    
    // Actions
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
    uploadFiles,
    clearFiles,
    
    // State setters
    setAttachedFiles: handleSetAttachedFiles,
    
    // Refs
    fileInputRef,
    
    // Upload state
    isUploading: uploadMutation.isPending,
    
    // Utilities
    formatFileSize,
    getFileIcon,
    validateFile,
  };
}