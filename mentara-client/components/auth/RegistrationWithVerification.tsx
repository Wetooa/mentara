"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Shield,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmailVerificationForm } from "./EmailVerificationForm";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
  role: z.enum(["client", "therapist"]).default("client"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface RegistrationWithVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultRole?: "client" | "therapist";
  className?: string;
}

export function RegistrationWithVerification({
  onSuccess,
  onCancel,
  defaultRole = "client",
  className
}: RegistrationWithVerificationProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<"registration" | "verification">("registration");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationForm | null>(null);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: defaultRole,
      termsAccepted: false,
    },
  });

  const handleRegistrationSubmit = async (data: RegistrationForm) => {
    setIsLoading(true);
    
    try {
      // Simulate API call to prepare registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store registration data and move to verification step
      setRegistrationData(data);
      setCurrentStep("verification");
      
      toast.success("Please check your email for the verification code!");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async (code: string) => {
    if (!registrationData) return;

    setIsLoading(true);
    
    try {
      // Simulate API call to complete registration with OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would call your API with registrationData and code
      console.log("Completing registration with:", { ...registrationData, otpCode: code });
      
      toast.success("Registration completed successfully!");
      
      // Redirect to appropriate dashboard or onboarding
      if (registrationData.role === "client") {
        router.push("/onboarding");
      } else {
        router.push("/therapist/dashboard");
      }
      
      onSuccess?.();
    } catch (error) {
      toast.error("Registration completion failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    setCurrentStep("registration");
    setRegistrationData(null);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.watch("password") || "");
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <AnimatePresence mode="wait">
        {currentStep === "registration" ? (
          <motion.div
            key="registration"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white"
                >
                  <UserPlus className="h-8 w-8" />
                </motion.div>
                
                <div>
                  <CardTitle className="text-2xl font-bold">Join Mentara</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Create your account to start your mental health journey
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Step 1 of 2</span>
                    <span>Account Information</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleRegistrationSubmit)} className="space-y-4">
                    {/* Role Selection */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I want to join as a</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="client">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>Client - Seeking support</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="therapist">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  <span>Therapist - Providing care</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          
                          {/* Password Strength */}
                          {form.watch("password") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Password strength:</span>
                                <Badge variant={passwordStrength >= 3 ? "default" : "secondary"}>
                                  {strengthLabels[passwordStrength]}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "h-1 flex-1 rounded-full",
                                      i < passwordStrength ? strengthColors[passwordStrength] : "bg-muted"
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
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm leading-relaxed">
                              I agree to the{" "}
                              <a href="/terms" className="text-primary hover:underline">
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a href="/privacy" className="text-primary hover:underline">
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
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {/* Progress Header */}
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Step 2 of 2</span>
                    <span>Email Verification</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </Card>

              {/* Verification Form */}
              <EmailVerificationForm
                email={registrationData?.email || ""}
                name={`${registrationData?.firstName} ${registrationData?.lastName}`}
                type="registration"
                onVerificationSuccess={handleVerificationSuccess}
                onCancel={handleBackToRegistration}
              />

              {/* Back Button */}
              <Button
                variant="outline"
                onClick={handleBackToRegistration}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Registration
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RegistrationWithVerification;