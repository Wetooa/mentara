"use client";

import React from "react";
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PROVIDER_TYPE from "@/constants/provider";
import PHILIPPINE_PROVINCES from "@/constants/provinces";

// Types
import { TherapistApplicationFormData } from "@/types/therapist-application";

interface BasicInfoSectionProps {
  control: Control<TherapistApplicationFormData>;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  control,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                First Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your first name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Last Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your last name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="mobile"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              Mobile Phone Number <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., 09xxxxxxxxx" type="tel" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              Email Address <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter your email address"
                type="email"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Province <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your province" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {PHILIPPINE_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="providerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Provider Type <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {PROVIDER_TYPE.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};