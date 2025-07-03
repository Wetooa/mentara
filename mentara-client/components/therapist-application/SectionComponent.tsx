"use client";

import React, { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, Circle, ChevronDown, ChevronRight } from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

// Section Components
import { BasicInfoSection } from "@/components/therapist-application/BasicInfoSection";
import { LicenseInfoSection } from "@/components/therapist-application/LicenseInfoSection";
import { TeletherapySection } from "@/components/therapist-application/TeletherapySection";
import { ProfessionalProfileSection } from "@/components/therapist-application/ProfessionalProfileSection";
import { AvailabilityServicesSection } from "@/components/therapist-application/AvailabilityServicesSection";
import { DocumentUploadSection } from "@/components/therapist-application/DocumentUploadSection";
import { ReviewSection } from "@/components/therapist-application/ReviewSection";

// Toast Context
import { useToast } from "@/contexts/ToastContext";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  estimatedTime: string;
  fields: string[];
  isRequired: boolean;
}

interface SectionComponentProps {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
  completion: { completed: number; total: number; percentage: number };
  form: UseFormReturn<any>;
  watchedValues: any;
  documents: Record<string, File[]>;
  updateDocuments: (docType: string, files: File[]) => void;
  removeDocument: (docType: string, index: number) => void;
}

export function SectionComponent({
  section,
  isOpen,
  onToggle,
  completion,
  form,
  watchedValues,
  documents,
  updateDocuments,
  removeDocument,
}: SectionComponentProps) {
  const { showToast } = useToast();

  const handleFileChange = useCallback(
    (docType: string, files: FileList | null) => {
      if (!files || files.length === 0) return;

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSizeMB = 10;
      const validFiles = Array.from(files).filter(
        (file) =>
          allowedTypes.includes(file.type) &&
          file.size <= maxSizeMB * 1024 * 1024
      );

      if (validFiles.length !== files.length) {
        showToast(
          "Some files were invalid (type or size) and were not added",
          "warning"
        );
      }

      updateDocuments(docType, [...documents[docType], ...validFiles]);
    },
    [documents, updateDocuments, showToast]
  );

  const handleRemoveFile = useCallback(
    (docType: string, index: number) => {
      removeDocument(docType, index);
    },
    [removeDocument]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card
        id={`section-${section.id}`}
        className="border-2 border-gray-200 hover:border-green-300 transition-colors"
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`${completion.percentage === 100 ? "text-green-600" : "text-gray-400"}`}
                >
                  {section.icon}
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {section.title}
                    {section.isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {completion.completed}/{completion.total} complete
                  </div>
                  <div className="text-xs text-gray-500">
                    {section.estimatedTime}
                  </div>
                </div>
                {completion.percentage === 100 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300" />
                )}
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {section.id === "basicInfo" && (
              <BasicInfoSection control={form.control} />
            )}
            {section.id === "licenseInfo" && (
              <LicenseInfoSection
                control={form.control}
                watchedValues={watchedValues}
              />
            )}
            {section.id === "teletherapy" && (
              <TeletherapySection control={form.control} />
            )}
            {section.id === "professionalProfile" && (
              <ProfessionalProfileSection
                form={form}
                watchedValues={watchedValues}
              />
            )}
            {section.id === "availability" && (
              <AvailabilityServicesSection
                form={form}
                watchedValues={watchedValues}
              />
            )}
            {section.id === "documents" && (
              <DocumentUploadSection
                documents={documents}
                onFileChange={handleFileChange}
                onRemoveFile={handleRemoveFile}
              />
            )}
            {section.id === "review" && (
              <ReviewSection
                form={form}
                watchedValues={watchedValues}
                documents={documents}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}