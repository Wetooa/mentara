"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useForm, FormProvider, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  FileText, 
  Users, 
  Clock, 
  Shield, 
  Upload,
  User,
  Save,
  Loader2,
  AlertCircle,
  Check
} from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Store and API
import useTherapistForm from "@/store/therapistform";
import { useToast } from "@/contexts/ToastContext";
import { therapistProfileFormFields } from "@/constants/therapist_application";
import PROVIDER_TYPE from "@/constants/provider";
import PHILIPPINE_PROVINCES from "@/constants/provinces";

// Comprehensive Zod Schema for all form sections
const unifiedTherapistSchema = z.object({
  // Basic Information (from signup page)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z.string().min(1, "Mobile number is required").regex(/^(09|\+639)\d{9}$/, "Invalid PH mobile number"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  province: z.string().min(1, "Province is required"),
  providerType: z.string().min(1, "Provider type is required"),

  // Professional License Information
  professionalLicenseType: z.string().min(1, "Please select your professional license type"),
  professionalLicenseType_specify: z.string().optional().refine(
    (val, ctx) => {
      if (ctx.parent.professionalLicenseType === "other") {
        return val && val.length > 0;
      }
      return true;
    },
    { message: "Please specify your license type" }
  ),
  isPRCLicensed: z.string().min(1, "Please indicate if you are PRC-licensed"),
  prcLicenseNumber: z.string().optional().refine(
    (val, ctx) => {
      if (ctx.parent.isPRCLicensed === "yes") {
        return val && /^[0-9]{7}$/.test(val);
      }
      return true;
    },
    { message: "Please enter a valid 7-digit PRC license number" }
  ),
  expirationDateOfLicense: z.string().optional().refine(
    (val, ctx) => {
      if (ctx.parent.isPRCLicensed === "yes") {
        return val && val.length > 0;
      }
      return true;
    },
    { message: "Please enter the license expiration date" }
  ),
  isLicenseActive: z.string().optional().refine(
    (val, ctx) => {
      if (ctx.parent.isPRCLicensed === "yes") {
        return val && val.length > 0;
      }
      return true;
    },
    { message: "Please confirm the status of your license" }
  ),

  // Teletherapy Readiness
  teletherapyReadiness: z.object({
    providedOnlineTherapyBefore: z.string().min(1, "Please answer this question"),
    comfortableUsingVideoConferencing: z.string().min(1, "Please answer this question"),
    privateConfidentialSpace: z.string().min(1, "Please answer this question"),
    compliesWithDataPrivacyAct: z.string().min(1, "Please confirm compliance with the Data Privacy Act"),
  }),

  // Areas of Expertise
  areasOfExpertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),

  // Compliance
  compliance: z.object({
    professionalLiabilityInsurance: z.string().min(1, "Please answer regarding liability insurance"),
    complaintsOrDisciplinaryActions: z.string().min(1, "Please answer regarding complaints history"),
    complaintsOrDisciplinaryActions_specify: z.string().optional().refine(
      (val, ctx) => {
        if (ctx.parent.complaintsOrDisciplinaryActions === "yes") {
          return val && val.length >= 10;
        }
        return true;
      },
      { message: "Please provide a brief explanation (min. 10 characters)" }
    ),
    willingToAbideByPlatformGuidelines: z.string().refine((val) => val === "yes", {
      message: "You must agree to abide by the platform guidelines to proceed",
    }),
  }),

  // Document Upload flags (documents themselves handled separately)
  documentsUploaded: z.object({
    prcLicense: z.boolean(),
    nbiClearance: z.boolean(), 
    resumeCV: z.boolean(),
  }),

  // Consent
  consentChecked: z.boolean().refine((val) => val === true, {
    message: "You must certify that the documents are authentic",
  }),
});

type UnifiedTherapistForm = z.infer<typeof unifiedTherapistSchema>;

// Section completion tracking
interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  estimatedTime: string;
  fields: string[];
  isRequired: boolean;
}

const sections: Section[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    icon: <User className="w-5 h-5" />,
    description: "Your personal details and contact information",
    estimatedTime: "2-3 minutes",
    fields: ["firstName", "lastName", "mobile", "email", "province", "providerType"],
    isRequired: true,
  },
  {
    id: "professionalProfile", 
    title: "Professional Profile",
    icon: <FileText className="w-5 h-5" />,
    description: "Your professional qualifications and licensing information",
    estimatedTime: "5-8 minutes", 
    fields: [
      "professionalLicenseType",
      "isPRCLicensed", 
      "teletherapyReadiness",
      "areasOfExpertise",
      "compliance"
    ],
    isRequired: true,
  },
  {
    id: "documents",
    title: "Document Upload",
    icon: <Upload className="w-5 h-5" />,
    description: "Upload required professional documents and certifications",
    estimatedTime: "3-5 minutes",
    fields: ["documentsUploaded"],
    isRequired: true,
  },
  {
    id: "review",
    title: "Review & Submit",
    icon: <CheckCircle className="w-5 h-5" />,
    description: "Review your application and submit for verification",
    estimatedTime: "2-3 minutes",
    fields: ["consentChecked"],
    isRequired: true,
  },
];

export default function SinglePageTherapistApplication() {
  const router = useRouter();
  const { showToast } = useToast();
  const { updateField, updateNestedField, documents, updateDocuments, removeDocument } = useTherapistForm();
  
  // Section state management
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["basicInfo"]));
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Form setup
  const form = useForm<UnifiedTherapistForm>({
    resolver: zodResolver(unifiedTherapistSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      province: "",
      providerType: "",
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
      documentsUploaded: {
        prcLicense: false,
        nbiClearance: false,
        resumeCV: false,
      },
      consentChecked: false,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Watch form values for conditional rendering
  const watchedValues = useWatch({ control: form.control });
  const { professionalLicenseType, isPRCLicensed, compliance } = watchedValues;

  // Calculate completion status
  const getSectionCompletion = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return { completed: 0, total: 0, percentage: 0 };

    const values = form.getValues();
    let completed = 0;
    let total = section.fields.length;

    // Custom completion logic for each section
    switch (sectionId) {
      case "basicInfo":
        const basicFields = ["firstName", "lastName", "mobile", "email", "province", "providerType"];
        completed = basicFields.filter(field => values[field] && values[field] !== "").length;
        total = basicFields.length;
        break;
      
      case "professionalProfile":
        // Count main fields
        if (values.professionalLicenseType) completed++;
        if (values.isPRCLicensed) completed++;
        if (values.teletherapyReadiness?.providedOnlineTherapyBefore) completed++;
        if (values.areasOfExpertise?.length > 0) completed++;
        if (values.compliance?.willingToAbideByPlatformGuidelines === "yes") completed++;
        total = 5;
        break;

      case "documents":
        const requiredDocs = ["prcLicense", "nbiClearance", "resumeCV"];
        completed = requiredDocs.filter(doc => documents[doc]?.length > 0).length;
        total = requiredDocs.length;
        break;

      case "review":
        completed = values.consentChecked ? 1 : 0;
        total = 1;
        break;
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [form, documents]);

  // Overall progress calculation
  const overallProgress = useMemo(() => {
    const sectionProgresses = sections.map(section => getSectionCompletion(section.id));
    const totalCompleted = sectionProgresses.reduce((sum, prog) => sum + prog.completed, 0);
    const totalFields = sectionProgresses.reduce((sum, prog) => sum + prog.total, 0);
    return totalFields > 0 ? Math.round((totalCompleted / totalFields) * 100) : 0;
  }, [getSectionCompletion]);

  // Section toggle handler
  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Auto-save functionality
  const autoSave = useCallback((values: UnifiedTherapistForm) => {
    try {
      // Save to Zustand store
      Object.entries(values).forEach(([key, value]) => {
        if (key === "teletherapyReadiness" || key === "compliance") {
          Object.entries(value).forEach(([subKey, subValue]) => {
            updateNestedField(key, subKey, subValue);
          });
        } else {
          updateField(key, value);
        }
      });
      
      setLastSavedAt(new Date());
      showToast("Draft saved automatically", "info", 2000);
    } catch (error) {
      console.error("Error auto-saving:", error);
      showToast("Failed to save draft", "error");
    }
  }, [updateField, updateNestedField, showToast]);

  // Submit handler
  const onSubmit = useCallback(async (values: UnifiedTherapistForm) => {
    setIsSubmitting(true);
    try {
      // Save all data
      autoSave(values);
      
      showToast("Application submitted successfully!", "success");
      
      // Navigate to sign-in page after successful submission
      setTimeout(() => {
        router.push("/sign-in?message=application-submitted");
      }, 1500);
    } catch (error) {
      console.error("Error submitting application:", error);
      showToast("Failed to submit application. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [autoSave, router, showToast]);

  return (
    <div className="w-full min-h-screen flex bg-gray-50">
      {/* Left Sidebar */}
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

        {/* Overall Progress */}
        <div className="mb-6" data-testid="overall-progress">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Section List */}
        <div className="space-y-3 flex-1">
          {sections.map((section) => {
            const completion = getSectionCompletion(section.id);
            const isOpen = openSections.has(section.id);
            const isCompleted = completion.percentage === 100;
            
            return (
              <div
                key={section.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isOpen
                    ? "bg-green-100 border-green-300"
                    : isCompleted
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 ${isCompleted ? "text-green-600" : "text-gray-400"}`}>
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {section.title}
                      </h3>
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {completion.completed}/{completion.total} complete
                      </span>
                      <span className="text-xs text-gray-500">
                        {completion.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Auto-save status */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            {lastSavedAt ? (
              <>
                <Save className="w-3 h-3 text-green-600" />
                <span className="text-green-600">
                  Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            ) : (
              <>
                <Circle className="w-3 h-3" />
                <span>Not saved yet</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} Mentara. All rights reserved.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-4/5 flex justify-center p-8" data-testid="main-content">
        <div className="w-full max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Therapist Application
            </h1>
            <p className="text-gray-600">
              Complete all sections below to submit your application to join the Mentara therapist network.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Render each section as collapsible */}
              {sections.map((section) => (
                <SectionComponent
                  key={section.id}
                  section={section}
                  isOpen={openSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                  completion={getSectionCompletion(section.id)}
                  form={form}
                  watchedValues={watchedValues}
                  documents={documents}
                  updateDocuments={updateDocuments}
                  removeDocument={removeDocument}
                />
              ))}

              {/* Submit Button */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-800 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Ready to Submit?</span>
                    </div>
                    <p className="text-sm text-green-700 mb-6">
                      Please review your information above before submitting your application.
                    </p>
                    <Button
                      type="submit"
                      disabled={isSubmitting || overallProgress < 100}
                      className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          Submit Application
                        </>
                      )}
                    </Button>
                    {overallProgress < 100 && (
                      <p className="text-sm text-gray-500">
                        Please complete all required sections before submitting.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

// Individual Section Component with full form implementations
function SectionComponent({ 
  section, 
  isOpen, 
  onToggle, 
  completion, 
  form, 
  watchedValues,
  documents,
  updateDocuments,
  removeDocument
}) {
  const { showToast } = useToast();

  const handleFileChange = useCallback((docType: string, files: FileList | null) => {
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
      (file) => allowedTypes.includes(file.type) && file.size <= maxSizeMB * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      showToast("Some files were invalid (type or size) and were not added", "warning");
    }

    updateDocuments(docType, [...documents[docType], ...validFiles]);
  }, [documents, updateDocuments, showToast]);

  const handleRemoveFile = useCallback((docType: string, index: number) => {
    removeDocument(docType, index);
  }, [removeDocument]);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="border-2 border-gray-200 hover:border-green-300 transition-colors">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${completion.percentage === 100 ? "text-green-600" : "text-gray-400"}`}>
                  {section.icon}
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {section.title}
                    {section.isRequired && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {completion.completed}/{completion.total} complete
                  </div>
                  <div className="text-xs text-gray-500">{section.estimatedTime}</div>
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
              <BasicInformationSection form={form} />
            )}
            {section.id === "professionalProfile" && (
              <ProfessionalProfileSection form={form} watchedValues={watchedValues} />
            )}
            {section.id === "documents" && (
              <DocumentUploadSection 
                documents={documents}
                onFileChange={handleFileChange}
                onRemoveFile={handleRemoveFile}
              />
            )}
            {section.id === "review" && (
              <ReviewSection form={form} watchedValues={watchedValues} documents={documents} />
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Basic Information Section Component
function BasicInformationSection({ form }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
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
          control={form.control}
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
        control={form.control}
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
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              Email Address <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your email address" type="email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
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
          control={form.control}
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
                      <SelectItem key={type} value={type}>
                        {type}
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
}

// Professional Profile Section Component 
function ProfessionalProfileSection({ form, watchedValues }) {
  const { professionalLicenseType, isPRCLicensed, compliance } = watchedValues;

  return (
    <div className="space-y-8">
      {/* Professional License Information */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            Professional License Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="professionalLicenseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  What is your professional license type? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="rpsy" id="rpsy" />
                      <Label htmlFor="rpsy" className="flex-1 cursor-pointer">
                        <div className="font-medium">RPsy (Registered Psychologist)</div>
                        <div className="text-sm text-gray-500">Licensed to practice psychology</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="rpm" id="rpm" />
                      <Label htmlFor="rpm" className="flex-1 cursor-pointer">
                        <div className="font-medium">RPm (Registered Psychometrician)</div>
                        <div className="text-sm text-gray-500">Licensed to administer psychological tests</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="rgc" id="rgc" />
                      <Label htmlFor="rgc" className="flex-1 cursor-pointer">
                        <div className="font-medium">RGC (Registered Guidance Counselor)</div>
                        <div className="text-sm text-gray-500">Licensed to provide guidance and counseling</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="flex-1 cursor-pointer">
                        <div className="font-medium">Others (Please specify)</div>
                        <div className="text-sm text-gray-500">Other recognized mental health license</div>
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
              control={form.control}
              name="professionalLicenseType_specify"
              render={({ field }) => (
                <FormItem className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FormLabel className="text-base font-semibold">
                    Please specify your license type <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Licensed Professional Counselor" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="isPRCLicensed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Are you PRC-licensed? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="yes" id="prc-yes" />
                      <Label htmlFor="prc-yes" className="cursor-pointer font-medium">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="no" id="prc-no" />
                      <Label htmlFor="prc-no" className="cursor-pointer font-medium">No</Label>
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
                <h3 className="text-lg font-semibold text-green-900">PRC License Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prcLicenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        PRC License Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1234567" />
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
                      <FormLabel className="font-semibold">
                        License Expiration Date <span className="text-red-500">*</span>
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
                control={form.control}
                name="isLicenseActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Is your license currently active and in good standing? <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                        <div className="flex items-center space-x-3 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50">
                          <RadioGroupItem value="yes" id="active-yes" />
                          <Label htmlFor="active-yes" className="cursor-pointer font-medium">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-50">
                          <RadioGroupItem value="no" id="active-no" />
                          <Label htmlFor="active-no" className="cursor-pointer font-medium">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teletherapy Readiness */}
      <Card className="border border-purple-200 bg-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-purple-600" />
            Teletherapy Readiness Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              name: "teletherapyReadiness.providedOnlineTherapyBefore",
              label: "Have you provided online therapy before?",
              id: "online-therapy"
            },
            {
              name: "teletherapyReadiness.comfortableUsingVideoConferencing", 
              label: "Are you comfortable using secure video conferencing tools (e.g., Zoom, Google Meet)?",
              id: "video-conferencing"
            },
            {
              name: "teletherapyReadiness.privateConfidentialSpace",
              label: "Do you have a private and confidential space for conducting virtual sessions?",
              id: "private-space"
            },
            {
              name: "teletherapyReadiness.compliesWithDataPrivacyAct",
              label: "Do you comply with the Philippine Data Privacy Act (RA 10173)?",
              id: "privacy-act"
            }
          ].map((item, index) => (
            <FormField
              key={item.name}
              control={form.control}
              name={item.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    {item.label} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                      <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="yes" id={`${item.id}-yes`} />
                        <Label htmlFor={`${item.id}-yes`} className="cursor-pointer font-medium">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="no" id={`${item.id}-no`} />
                        <Label htmlFor={`${item.id}-no`} className="cursor-pointer font-medium">No</Label>
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

      {/* Areas of Expertise */}
      <Card className="border border-orange-200 bg-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-orange-600" />
            Areas of Expertise
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select all areas where you have professional experience and training. You must select at least one area.
          </p>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="areasOfExpertise"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {therapistProfileFormFields.areasOfExpertise.options.map((option) => (
                    <Label
                      key={option.value}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 cursor-pointer transition-colors group"
                    >
                      <Checkbox
                        checked={field.value?.includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, option.value]);
                          } else {
                            field.onChange(field.value.filter((v) => v !== option.value));
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
                  ))}
                </div>
                <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Selected:</strong> {field.value?.length || 0} area{field.value?.length !== 1 ? 's' : ''}
                    {field.value?.length > 0 && (
                      <span className="ml-2 text-orange-600">
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
            name="compliance.professionalLiabilityInsurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Do you have professional liability insurance for online practice? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 gap-3">
                    {[
                      { value: "yes", label: "Yes", description: "I have active professional liability insurance" },
                      { value: "no", label: "No", description: "I do not have liability insurance" },
                      { value: "willing", label: "Not yet, but willing to secure", description: "I am willing to obtain insurance before starting practice" }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option.value} id={`liability-${option.value}`} />
                        <Label htmlFor={`liability-${option.value}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
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
            name="compliance.complaintsOrDisciplinaryActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Have you ever had complaints or disciplinary actions against your PRC license? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="no" id="complaints-no" />
                      <Label htmlFor="complaints-no" className="flex-1 cursor-pointer">
                        <div className="font-medium">No</div>
                        <div className="text-sm text-gray-500">No complaints or disciplinary actions</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="yes" id="complaints-yes" />
                      <Label htmlFor="complaints-yes" className="flex-1 cursor-pointer">
                        <div className="font-medium">Yes (please briefly explain)</div>
                        <div className="text-sm text-gray-500">I will provide details below</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {compliance?.complaintsOrDisciplinaryActions === "yes" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <FormField
                control={form.control}
                name="compliance.complaintsOrDisciplinaryActions_specify"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Please briefly explain the nature and resolution <span className="text-red-500">*</span>
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
              name="compliance.willingToAbideByPlatformGuidelines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Are you willing to abide by our platform's ethical guidelines, privacy policies, and patient safety standards? <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 gap-3">
                      <div className="flex items-center space-x-3 p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100">
                        <RadioGroupItem value="yes" id="guidelines-yes" />
                        <Label htmlFor="guidelines-yes" className="flex-1 cursor-pointer">
                          <div className="font-medium text-green-900">Yes, I agree</div>
                          <div className="text-sm text-green-700">I commit to following all platform guidelines and standards</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100">
                        <RadioGroupItem value="no" id="guidelines-no" />
                        <Label htmlFor="guidelines-no" className="flex-1 cursor-pointer">
                          <div className="font-medium text-red-900">No</div>
                          <div className="text-sm text-red-700">I do not agree to abide by the guidelines</div>
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
}

// Document Upload Section Component
function DocumentUploadSection({ documents, onFileChange, onRemoveFile }) {
  const requiredDocs = [
    { key: "prcLicense", title: "PRC License", description: "Upload a clear copy of your valid PRC license" },
    { key: "nbiClearance", title: "NBI Clearance", description: "Upload your NBI clearance (issued within the last 6 months)" },
    { key: "resumeCV", title: "Resume/CV", description: "Upload your professional resume or curriculum vitae" }
  ];

  const optionalDocs = [
    { key: "liabilityInsurance", title: "Professional Liability Insurance", description: "If applicable, upload a copy of your professional liability insurance" },
    { key: "birForm", title: "BIR Form 2303 / Certificate of Registration", description: "Optional: Upload for tax reporting and payment processing" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Documents</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please upload the following documents to complete your application. All documents must be clear and legible. 
          Accepted formats: PDF, JPG, PNG, DOCX (Max 10MB each).
        </p>
        
        <div className="space-y-6">
          {requiredDocs.map((doc) => (
            <DocumentUploadCard
              key={doc.key}
              title={doc.title}
              description={doc.description}
              required={true}
              files={documents[doc.key] || []}
              onFileChange={(files) => onFileChange(doc.key, files)}
              onRemoveFile={(index) => onRemoveFile(doc.key, index)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Documents (Optional)</h3>
        <div className="space-y-6">
          {optionalDocs.map((doc) => (
            <DocumentUploadCard
              key={doc.key}
              title={doc.title}
              description={doc.description}
              required={false}
              files={documents[doc.key] || []}
              onFileChange={(files) => onFileChange(doc.key, files)}
              onRemoveFile={(index) => onRemoveFile(doc.key, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Document Upload Card Component
function DocumentUploadCard({ title, description, required, files, onFileChange, onRemoveFile }) {
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files);
    }
  }, [onFileChange]);

  return (
    <Card className={`border ${files.length > 0 ? "border-green-300 bg-green-50" : "border-gray-200"}`}>
      <CardContent className="p-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        <div className="p-5">
          {files && files.length > 0 ? (
            <div className="space-y-3">
              {Array.from(files).map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center min-w-0">
                    <FileText className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 ml-2"
                    onClick={() => onRemoveFile(index)}
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                type="button"
                className="w-full mt-3 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                onClick={() => document.getElementById(`file-input-${title}`).click()}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Additional File(s)
              </Button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-green-400 bg-white"
              onClick={() => document.getElementById(`file-input-${title}`).click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop your file(s) here, or
                </p>
                <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG or DOCX up to 10MB each</p>
              </div>
              <Button type="button" variant="outline" className="mt-4">
                Browse Files
              </Button>
            </div>
          )}
          <input
            id={`file-input-${title}`}
            type="file"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Review Section Component
function ReviewSection({ form, watchedValues, documents }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Application Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Name:</strong> {watchedValues.firstName} {watchedValues.lastName}</p>
            <p><strong>Email:</strong> {watchedValues.email}</p>
            <p><strong>Mobile:</strong> {watchedValues.mobile}</p>
            <p><strong>Province:</strong> {watchedValues.province}</p>
          </div>
          <div>
            <p><strong>License Type:</strong> {watchedValues.professionalLicenseType}</p>
            <p><strong>PRC Licensed:</strong> {watchedValues.isPRCLicensed}</p>
            <p><strong>Expertise Areas:</strong> {watchedValues.areasOfExpertise?.length || 0} selected</p>
            <p><strong>Documents:</strong> {Object.values(documents).reduce((sum, docs) => sum + docs.length, 0)} files uploaded</p>
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="consentChecked"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-gray-200 rounded-lg">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I certify that all documents uploaded are authentic and valid. I understand that providing false information may result in the rejection of my application.
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}