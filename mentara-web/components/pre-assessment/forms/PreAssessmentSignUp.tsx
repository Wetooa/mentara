"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmailVerificationForm } from "@/components/auth/EmailVerificationForm";
import { useClientRegistration } from "@/hooks/auth/useClientRegistration";

const clientRegistrationSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
    termsAccepted: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ClientRegistrationForm = z.infer<typeof clientRegistrationSchema>;

interface PreAssessmentSignUpProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function PreAssessmentSignUp({
  onSuccess,
  onCancel,
  className,
}: PreAssessmentSignUpProps) {
  // Use the client registration hook for ALL business logic
  const {
    isLoading,
    isVerifying,
    registrationStatus,
    currentStep,
    showPassword,
    showConfirmPassword,
    registrationData,
    setShowPassword,
    setShowConfirmPassword,
    handleBackToRegistration,
    handleRegistrationSubmit,
    handleVerificationSuccess,
    handleResendCode,
    getPasswordStrength,
  } = useClientRegistration(onSuccess);

  const form = useForm<ClientRegistrationForm>({
    resolver: zodResolver(clientRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const passwordStrength = getPasswordStrength(form.watch("password") || "");
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {currentStep === "registration" ? (
          <motion.div
            key="registration"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
              {/* Header */}
              <div className="text-center space-y-4 mb-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white shadow-lg"
                >
                  <User className="h-8 w-8" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Join Mentara
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Create your account to start your mental health journey
                  </p>
                </div>
              </div>

              {/* Registration Form */}
              <div className="space-y-4 max-w-lg mx-auto">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleRegistrationSubmit)}
                    className="space-y-4"
                  >
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
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
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date of Birth */}
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              max={new Date().toISOString().split("T")[0]}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>

                          {/* Password Strength */}
                          {form.watch("password") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Password strength:
                                </span>
                                <Badge
                                  variant={
                                    passwordStrength >= 3
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {strengthLabels[passwordStrength]}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "h-1 flex-1 rounded-full",
                                      i < passwordStrength
                                        ? strengthColors[passwordStrength]
                                        : "bg-muted"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Terms */}
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="flex-1 min-w-0">
                            <FormLabel className="text-sm leading-relaxed">
                              I agree to the{" "}
                              <a
                                href="/terms"
                                className="text-primary hover:underline"
                              >
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a
                                href="/privacy"
                                className="text-primary hover:underline"
                              >
                                Privacy Policy
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={
                        isLoading || registrationStatus === "registering"
                      }
                      className="w-full"
                    >
                      {isLoading || registrationStatus === "registering" ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="mr-2"
                          >
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Continue to Verification
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {onCancel && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    )}
                  </form>
                </Form>
              </div>
            </div>

            {/* Submit Button Footer */}
            <div className="bg-white px-10 py-3">
              <p className="text-xs text-center text-gray-500 mb-2">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Verification Form - No redundant progress bar */}
            <EmailVerificationForm
              email={registrationData?.email || ""}
              name={`${registrationData?.firstName} ${registrationData?.lastName}`}
              type="registration"
              onVerificationSuccess={handleVerificationSuccess}
              onCancel={handleBackToRegistration}
              onResendCode={handleResendCode}
              isVerifying={isVerifying}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PreAssessmentSignUp;
