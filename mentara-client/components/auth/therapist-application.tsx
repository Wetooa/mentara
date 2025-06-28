"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, FormProvider, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingStepper } from "@/components/ui/onboardingstepper";
import { therapistProfileFormFields } from "@/constants/therapist_application";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeDown } from "@/lib/animations";
import { useRouter } from "next/navigation";
import useTherapistForm from "@/store/therapistform";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// --- Zod Schema Construction ---
const schema = z.object({
  professionalLicenseType: z
    .string()
    .min(1, "Please select your professional license type."),
  professionalLicenseType_specify: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        if (ctx.parent.professionalLicenseType === "other") {
          return val && val.length > 0;
        }
        return true;
      },
      {
        message: "Please specify your license type.",
        path: ["professionalLicenseType_specify"],
      }
    ),
  isPRCLicensed: z.string().min(1, "Please indicate if you are PRC-licensed."),
  prcLicenseNumber: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        if (ctx.parent.isPRCLicensed === "yes") {
          return val && /^[0-9]{7}$/.test(val);
        }
        return true;
      },
      {
        message: "Please enter a valid 7-digit PRC license number.",
        path: ["prcLicenseNumber"],
      }
    ),
  expirationDateOfLicense: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        if (ctx.parent.isPRCLicensed === "yes") {
          return val && val.length > 0;
        }
        return true;
      },
      {
        message: "Please enter the license expiration date.",
        path: ["expirationDateOfLicense"],
      }
    ),
  isLicenseActive: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        if (ctx.parent.isPRCLicensed === "yes") {
          return val && val.length > 0;
        }
        return true;
      },
      {
        message: "Please confirm the status of your license.",
        path: ["isLicenseActive"],
      }
    ),
  teletherapyReadiness: z.object({
    providedOnlineTherapyBefore: z
      .string()
      .min(1, "Please answer this question."),
    comfortableUsingVideoConferencing: z
      .string()
      .min(1, "Please answer this question."),
    privateConfidentialSpace: z.string().min(1, "Please answer this question."),
    compliesWithDataPrivacyAct: z
      .string()
      .min(1, "Please confirm compliance with the Data Privacy Act."),
  }),
  areasOfExpertise: z
    .array(z.string())
    .min(1, "Please select at least one area of expertise."),
  compliance: z.object({
    professionalLiabilityInsurance: z
      .string()
      .min(1, "Please answer regarding liability insurance."),
    complaintsOrDisciplinaryActions: z
      .string()
      .min(1, "Please answer regarding complaints history."),
    complaintsOrDisciplinaryActions_specify: z
      .string()
      .optional()
      .refine(
        (val, ctx) => {
          if (ctx.parent.complaintsOrDisciplinaryActions === "yes") {
            return val && val.length >= 10;
          }
          return true;
        },
        {
          message: "Please provide a brief explanation (min. 10 characters).",
          path: ["complaintsOrDisciplinaryActions_specify"],
        }
      ),
    willingToAbideByPlatformGuidelines: z
      .string()
      .refine((val) => val === "yes", {
        message:
          "You must agree to abide by the platform guidelines to proceed.",
      }),
  }),
});

type TherapistApplicationForm = z.infer<typeof schema>;

const steps = [
  { label: "Therapist Profile", completed: true },
  { label: "Document Upload", completed: false },
  { label: "Verification", completed: false },
];

export default function MentaraApplication() {
  const router = useRouter();
  const { updateField, updateNestedField } = useTherapistForm();
  
  const form = useForm<TherapistApplicationForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      professionalLicenseType: "",
      professionalLicenseType_specify: "",
      isPRCLicensed: "",
      prcLicenseNumber: "",
      expirationDateOfLicense: "",
      isLicenseActive: "",
      teletherapyReadiness: {
        providedOnlineTherapyBefore: "",
        comfortableUsingVideoConferencing: "",
        privateConfidentialSpace: "",
        compliesWithDataPrivacyAct: "",
      },
      areasOfExpertise: [],
      compliance: {
        professionalLiabilityInsurance: "",
        complaintsOrDisciplinaryActions: "",
        complaintsOrDisciplinaryActions_specify: "",
        willingToAbideByPlatformGuidelines: "",
      },
    },
    mode: "onSubmit",
  });

  // Use useWatch instead of form.watch to prevent infinite re-renders
  const watchedValues = useWatch({
    control: form.control,
    name: ["professionalLicenseType", "isPRCLicensed", "compliance.complaintsOrDisciplinaryActions"],
  });
  
  const [professionalLicenseType, isPRCLicensed, complaintsOrDisciplinaryActions] = watchedValues;

  const onSubmit = useCallback((values: TherapistApplicationForm) => {
    try {
      // Batch all Zustand store updates to prevent excessive re-renders
      const updateData = {
        professionalLicenseType: values.professionalLicenseType,
        professionalLicenseType_specify: values.professionalLicenseType_specify,
        isPRCLicensed: values.isPRCLicensed,
        prcLicenseNumber: values.prcLicenseNumber,
        expirationDateOfLicense: values.expirationDateOfLicense,
        isLicenseActive: values.isLicenseActive,
        areasOfExpertise: values.areasOfExpertise,
      };
      
      // Update fields efficiently
      Object.entries(updateData).forEach(([key, value]) => {
        updateField(key, value);
      });
      
      // Save nested data
      updateNestedField("teletherapyReadiness", "providedOnlineTherapyBefore", values.teletherapyReadiness.providedOnlineTherapyBefore);
      updateNestedField("teletherapyReadiness", "comfortableUsingVideoConferencing", values.teletherapyReadiness.comfortableUsingVideoConferencing);
      updateNestedField("teletherapyReadiness", "privateConfidentialSpace", values.teletherapyReadiness.privateConfidentialSpace);
      updateNestedField("teletherapyReadiness", "compliesWithDataPrivacyAct", values.teletherapyReadiness.compliesWithDataPrivacyAct);
      updateNestedField("compliance", "professionalLiabilityInsurance", values.compliance.professionalLiabilityInsurance);
      updateNestedField("compliance", "complaintsOrDisciplinaryActions", values.compliance.complaintsOrDisciplinaryActions);
      updateNestedField("compliance", "complaintsOrDisciplinaryActions_specify", values.compliance.complaintsOrDisciplinaryActions_specify);
      updateNestedField("compliance", "willingToAbideByPlatformGuidelines", values.compliance.willingToAbideByPlatformGuidelines);
      
      console.log("Therapist Application Data Saved:", values);
      
      // Navigate to step 2 (Document Upload)
      router.push("/therapist-application/2");
    } catch (error) {
      console.error("Error saving application data:", error);
    }
  }, [updateField, updateNestedField, router]);

  return (
    <motion.div
      variants={fadeDown}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-screen flex bg-gray-50"
    >
      {/* Left sidebar */}
      <div className="w-1/5 bg-gradient-to-b from-green-100 via-green-50 to-gray-50 p-6 flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="mb-8">
          <Image
            src="/icons/mentara/mentara-landscape.png"
            alt="Mentara logo"
            width={250}
            height={100}
          />
        </div>
        <div className="mt-4 mb-8">
          <p className="text-sm text-gray-600 mb-1">You're working on</p>
          <h1 className="text-2xl font-bold text-green-900">Application</h1>
        </div>
        <OnboardingStepper steps={steps} />
        <div className="mt-auto text-xs text-gray-500">
          © {new Date().getFullYear()} Mentara. All rights reserved.
        </div>
      </div>
      {/* Right content area - scrollable form */}
      <div className="w-4/5 flex justify-center p-8">
        <div className="w-full max-w-3xl h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-8">
                {/* Professional License Type */}
                <FormField
                  control={form.control}
                  name="professionalLicenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What is your professional license type?
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="professionalLicenseType"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rpsy" id="rpsy" />
                              <Label htmlFor="rpsy">
                                RPsy (Registered Psychologist)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rpm" id="rpm" />
                              <Label htmlFor="rpm">
                                RPm (Registered Psychometrician)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rgc" id="rgc" />
                              <Label htmlFor="rgc">
                                RGC (Registered Guidance Counselor)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other">Others (Please specify)</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Specify License Type if 'other' */}
                {professionalLicenseType === "other" && (
                  <FormField
                    control={form.control}
                    name="professionalLicenseType_specify"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please specify your license type</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {/* PRC Licensed */}
                <FormField
                  control={form.control}
                  name="isPRCLicensed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Are you PRC-licensed?</FormLabel>
                      <Controller
                        control={form.control}
                        name="isPRCLicensed"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="prc-yes" />
                              <Label htmlFor="prc-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="prc-no" />
                              <Label htmlFor="prc-no">No</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* PRC License Number, Expiration, Active if PRC Licensed */}
                {isPRCLicensed === "yes" && (
                  <>
                    <FormField
                      control={form.control}
                      name="prcLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PRC License Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expirationDateOfLicense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date of License</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isLicenseActive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Is your license currently active and in good
                            standing?
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="isLicenseActive"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="yes" id="active-yes" />
                                  <Label htmlFor="active-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id="active-no" />
                                  <Label htmlFor="active-no">No</Label>
                                </div>
                              </RadioGroup>
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {/* Teletherapy Readiness */}
                <FormField
                  control={form.control}
                  name="teletherapyReadiness.providedOnlineTherapyBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Have you provided online therapy before?
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="teletherapyReadiness.providedOnlineTherapyBefore"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="online-yes" />
                              <Label htmlFor="online-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="online-no" />
                              <Label htmlFor="online-no">No</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teletherapyReadiness.comfortableUsingVideoConferencing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Are you comfortable using secure video conferencing
                        tools (e.g., Zoom, Google Meet)?
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="teletherapyReadiness.comfortableUsingVideoConferencing"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="video-yes" />
                              <Label htmlFor="video-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="video-no" />
                              <Label htmlFor="video-no">No</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teletherapyReadiness.privateConfidentialSpace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Do you have a private and confidential space for
                        conducting virtual sessions?
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="teletherapyReadiness.privateConfidentialSpace"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="private-yes" />
                              <Label htmlFor="private-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="private-no" />
                              <Label htmlFor="private-no">No</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teletherapyReadiness.compliesWithDataPrivacyAct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Do you comply with the Philippine Data Privacy Act (RA
                        10173)?
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="teletherapyReadiness.compliesWithDataPrivacyAct"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="privacy-yes" />
                              <Label htmlFor="privacy-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="privacy-no" />
                              <Label htmlFor="privacy-no">No</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Areas of Expertise (Checkboxes) */}
                <FormField
                  control={form.control}
                  name="areasOfExpertise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Areas of Expertise (Check all that apply)
                      </FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {therapistProfileFormFields.areasOfExpertise.options.map(
                          (option) => (
                            <Label
                              key={option.value}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([
                                      ...field.value,
                                      option.value,
                                    ]);
                                  } else {
                                    field.onChange(
                                      field.value.filter(
                                        (v) => v !== option.value
                                      )
                                    );
                                  }
                                }}
                              />
                              {option.label}
                            </Label>
                          )
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Compliance */}
                <FormField
                  control={form.control}
                  name="compliance.professionalLiabilityInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Do you have professional liability insurance for online
                        practice?
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="compliance.professionalLiabilityInsurance"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="liability-yes" />
                              <Label htmlFor="liability-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="liability-no" />
                              <Label htmlFor="liability-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="willing"
                                id="liability-willing"
                              />
                              <Label htmlFor="liability-willing">
                                Not yet, but willing to secure
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compliance.complaintsOrDisciplinaryActions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Have you ever had complaints or disciplinary actions
                        against your PRC license?
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="compliance.complaintsOrDisciplinaryActions"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="complaints-no" />
                              <Label htmlFor="complaints-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="complaints-yes" />
                              <Label htmlFor="complaints-yes">
                                Yes (please briefly explain):
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Specify if complaints = yes */}
                {complaintsOrDisciplinaryActions === "yes" && (
                  <FormField
                    control={form.control}
                    name="compliance.complaintsOrDisciplinaryActions_specify"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Briefly explain the nature and resolution
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="compliance.willingToAbideByPlatformGuidelines"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Are you willing to abide by our platform's ethical
                        guidelines, privacy policies, and patient safety
                        standards?
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="compliance.willingToAbideByPlatformGuidelines"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            name={field.name}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="guidelines-yes" />
                              <Label htmlFor="guidelines-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="guidelines-no" />
                              <Label htmlFor="guidelines-no">No</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 rounded-full bg-green-600 text-white font-semibold text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                  >
                    Save and Continue
                  </button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
}
