import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";

/**
 * Client registration form data structure
 */
export interface ClientRegistrationData {
  /** Client's first name */
  firstName: string;
  /** Client's last name */
  lastName: string;
  /** Client's email address */
  email: string;
  /** Client's password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** Whether terms and conditions were accepted */
  termsAccepted: boolean;
}

/**
 * Return type for the useClientRegistration hook
 */
export interface UseClientRegistrationReturn {
  /** Whether registration request is in progress */
  isLoading: boolean;
  /** Whether email verification is in progress */
  isVerifying: boolean;
  /** Current registration process status */
  registrationStatus:
    | "idle"
    | "registering"
    | "registered"
    | "verified"
    | "error";

  /** Current step in the registration flow */
  currentStep: "registration" | "verification";
  /** Whether password field is visible */
  showPassword: boolean;
  /** Whether confirm password field is visible */
  showConfirmPassword: boolean;
  /** Registration data from successful registration */
  registrationData: ClientRegistrationData | null;

  /** Toggle password field visibility */
  setShowPassword: (show: boolean) => void;
  /** Toggle confirm password field visibility */
  setShowConfirmPassword: (show: boolean) => void;
  /** Return to registration step from verification */
  handleBackToRegistration: () => void;

  /** Submit registration form */
  handleRegistrationSubmit: (data: ClientRegistrationData) => Promise<void>;
  /** Handle successful email verification */
  handleVerificationSuccess: (code: string) => Promise<void>;
  /** Resend verification code */
  handleResendCode: () => Promise<void>;

  /** Calculate password strength score (0-5) */
  getPasswordStrength: (password: string) => number;
}

/**
 * Hook for managing client registration and email verification flow
 * 
 * This hook handles the complete client registration process including:
 * - Registration form submission with pre-assessment data
 * - Email verification with OTP codes
 * - Password strength validation
 * - UI state management for multi-step registration
 * - Error handling and user feedback
 * 
 * @param onSuccess - Optional callback to execute on successful registration
 * @returns Object containing registration state and handlers
 * 
 * @example
 * ```tsx
 * function ClientRegistrationForm() {
 *   const {
 *     isLoading,
 *     currentStep,
 *     handleRegistrationSubmit,
 *     handleVerificationSuccess
 *   } = useClientRegistration(() => {
 *     console.log('Registration completed successfully');
 *   });
 * 
 *   if (currentStep === 'verification') {
 *     return <VerificationStep onSuccess={handleVerificationSuccess} />;
 *   }
 * 
 *   return (
 *     <RegistrationForm 
 *       onSubmit={handleRegistrationSubmit}
 *       isLoading={isLoading}
 *     />
 *   );
 * }
 * ```
 * 
 * Features:
 * - Multi-step registration flow with email verification
 * - Pre-assessment data integration
 * - Password strength validation
 * - Automatic redirection to user dashboard
 * - Comprehensive error handling with user feedback
 * - OTP resend functionality
 */
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
      
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Registration error:", error);
      }
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

        // Redirect to client area (layout will handle routing)
        router.push("/user");
      } else {
        toast.error(result.message || "Verification failed. Please try again.");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Verification failed. Please try again.";
      toast.error(errorMessage);
      
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Verification error:", error);
      }
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
      
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Resend OTP error:", error);
      }
    }
  };

  /**
   * Calculate password strength score based on security criteria
   * 
   * @param password - The password to evaluate
   * @returns Score from 0-5 based on: length ≥8, lowercase, uppercase, digits, special chars
   */
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
