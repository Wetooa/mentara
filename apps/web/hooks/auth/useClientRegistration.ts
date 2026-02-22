import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { answersToAnswerMatrix } from "@/lib/questionnaire";
import { extractErrorMessage } from "@/lib/api/errorHandler";

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
  const { flatAnswers, questionnaires, sessionId } = usePreAssessmentChecklistStore();

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
      // Check for chatbot pre-assessment results in localStorage
      let preassessmentAnswers: number[] | undefined = undefined;
      let chatbotSessionId: string | undefined = undefined;

      try {
        const chatbotResultsStr = localStorage.getItem('preassessment_chatbot_results');
        if (chatbotResultsStr) {
          const chatbotResults = JSON.parse(chatbotResultsStr);
          chatbotSessionId = chatbotResults.sessionId;

          // Use the converted answers array if available (stored when completing session)
          if (chatbotResults.answers && Array.isArray(chatbotResults.answers)) {
            preassessmentAnswers = chatbotResults.answers as number[];
            console.log('[Registration] Using chatbot pre-assessment answers from localStorage:', preassessmentAnswers.length, 'answers');
          } else {
            console.warn('[Registration] Chatbot results found but no answers array. Session ID:', chatbotSessionId);
          }
        }
      } catch (localStorageError) {
        console.warn('[Registration] Error reading chatbot results from localStorage:', localStorageError);
      }

      // If no chatbot results and no sessionId, check checklist store
      if (!preassessmentAnswers && !chatbotSessionId && !sessionId) {
        preassessmentAnswers =
          flatAnswers.length > 0
            ? answersToAnswerMatrix(questionnaires, flatAnswers)
            : undefined;
      }

      const finalSessionId = chatbotSessionId || sessionId || undefined;

      console.log("Pre-assessment answers:", preassessmentAnswers);
      console.log("Registration answers:", flatAnswers);
      console.log("Registration data:", data);
      console.log("Session ID (Chatbot/Checklist):", finalSessionId);

      const result = await api.auth.client.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: new Date().toISOString(), // You may want to collect this from the user
        preassessmentAnswers: preassessmentAnswers as number[] | undefined,
        sessionId: finalSessionId,
      });

      setRegistrationStatus("registered");
      setRegistrationData(data);
      setCurrentStep("verification");

      // Clear chatbot results from localStorage or Zustand store after successful registration
      // The session will be linked after email verification and login
      if (finalSessionId) {
        // Keep sessionId in registrationData for later linking
        (data as any).chatbotSessionId = finalSessionId;
        localStorage.removeItem('preassessment_chatbot_results');
        console.log('[Registration] Cleared chatbot results from localStorage. Session will be linked after verification.');
      }

      // Show appropriate success message based on whether preassessment data was included
      const successMessage = preassessmentAnswers || finalSessionId
        ? "Registration and pre-assessment completed! Please check your email for the verification code."
        : "Registration successful! Please check your email for the verification code.";

      toast.success(successMessage);
    } catch (error: unknown) {
      setRegistrationStatus("error");

      // Extract user-friendly error message
      const errorMessage = extractErrorMessage(error) || "Registration failed. Please try again.";

      // Show user-friendly error message in toast
      toast.error("Registration failed", {
        description: errorMessage,
      });

      // Only log error message (not full error object) in development to avoid console spam
      if (process.env.NODE_ENV === "development") {
        console.debug("[Registration] Error:", errorMessage);
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
      const result = await api.auth.client.verifyOtp({
        email: registrationData.email,
        otpCode: code,
      });

      if (result.success === true) {
        setRegistrationStatus("verified");
        toast.success("Email verified successfully! Welcome to Mentara!");

        // Call success callback
        onSuccess?.();

        // Redirect to client area (layout will handle routing)
        router.push("/auth/sign-in");
      } else {
        toast.error(result.message || "Verification failed. Please try again.");
      }
    } catch (error: unknown) {
      // Extract user-friendly error message
      const errorMessage = extractErrorMessage(error) || "Verification failed. Please try again.";

      toast.error("Verification failed", {
        description: errorMessage,
      });

      // Only log error message in development
      if (process.env.NODE_ENV === "development") {
        console.debug("[Verification] Error:", errorMessage);
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
      const result = await api.auth.client.resendOtp({
        email: registrationData.email,
        type: "email_verification",
      });

      if (result.success === true) {
        toast.success("Verification code sent! Please check your inbox.", {
          id: "resend-otp",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: unknown) {
      // Extract user-friendly error message
      const errorMessage = extractErrorMessage(error) || "Failed to resend verification code.";

      toast.error("Failed to resend code", {
        description: errorMessage,
        id: "resend-otp",
      });

      // Only log error message in development
      if (process.env.NODE_ENV === "development") {
        console.debug("[Resend OTP] Error:", errorMessage);
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
