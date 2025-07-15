"use client";
import React, { useCallback } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Shield, FileText, Users, Clock, Save, Loader2 } from "lucide-react";
import { OnboardingStepper } from "@/components/ui/onboardingstepper";
import { therapistProfileFormFields } from "@/constants/therapist_application";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeDown } from "@/lib/animations";
import { useRouter } from "next/navigation";
import useTherapistForm from "@/store/therapistform";
import { useToast } from "@/contexts/ToastContext";
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
  { 
    label: "Professional Profile", 
    completed: false, 
    current: true,
    description: "Provide your professional information and qualifications",
    estimatedTime: "5-8 minutes"
  },
  { 
    label: "Document Upload", 
    completed: false,
    description: "Upload required professional documents and certifications",
    estimatedTime: "3-5 minutes"
  },
  { 
    label: "Review & Submit", 
    completed: false,
    description: "Review your application and submit for verification",
    estimatedTime: "2-3 minutes"
  },
];

export default function MentaraApplication() {
  const router = useRouter();
  const { updateField, updateNestedField } = useTherapistForm();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  
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
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Use useWatch instead of form.watch to prevent infinite re-renders
  const watchedValues = useWatch({
    control: form.control,
    name: ["professionalLicenseType", "isPRCLicensed", "compliance.complaintsOrDisciplinaryActions"],
  });
  
  const [professionalLicenseType, isPRCLicensed, complaintsOrDisciplinaryActions] = watchedValues;

  // Helper function to check if a field is valid and has a value
  // const isFieldComplete = useCallback((fieldName: string) => {
  //   const fieldState = form.getFieldState(fieldName);
  //   const fieldValue = form.getValues(fieldName as keyof TherapistApplicationForm);
  //   return !fieldState.error && fieldValue && fieldValue !== "" && (!Array.isArray(fieldValue) || fieldValue.length > 0);
  // }, [form]);

  // Helper function to get validation icon
  // const getValidationIcon = useCallback((fieldName: string, size = "w-4 h-4") => {
  //   const fieldState = form.getFieldState(fieldName);
  //   const fieldValue = form.getValues(fieldName as keyof TherapistApplicationForm);
  //   
  //   if (fieldState.error) {
  //     return <AlertCircle className={`${size} text-red-500`} />;
  //   }
  //   
  //   if (fieldValue && fieldValue !== "" && (!Array.isArray(fieldValue) || fieldValue.length > 0)) {
  //     return <Check className={`${size} text-green-500`} />;
  //   }
  //   
  //   return <Circle className={`${size} text-gray-300`} />;
  // }, [form]);

  // Auto-save functionality
  const autoSave = useCallback((values: TherapistApplicationForm) => {
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
      
      setLastSavedAt(new Date());
      showToast("Draft saved automatically", "info", 2000);
    } catch {
      showToast("Failed to save draft", "error");
    }
  }, [updateField, updateNestedField, showToast]);

  const onSubmit = useCallback(async (values: TherapistApplicationForm) => {
    setIsSubmitting(true);
    
    try {
      // Validate that required fields are completed
      if (values.compliance.willingToAbideByPlatformGuidelines !== "yes") {
        throw new Error("You must agree to abide by platform guidelines to proceed.");
      }
      
      // Save data using the same function as auto-save
      autoSave(values);
      
      console.log("Therapist Application Data Saved:", values);
      showToast("Professional profile saved successfully!", "success");
      
      // Navigate to step 2 (Document Upload) after a brief delay
      setTimeout(() => {
        router.push("/therapist-application/2");
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save application. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [autoSave, router, showToast]);

  // Auto-save every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentValues = form.getValues();
      // Only auto-save if there are meaningful values
      if (currentValues.professionalLicenseType || currentValues.areasOfExpertise.length > 0) {
        autoSave(currentValues);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [form, autoSave]);

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
          <p className="text-sm text-gray-600 mb-1">You&apos;re working on</p>
          <h1 className="text-2xl font-bold text-green-900">Application</h1>
        </div>
        <OnboardingStepper steps={steps} currentStep={0} />
        <div className="mt-auto text-xs text-gray-500">
          © {new Date().getFullYear()} Mentara. All rights reserved.
        </div>
      </div>
      {/* Right content area - scrollable form */}
      <div className="w-4/5 flex justify-center p-8">
        <div className="w-full max-w-4xl h-full">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Profile</h1>
                <p className="text-gray-600">Please provide your professional information and qualifications. All fields marked with <span className="text-red-500">*</span> are required.</p>
              </div>
              
              {/* Auto-save status indicator */}
              <div className="flex items-center gap-2 text-sm">
                {lastSavedAt ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                    <Save className="w-4 h-4" />
                    <span className="font-medium">
                      Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                    <Circle className="w-4 h-4" />
                    <span>Not saved yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)}
              aria-label="Therapist Professional Profile Form"
              role="form"
            >
              <div className="space-y-6" role="region" aria-label="Professional Information Sections">
                {/* Professional License Information */}
                <Card className="border-2 border-gray-200 hover:border-green-300 transition-colors" role="group" aria-labelledby="license-info-title">
                  <CardHeader className="pb-4">
                    <CardTitle id="license-info-title" className="flex items-center gap-2 text-xl">
                      <FileText className="w-5 h-5 text-green-600" />
                      Professional License Information
                      <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="professionalLicenseType"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            What is your professional license type? <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="professionalLicenseType"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                                className="grid grid-cols-1 gap-3 mt-3"
                              >
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="rpsy" id="rpsy" className="text-green-600" />
                                  <Label htmlFor="rpsy" className="flex-1 cursor-pointer">
                                    <div className="font-medium">RPsy (Registered Psychologist)</div>
                                    <div className="text-sm text-gray-500">Licensed to practice psychology</div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="rpm" id="rpm" className="text-green-600" />
                                  <Label htmlFor="rpm" className="flex-1 cursor-pointer">
                                    <div className="font-medium">RPm (Registered Psychometrician)</div>
                                    <div className="text-sm text-gray-500">Licensed to administer psychological tests</div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="rgc" id="rgc" className="text-green-600" />
                                  <Label htmlFor="rgc" className="flex-1 cursor-pointer">
                                    <div className="font-medium">RGC (Registered Guidance Counselor)</div>
                                    <div className="text-sm text-gray-500">Licensed to provide guidance and counseling</div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="other" id="other" className="text-green-600" />
                                  <Label htmlFor="other" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Others (Please specify)</div>
                                    <div className="text-sm text-gray-500">Other recognized mental health license</div>
                                  </Label>
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
                          <FormItem className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <FormLabel className="text-base font-semibold text-gray-900">
                              Please specify your license type <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Licensed Professional Counselor, Marriage and Family Therapist"
                                className="mt-2"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="isPRCLicensed"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Are you PRC-licensed? <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="isPRCLicensed"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                                className="flex gap-6 mt-3"
                              >
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="yes" id="prc-yes" className="text-green-600" />
                                  <Label htmlFor="prc-yes" className="cursor-pointer font-medium">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="no" id="prc-no" className="text-green-600" />
                                  <Label htmlFor="prc-no" className="cursor-pointer font-medium">No</Label>
                                </div>
                              </RadioGroup>
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* PRC License Details if PRC Licensed */}
                    {isPRCLicensed === "yes" && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-green-900">PRC License Details</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="prcLicenseNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold text-gray-900">
                                  PRC License Number <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g., 1234567"
                                    className="bg-white border-green-300 focus:border-green-500"
                                  />
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
                                <FormLabel className="font-semibold text-gray-900">
                                  License Expiration Date <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                    className="bg-white border-green-300 focus:border-green-500"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="isLicenseActive"
                          render={() => (
                            <FormItem>
                              <FormLabel className="font-semibold text-gray-900">
                                Is your license currently active and in good standing? <span className="text-red-500">*</span>
                              </FormLabel>
                              <Controller
                                control={form.control}
                                name="isLicenseActive"
                                render={({ field }) => (
                                  <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    name={field.name}
                                    className="flex gap-6 mt-3"
                                  >
                                    <div className="flex items-center space-x-3 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors">
                                      <RadioGroupItem value="yes" id="active-yes" className="text-green-600" />
                                      <Label htmlFor="active-yes" className="cursor-pointer font-medium">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors">
                                      <RadioGroupItem value="no" id="active-no" className="text-green-600" />
                                      <Label htmlFor="active-no" className="cursor-pointer font-medium">No</Label>
                                    </div>
                                  </RadioGroup>
                                )}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Teletherapy Readiness Assessment */}
                <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors" role="group" aria-labelledby="teletherapy-title">
                  <CardHeader className="pb-4">
                    <CardTitle id="teletherapy-title" className="flex items-center gap-2 text-xl">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Teletherapy Readiness Assessment
                      <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="teletherapyReadiness.providedOnlineTherapyBefore"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Have you provided online therapy before? <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="teletherapyReadiness.providedOnlineTherapyBefore"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                                className="flex gap-6 mt-3"
                              >
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="yes" id="online-yes" className="text-blue-600" />
                                  <Label htmlFor="online-yes" className="cursor-pointer font-medium">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="no" id="online-no" className="text-blue-600" />
                                  <Label htmlFor="online-no" className="cursor-pointer font-medium">No</Label>
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
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Are you comfortable using secure video conferencing tools (e.g., Zoom, Google Meet)? <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="teletherapyReadiness.comfortableUsingVideoConferencing"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                                className="flex gap-6 mt-3"
                              >
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="yes" id="video-yes" className="text-blue-600" />
                                  <Label htmlFor="video-yes" className="cursor-pointer font-medium">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="no" id="video-no" className="text-blue-600" />
                                  <Label htmlFor="video-no" className="cursor-pointer font-medium">No</Label>
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
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Do you have a private and confidential space for conducting virtual sessions? <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="teletherapyReadiness.privateConfidentialSpace"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                                className="flex gap-6 mt-3"
                              >
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="yes" id="private-yes" className="text-blue-600" />
                                  <Label htmlFor="private-yes" className="cursor-pointer font-medium">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="no" id="private-no" className="text-blue-600" />
                                  <Label htmlFor="private-no" className="cursor-pointer font-medium">No</Label>
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
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Do you comply with the Philippine Data Privacy Act (RA 10173)? <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="teletherapyReadiness.compliesWithDataPrivacyAct"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                                className="flex gap-6 mt-3"
                              >
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="yes" id="privacy-yes" className="text-blue-600" />
                                  <Label htmlFor="privacy-yes" className="cursor-pointer font-medium">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="no" id="privacy-no" className="text-blue-600" />
                                  <Label htmlFor="privacy-no" className="cursor-pointer font-medium">No</Label>
                                </div>
                              </RadioGroup>
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                {/* Areas of Expertise */}
                <Card className="border-2 border-gray-200 hover:border-purple-300 transition-colors" role="group" aria-labelledby="expertise-title">
                  <CardHeader className="pb-4">
                    <CardTitle id="expertise-title" className="flex items-center gap-2 text-xl">
                      <Users className="w-5 h-5 text-purple-600" />
                      Areas of Expertise
                      <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Select all areas where you have professional experience and training. You must select at least one area.</p>
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
                                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors group"
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
                                    className="text-purple-600"
                                  />
                                  <span className="text-sm font-medium group-hover:text-purple-700 transition-colors">
                                    {option.label}
                                  </span>
                                  {field.value?.includes(option.value) && (
                                    <CheckCircle className="w-4 h-4 text-purple-600 ml-auto" />
                                  )}
                                </Label>
                              )
                            )}
                          </div>
                          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-sm text-purple-800">
                              <strong>Selected:</strong> {field.value?.length || 0} area{field.value?.length !== 1 ? 's' : ''}
                              {field.value?.length > 0 && (
                                <span className="ml-2 text-purple-600">
                                  ({field.value.map(val => 
                                    therapistProfileFormFields.areasOfExpertise.options.find(opt => opt.value === val)?.label
                                  ).join(', ')})
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
                {/* Compliance & Professional Standards */}
                <Card className="border-2 border-gray-200 hover:border-orange-300 transition-colors" role="group" aria-labelledby="compliance-title">
                  <CardHeader className="pb-4">
                    <CardTitle id="compliance-title" className="flex items-center gap-2 text-xl">
                      <Shield className="w-5 h-5 text-orange-600" />
                      Compliance & Professional Standards
                      <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Please answer the following questions regarding your professional compliance and standing.</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="compliance.professionalLiabilityInsurance"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Do you have professional liability insurance for online practice? <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="compliance.professionalLiabilityInsurance"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                                className="grid grid-cols-1 gap-3 mt-3"
                              >
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="yes" id="liability-yes" className="text-orange-600" />
                                  <Label htmlFor="liability-yes" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Yes</div>
                                    <div className="text-sm text-gray-500">I have active professional liability insurance</div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="no" id="liability-no" className="text-orange-600" />
                                  <Label htmlFor="liability-no" className="flex-1 cursor-pointer">
                                    <div className="font-medium">No</div>
                                    <div className="text-sm text-gray-500">I do not have liability insurance</div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="willing" id="liability-willing" className="text-orange-600" />
                                  <Label htmlFor="liability-willing" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Not yet, but willing to secure</div>
                                    <div className="text-sm text-gray-500">I am willing to obtain insurance before starting practice</div>
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
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-900">
                            Have you ever had complaints or disciplinary actions against your PRC license? <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            control={form.control}
                            name="compliance.complaintsOrDisciplinaryActions"
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                name={field.name}
                                className="grid grid-cols-1 gap-3 mt-3"
                              >
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="no" id="complaints-no" className="text-orange-600" />
                                  <Label htmlFor="complaints-no" className="flex-1 cursor-pointer">
                                    <div className="font-medium">No</div>
                                    <div className="text-sm text-gray-500">No complaints or disciplinary actions</div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <RadioGroupItem value="yes" id="complaints-yes" className="text-orange-600" />
                                  <Label htmlFor="complaints-yes" className="flex-1 cursor-pointer">
                                    <div className="font-medium">Yes (please briefly explain)</div>
                                    <div className="text-sm text-gray-500">I will provide details below</div>
                                  </Label>
                                </div>
                              </RadioGroup>
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Explanation field if complaints = yes */}
                    {complaintsOrDisciplinaryActions === "yes" && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <FormField
                          control={form.control}
                          name="compliance.complaintsOrDisciplinaryActions_specify"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-gray-900">
                                Please briefly explain the nature and resolution <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Please provide details about the complaint or disciplinary action and how it was resolved..."
                                  className="mt-2 bg-white border-yellow-300 focus:border-yellow-500"
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
                        name="compliance.willingToAbideByPlatformGuidelines"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-900">
                              Are you willing to abide by our platform&apos;s ethical guidelines, privacy policies, and patient safety standards? <span className="text-red-500">*</span>
                            </FormLabel>
                            <Controller
                              control={form.control}
                              name="compliance.willingToAbideByPlatformGuidelines"
                              render={({ field }) => (
                                <RadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  name={field.name}
                                  className="grid grid-cols-1 gap-3 mt-3"
                                >
                                  <div className="flex items-center space-x-3 p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                    <RadioGroupItem value="yes" id="guidelines-yes" className="text-green-600" />
                                    <Label htmlFor="guidelines-yes" className="flex-1 cursor-pointer">
                                      <div className="font-medium text-green-900">Yes, I agree</div>
                                      <div className="text-sm text-green-700">I commit to following all platform guidelines and standards</div>
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-3 p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    <RadioGroupItem value="no" id="guidelines-no" className="text-red-600" />
                                    <Label htmlFor="guidelines-no" className="flex-1 cursor-pointer">
                                      <div className="font-medium text-red-900">No</div>
                                      <div className="text-sm text-red-700">I do not agree to abide by the guidelines</div>
                                    </Label>
                                  </div>
                                </RadioGroup>
                              )}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                {/* Submit Section */}
                <Card className="border-2 border-green-200 bg-green-50" role="group" aria-labelledby="submit-section-title">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-green-800 mb-4">
                        <CheckCircle className="w-5 h-5" />
                        <span id="submit-section-title" className="font-semibold">Ready to Continue?</span>
                      </div>
                      <p className="text-sm text-green-700 mb-6">
                        Please review your information above. You can return to edit these details later if needed.
                      </p>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving Profile...
                          </>
                        ) : (
                          <>
                            Save and Continue to Document Upload
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-3">
                        Next: Upload required documents and complete your application
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
}
