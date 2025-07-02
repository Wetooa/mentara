"use client";

import React from "react";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Shield } from "lucide-react";

// Type definition for the license information form fields
export interface LicenseInfoFormFields {
  professionalLicenseType: string;
  professionalLicenseType_specify?: string;
  isPRCLicensed: string;
  prcLicenseNumber?: string;
  expirationDateOfLicense?: string;
  isLicenseActive?: string;
  practiceStartDate: string;
}

interface LicenseInfoSectionProps {
  control: Control<any>;
  watchedValues: {
    professionalLicenseType?: string;
    isPRCLicensed?: string;
  };
}

export const LicenseInfoSection: React.FC<LicenseInfoSectionProps> = ({
  control,
  watchedValues,
}) => {
  const { professionalLicenseType, isPRCLicensed } = watchedValues;

  return (
    <Card className="border border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-blue-600" />
          Professional License Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="professionalLicenseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                What is your professional license type?{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                    <RadioGroupItem value="rpsy" id="rpsy" />
                    <Label htmlFor="rpsy" className="flex-1 cursor-pointer">
                      <div className="font-medium">
                        RPsy (Registered Psychologist)
                      </div>
                      <div className="text-sm text-gray-500">
                        Licensed to practice psychology
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                    <RadioGroupItem value="rpm" id="rpm" />
                    <Label htmlFor="rpm" className="flex-1 cursor-pointer">
                      <div className="font-medium">
                        RPm (Registered Psychometrician)
                      </div>
                      <div className="text-sm text-gray-500">
                        Licensed to administer psychological tests
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                    <RadioGroupItem value="rgc" id="rgc" />
                    <Label htmlFor="rgc" className="flex-1 cursor-pointer">
                      <div className="font-medium">
                        RGC (Registered Guidance Counselor)
                      </div>
                      <div className="text-sm text-gray-500">
                        Licensed to provide guidance and counseling
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="flex-1 cursor-pointer">
                      <div className="font-medium">
                        Others (Please specify)
                      </div>
                      <div className="text-sm text-gray-500">
                        Other recognized mental health license
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {professionalLicenseType === "other" && (
          <FormField
            control={control}
            name="professionalLicenseType_specify"
            render={({ field }) => (
              <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <FormLabel className="text-base font-semibold">
                  Please specify your license type{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Licensed Professional Counselor"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="isPRCLicensed"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Are you PRC-licensed? <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                    <RadioGroupItem value="yes" id="prc-yes" />
                    <Label
                      htmlFor="prc-yes"
                      className="cursor-pointer font-medium"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                    <RadioGroupItem value="no" id="prc-no" />
                    <Label
                      htmlFor="prc-no"
                      className="cursor-pointer font-medium"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isPRCLicensed === "yes" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                PRC License Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="prcLicenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      PRC License Number{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 1234567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="expirationDateOfLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      License Expiration Date{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="isLicenseActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Is your license currently active and in good standing?{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-3 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50">
                        <RadioGroupItem value="yes" id="active-yes" />
                        <Label
                          htmlFor="active-yes"
                          className="cursor-pointer font-medium"
                        >
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50">
                        <RadioGroupItem value="no" id="active-no" />
                        <Label
                          htmlFor="active-no"
                          className="cursor-pointer font-medium"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={control}
          name="practiceStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                When did you start practicing as a licensed professional?{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};