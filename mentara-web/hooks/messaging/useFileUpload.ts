import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFile, type UploadOptions, type UploadProgress } from "@/lib/storage/supabaseStorage";
import { useAuth } from "@/contexts/AuthContext";

export interface UseFileUploadReturn {
  upload: (file: File, options?: Partial<UploadOptions>) => Promise<{ url: string; fileName: string; fileSize: number; mimeType: string }>;
  isUploading: boolean;
  uploadProgress: number;
  error: Error | null;
}

export function useFileUpload(bucket: string = "message-attachments"): UseFileUploadReturn {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options?: Partial<UploadOptions> }) => {
      setError(null);
      setUploadProgress(0);
      
      const uploadOptions: UploadOptions = {
        bucket,
        contentType: file.type,
        ...options,
      };

      const result = await uploadFile(
        file,
        uploadOptions,
        (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
        }
      );

      return {
        url: result.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
    },
    onSuccess: () => {
      setUploadProgress(100);
      toast.success("File uploaded successfully");
    },
    onError: (err: Error) => {
      setError(err);
      setUploadProgress(0);
      toast.error(err.message || "Failed to upload file");
    },
  });

  const upload = useCallback(
    async (file: File, options?: Partial<UploadOptions>) => {
      return uploadMutation.mutateAsync({ file, options });
    },
    [uploadMutation]
  );

  return {
    upload,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error,
  };
}

