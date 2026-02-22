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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock } from "lucide-react";

// Types
import { TherapistApplicationFormData } from "@/types/therapist-application";

interface TeletherapySectionProps {
  control: Control<TherapistApplicationFormData>;
}

export const TeletherapySection: React.FC<TeletherapySectionProps> = ({
  control,
}) => {
  const teletherapyQuestions = [
    {
      name: "providedOnlineTherapyBefore",
      label: "Have you provided online therapy before?",
      id: "online-therapy",
    },
    {
      name: "comfortableUsingVideoConferencing",
      label:
        "Are you comfortable using secure video conferencing tools (e.g., Zoom, Google Meet)?",
      id: "video-conferencing",
    },
    {
      name: "privateConfidentialSpace",
      label:
        "Do you have a private and confidential space for conducting virtual sessions?",
      id: "private-space",
    },
    {
      name: "compliesWithDataPrivacyAct",
      label:
        "Do you comply with the Philippine Data Privacy Act (RA 10173)?",
      id: "privacy-act",
    },
  ];

  return (
    <Card className="border border-purple-200 bg-purple-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-purple-600" />
          Teletherapy Readiness Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {teletherapyQuestions.map((item) => (
          <FormField
            key={item.name}
            control={control}
            name={item.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  {item.label} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                      <RadioGroupItem value="yes" id={`${item.id}-yes`} />
                      <Label
                        htmlFor={`${item.id}-yes`}
                        className="cursor-pointer font-medium"
                      >
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 min-h-[44px] border border-gray-200 rounded-lg hover:bg-gray-50 touch-manipulation">
                      <RadioGroupItem value="no" id={`${item.id}-no`} />
                      <Label
                        htmlFor={`${item.id}-no`}
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
        ))}
      </CardContent>
    </Card>
  );
};