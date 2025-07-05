"use client";

import React, { useCallback, memo } from "react";
import { FileText, Upload, X } from "lucide-react";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DocumentUploadSectionProps {
  documents: Record<string, File[]>;
  onFileChange: (docType: string, files: FileList | null) => void;
  onRemoveFile: (docType: string, index: number) => void;
}

interface DocumentUploadCardProps {
  title: string;
  description: string;
  required: boolean;
  files: File[];
  onFileChange: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
}

// Document Upload Card Component
const DocumentUploadCard = memo(function DocumentUploadCard({
  title,
  description,
  required,
  files,
  onFileChange,
  onRemoveFile,
}: DocumentUploadCardProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileChange(e.dataTransfer.files);
      }
    },
    [onFileChange]
  );

  return (
    <Card
      className={`border ${files.length > 0 ? "border-green-300 bg-green-50" : "border-gray-200"}`}
    >
      <CardContent className="p-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        <div className="p-5">
          {files && files.length > 0 ? (
            <div className="space-y-3">
              {Array.from(files).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center min-w-0">
                    <FileText className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 ml-2"
                    onClick={() => onRemoveFile(index)}
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                type="button"
                className="w-full mt-3 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                onClick={() =>
                  document.getElementById(`file-input-${title}`)?.click()
                }
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Additional File(s)
              </Button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-green-400 bg-white"
              onClick={() =>
                document.getElementById(`file-input-${title}`)?.click()
              }
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop your file(s) here, or
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, JPG, PNG or DOCX up to 10MB each
                </p>
              </div>
              <Button type="button" variant="outline" className="mt-4">
                Browse Files
              </Button>
            </div>
          )}
          <input
            id={`file-input-${title}`}
            type="file"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
          />
        </div>
      </CardContent>
    </Card>
  );
});

// Main Document Upload Section Component
export const DocumentUploadSection = memo(function DocumentUploadSection({
  documents,
  onFileChange,
  onRemoveFile,
}: DocumentUploadSectionProps) {
  const requiredDocs = [
    {
      key: "prcLicense",
      title: "PRC License",
      description: "Upload a clear copy of your valid PRC license",
    },
    {
      key: "nbiClearance",
      title: "NBI Clearance",
      description:
        "Upload your NBI clearance (issued within the last 6 months)",
    },
    {
      key: "resumeCV",
      title: "Resume/CV",
      description: "Upload your professional resume or curriculum vitae",
    },
  ];

  const optionalDocs = [
    {
      key: "liabilityInsurance",
      title: "Professional Liability Insurance",
      description:
        "If applicable, upload a copy of your professional liability insurance",
    },
    {
      key: "birForm",
      title: "BIR Form 2303 / Certificate of Registration",
      description: "Optional: Upload for tax reporting and payment processing",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Required Documents
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Please upload the following documents to complete your application.
          All documents must be clear and legible. Accepted formats: PDF, JPG,
          PNG, DOCX (Max 10MB each).
        </p>

        <div className="space-y-6">
          {requiredDocs.map((doc) => (
            <DocumentUploadCard
              key={doc.key}
              title={doc.title}
              description={doc.description}
              required={true}
              files={documents[doc.key] || []}
              onFileChange={(files) => onFileChange(doc.key, files)}
              onRemoveFile={(index) => onRemoveFile(doc.key, index)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Additional Documents (Optional)
        </h3>
        <div className="space-y-6">
          {optionalDocs.map((doc) => (
            <DocumentUploadCard
              key={doc.key}
              title={doc.title}
              description={doc.description}
              required={false}
              files={documents[doc.key] || []}
              onFileChange={(files) => onFileChange(doc.key, files)}
              onRemoveFile={(index) => onRemoveFile(doc.key, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});