"use client";

import React, { memo } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, Users, Shield } from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface ProfessionalProfileSectionProps {
  form: UseFormReturn<any>;
  watchedValues: any;
}

export const ProfessionalProfileSection = memo(function ProfessionalProfileSection({
  form,
  watchedValues,
}: ProfessionalProfileSectionProps) {
  const {
    therapeuticApproachesUsedList,
    languagesOffered,
    complaintsOrDisciplinaryActions,
  } = watchedValues;

  return (
    <div className="space-y-8">
      {/* Areas of Expertise */}
      <Card className="border border-orange-200 bg-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-orange-600" />
            Areas of Expertise
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all areas where you have professional experience and
            training. You must select at least one area.
          </p>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="areasOfExpertise"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {therapistProfileFormFields.areasOfExpertise.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 cursor-pointer transition-colors group"
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
                        <span className="text-sm font-medium group-hover:text-orange-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-orange-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Selected:</strong> {field.value?.length || 0} area
                    {field.value?.length !== 1 ? "s" : ""}
                    {field.value?.length > 0 && (
                      <span className="ml-2 text-orange-600">
                        (
                        {field.value
                          .map(
                            (val: string) =>
                              therapistProfileFormFields.areasOfExpertise.options.find(
                                (opt) => opt.value === val
                              )?.label
                          )
                          .join(", ")}
                        )
                      </span>
                    )}
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Assessment Tools */}
      <Card className="border border-indigo-200 bg-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-indigo-600" />
            Assessment Tools & Approaches
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all assessment tools and approaches you use. You must select
            at least one.
          </p>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="assessmentTools"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {therapistProfileFormFields.assessmentTools.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 cursor-pointer transition-colors group"
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
                        <span className="text-sm font-medium group-hover:text-indigo-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <div className="mt-4 p-3 bg-indigo-100 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>Selected:</strong> {field.value?.length || 0} tool
                    {field.value?.length !== 1 ? "s" : ""}
                    {field.value?.length > 0 && (
                      <span className="ml-2 text-indigo-600">
                        (
                        {field.value
                          .map(
                            (val: string) =>
                              therapistProfileFormFields.assessmentTools.options.find(
                                (opt) => opt.value === val
                              )?.label
                          )
                          .join(", ")}
                        )
                      </span>
                    )}
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Therapeutic Approaches */}
      <Card className="border border-teal-200 bg-teal-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-teal-600" />
            Therapeutic Approaches
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all therapeutic approaches you use in your practice.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="therapeuticApproachesUsedList"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {therapistProfileFormFields.therapeuticApproachesUsedList.options.map(
                    (option) => (
                      <Label
                        key={option.value}
                        className="flex items-center gap-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-teal-100 hover:border-teal-300 cursor-pointer transition-colors group"
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
                        <span className="text-sm font-medium group-hover:text-teal-700 transition-colors">
                          {option.label}
                        </span>
                        {field.value?.includes(option.value) && (
                          <CheckCircle className="w-4 h-4 text-teal-600 ml-auto" />
                        )}
                      </Label>
                    )
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {therapeuticApproachesUsedList?.includes("other") && (
            <FormField
              control={form.control}
              name="therapeuticApproachesUsedList_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify other therapeutic approaches{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please describe the other therapeutic approaches you use..."
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

      {/* Languages Offered */}
      <Card className="border border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-green-600" />
            Languages Offered
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all languages you can offer therapy sessions in.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="languagesOffered"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {therapistProfileFormFields.languagesOffered.options.map(
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

          {languagesOffered?.includes("other") && (
            <FormField
              control={form.control}
              name="languagesOffered_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify other languages{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Tagalog, Kapampangan, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Compliance & Professional Standards */}
      <Card className="border border-red-200 bg-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-red-600" />
            Compliance & Professional Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="professionalLiabilityInsurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Do you have professional liability insurance for online
                  practice? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3"
                  >
                    {[
                      {
                        value: "yes",
                        label: "Yes",
                        description:
                          "I have active professional liability insurance",
                      },
                      {
                        value: "no",
                        label: "No",
                        description: "I do not have liability insurance",
                      },
                      {
                        value: "willing",
                        label: "Not yet, but willing to secure",
                        description:
                          "I am willing to obtain insurance before starting practice",
                      },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`liability-${option.value}`}
                        />
                        <Label
                          htmlFor={`liability-${option.value}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">
                            {option.description}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complaintsOrDisciplinaryActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Have you ever had complaints or disciplinary actions against
                  your PRC license? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3"
                  >
                    <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                      <RadioGroupItem value="no" id="complaints-no" />
                      <Label
                        htmlFor="complaints-no"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">No</div>
                        <div className="text-sm text-gray-500">
                          No complaints or disciplinary actions
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                      <RadioGroupItem value="yes" id="complaints-yes" />
                      <Label
                        htmlFor="complaints-yes"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          Yes (please briefly explain)
                        </div>
                        <div className="text-sm text-gray-500">
                          I will provide details below
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {complaintsOrDisciplinaryActions === "yes" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <FormField
                control={form.control}
                name="complaintsOrDisciplinaryActions_specify"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Please briefly explain the nature and resolution{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Please provide details about the complaint or disciplinary action and how it was resolved..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <FormField
              control={form.control}
              name="willingToAbideByPlatformGuidelines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Are you willing to abide by our platform's ethical
                    guidelines, privacy policies, and patient safety standards?{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100">
                        <RadioGroupItem value="yes" id="guidelines-yes" />
                        <Label
                          htmlFor="guidelines-yes"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-green-900">
                            Yes, I agree
                          </div>
                          <div className="text-sm text-green-700">
                            I commit to following all platform guidelines and
                            standards
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100">
                        <RadioGroupItem value="no" id="guidelines-no" />
                        <Label
                          htmlFor="guidelines-no"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-red-900">No</div>
                          <div className="text-sm text-red-700">
                            I do not agree to abide by the guidelines
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});