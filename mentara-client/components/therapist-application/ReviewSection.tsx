"use client";

import React, { memo } from "react";
import { UseFormReturn } from "react-hook-form";

// UI Components
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface ReviewSectionProps {
  form: UseFormReturn<any>;
  watchedValues: any;
  documents: Record<string, File[]>;
}

export const ReviewSection = memo(function ReviewSection({
  form,
  watchedValues,
  documents,
}: ReviewSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Application Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Name:</strong> {watchedValues.firstName}{" "}
              {watchedValues.lastName}
            </p>
            <p>
              <strong>Email:</strong> {watchedValues.email}
            </p>
            <p>
              <strong>Mobile:</strong> {watchedValues.mobile}
            </p>
            <p>
              <strong>Province:</strong> {watchedValues.province}
            </p>
          </div>
          <div>
            <p>
              <strong>License Type:</strong>{" "}
              {watchedValues.professionalLicenseType}
            </p>
            <p>
              <strong>PRC Licensed:</strong> {watchedValues.isPRCLicensed}
            </p>
            <p>
              <strong>Expertise Areas:</strong>{" "}
              {watchedValues.areasOfExpertise?.length || 0} selected
            </p>
            <p>
              <strong>Documents:</strong>{" "}
              {Object.values(documents).reduce(
                (sum: number, docs) => sum + (docs as File[]).length,
                0
              )}{" "}
              files uploaded
            </p>
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="consentChecked"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-gray-200 rounded-lg">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I certify that all documents uploaded are authentic and valid. I
                understand that providing false information may result in the
                rejection of my application.
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
});