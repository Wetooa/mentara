"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DownloadIcon,
  XIcon,
  FileTextIcon,
  ImageIcon,
  FileIcon,
  Loader2Icon,
} from "lucide-react";

interface FilePreviewModalProps {
  file: {
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  } | null;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");

  useEffect(() => {
    if (!file) {
      return;
    }

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For protected file URLs, we need to handle authentication
        const response = await fetch(file.fileUrl, {
          credentials: "include", // Include auth cookies
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to access file");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setFileType(blob.type || getFileTypeFromName(file.fileName));
        
      } catch (error) {
        console.error("Error loading file:", error);
        setError("Failed to load file. Please try again.");
        toast.error("Failed to load file preview");
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    // Cleanup blob URL when component unmounts or file changes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file]);

  const getFileTypeFromName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  };

  const handleDownload = async () => {
    if (!blobUrl || !file) return;
    
    try {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("File download started");
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2Icon className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading file...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <FileIcon className="h-16 w-16 mb-4" />
          <p className="text-center">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.open(file?.fileUrl, "_blank")}
            className="mt-4"
          >
            Try opening in new tab
          </Button>
        </div>
      );
    }

    if (!blobUrl) return null;

    // Handle images
    if (fileType.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <img
            src={blobUrl}
            alt={file?.fileName || "File preview"}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
            onError={() => setError("Failed to load image")}
          />
        </div>
      );
    }

    // Handle PDFs
    if (fileType === "application/pdf") {
      return (
        <div className="h-[70vh] w-full">
          <iframe
            src={blobUrl}
            className="w-full h-full border rounded-lg"
            title={file?.fileName || "PDF preview"}
            onError={() => setError("Failed to load PDF")}
          />
        </div>
      );
    }

    // Handle other file types
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <FileTextIcon className="h-16 w-16 mb-4" />
        <p className="text-center mb-2">Preview not available for this file type</p>
        <p className="text-sm text-gray-400 mb-4">{file?.fileName}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(blobUrl, "_blank")}
          >
            Open in new tab
          </Button>
          <Button onClick={handleDownload}>
            Download file
          </Button>
        </div>
      </div>
    );
  };

  const getFileIcon = () => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileType === "application/pdf") {
      return <FileTextIcon className="h-5 w-5 text-red-500" />;
    }
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };

  if (!file) return null;

  return (
    <Dialog open={!!file} onOpenChange={() => onClose()}>
      <DialogContent className="w-[95vw] max-w-[1000px] h-[90vh] max-h-[800px] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {getFileIcon()}
              <span className="truncate">{file.fileName}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!blobUrl}
              >
                <DownloadIcon className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}