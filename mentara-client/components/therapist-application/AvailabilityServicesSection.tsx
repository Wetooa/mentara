"use client";

import React, { memo } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, Clock, Shield, User } from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Constants
import { therapistProfileFormFields } from "@/constants/therapist_application";

interface AvailabilityServicesSectionProps {
  form: UseFormReturn<any>;
  watchedValues: any;
}

export const AvailabilityServicesSection = memo(function AvailabilityServicesSection({
  form,
  watchedValues,
}: AvailabilityServicesSectionProps) {
  const { preferredSessionLength, accepts } = watchedValues;

  return (
    <div className="space-y-8">
      {/* Weekly Availability */}
      <Card className="border border-cyan-200 bg-cyan-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-cyan-600" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="weeklyAvailability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Weekly availability for online sessions:{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3"
                  >
                    {therapistProfileFormFields.availabilityAndPayment.weeklyAvailability.options.map(
                      (option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-cyan-100"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`weekly-${option.value}`}
                          />
                          <Label
                            htmlFor={`weekly-${option.value}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{option.label}</div>
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Session Length */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            Session Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="preferredSessionLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Preferred session length:{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3"
                  >
                    {therapistProfileFormFields.availabilityAndPayment.preferredSessionLength.options.map(
                      (option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-100"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`session-${option.value}`}
                          />
                          <Label
                            htmlFor={`session-${option.value}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{option.label}</div>
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {preferredSessionLength === "other" && (
            <FormField
              control={form.control}
              name="preferredSessionLength_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify your preferred session length{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 50 minutes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-green-600" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="accepts"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Payment Methods Accepted:{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <div className="grid grid-cols-1 gap-3">
                  {therapistProfileFormFields.availabilityAndPayment.accepts.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-green-100 hover:border-green-300 cursor-pointer transition-colors group"
                      >
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(
                                field.value.filter((v: string) => v !== option.value)
                              );
                            }
                          }}
                        />
                        <span className="text-sm font-medium group-hover:text-green-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {accepts?.includes("hmo") && (
            <FormField
              control={form.control}
              name="accepts_hmo_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify HMO providers{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please list the HMO providers you accept..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Rate and Bio */}
      <Card className="border border-purple-200 bg-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-purple-600" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Standard session rate (PHP, optional):
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="e.g., 1500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Professional Bio (optional):
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Brief description of your background, specializations, and approach to therapy..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
});