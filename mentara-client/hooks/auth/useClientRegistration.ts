import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";

export interface ClientRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface UseClientRegistrationReturn {
  // Loading states
  isLoading: boolean;
  isVerifying: boolean;
  registrationStatus:
    | "idle"
    | "registering"
    | "registered"
    | "verified"
    | "error";

  // UI state management
  currentStep: "registration" | "verification";
  showPassword: boolean;
  showConfirmPassword: boolean;
  registrationData: ClientRegistrationData | null;

  // UI actions
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  handleBackToRegistration: () => void;

  // Business logic
  handleRegistrationSubmit: (data: ClientRegistrationData) => Promise<void>;
  handleVerificationSuccess: (code: string) => Promise<void>;
  handleResendCode: () => Promise<void>;

  // Password strength utility
  getPasswordStrength: (password: string) => number;
}

export function useClientRegistration(
  onSuccess?: () => void
): UseClientRegistrationReturn {
  const api = useApi();
  const router = useRouter();
  const { answers, questionnaires } = usePreAssessmentChecklistStore();

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "registering" | "registered" | "verified" | "error"
  >("idle");

  // UI states
  const [currentStep, setCurrentStep] = useState<
    "registration" | "verification"
  >("registration");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationData, setRegistrationData] =
    useState<ClientRegistrationData | null>(null);

  // UI action handlers
  const handleBackToRegistration = () => {
    setCurrentStep("registration");
    setRegistrationData(null);
  };

  const handleRegistrationSubmit = async (
    data: ClientRegistrationData
  ): Promise<void> => {
    setIsLoading(true);
    setRegistrationStatus("registering");

    try {
      // Prepare preassessment answers if available
      const preassessmentAnswers = answers.length > 0 ? answers.flat() : undefined;

      // Call real backend registration API - this will automatically send OTP
      const result = await api.clientAuth.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date().toISOString(), // You may want to collect this from the user
        preassessmentAnswers,
      });

      setRegistrationStatus("registered");
      setRegistrationData(data);
      setCurrentStep("verification");
      
      // Show appropriate success message based on whether preassessment data was included
      const successMessage = preassessmentAnswers 
        ? "Registration and pre-assessment completed! Please check your email for the verification code."
        : "Registration successful! Please check your email for the verification code.";
      
      toast.success(successMessage);
    } catch (error: any) {
      setRegistrationStatus("error");
      const errorMessage =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async (code: string): Promise<void> => {
    if (!registrationData) return;

    setIsVerifying(true);

    try {
      // Call backend OTP verification API
      const result = await api.clientAuth.verifyOtp({
        email: registrationData.email,
        otpCode: code,
      });

      if (result.status === "success") {
        setRegistrationStatus("verified");
        toast.success("Email verified successfully! Welcome to Mentara!");

        // Call success callback
        onSuccess?.();

        // Redirect to client dashboard
        router.push("/user/dashboard");
      } else {
        toast.error(result.message || "Verification failed. Please try again.");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Verification failed. Please try again.";
      toast.error(errorMessage);
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (!registrationData) return;

    try {
      toast.loading("Resending verification code...", { id: "resend-otp" });

      // Call backend resend OTP API
      const result = await api.clientAuth.resendOtp({
        email: registrationData.email,
      });

      if (result.status === "success") {
        toast.success("Verification code sent! Please check your inbox.", {
          id: "resend-otp",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend verification code.";
      toast.error(errorMessage, { id: "resend-otp" });
      console.error("Resend OTP error:", error);
    }
  };

  // Password strength utility function
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  return {
    // Loading states
    isLoading,
    isVerifying,
    registrationStatus,

    // UI state
    currentStep,
    showPassword,
    showConfirmPassword,
    registrationData,

    // UI actions
    setShowPassword,
    setShowConfirmPassword,
    handleBackToRegistration,

    // Business logic
    handleRegistrationSubmit,
    handleVerificationSuccess,
    handleResendCode,

    // Utilities
    getPasswordStrength,
  };
}
