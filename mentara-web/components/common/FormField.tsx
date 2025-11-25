"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormFieldProps {
  label: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
  className?: string;
  htmlFor?: string;
}

/**
 * Form field wrapper with inline validation feedback
 * Provides consistent error and success states
 */
export function FormField({
  label,
  error,
  success = false,
  required = false,
  children,
  description,
  className,
  htmlFor,
}: FormFieldProps) {
  const fieldId = htmlFor || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      <div className="relative">
        {children}
        {error && (
          <div
            id={errorId}
            className="flex items-center gap-1 mt-1 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        {success && !error && (
          <div
            className="flex items-center gap-1 mt-1 text-sm text-green-600"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Field is valid</span>
          </div>
        )}
      </div>
    </div>
  );
}

