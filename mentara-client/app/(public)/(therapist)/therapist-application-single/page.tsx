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
      
      // Navigate to confirmation page
      setTimeout(() => {
        router.push("/therapist-application/3");
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
        <div className="mb-6">
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
      <div className="w-4/5 flex justify-center p-8">
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

// Individual Section Component (to be implemented in the next step)
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
                  <CardTitle className="text-xl">{section.title}</CardTitle>
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
          <CardContent>
            {/* Section content will be implemented next */}
            <div className="p-8 text-center text-gray-500">
              Section content for {section.title} coming soon...
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}