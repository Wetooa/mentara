import { usePreAssessmentChecklistStore, useSignUpStore } from "@/store/pre-assessment";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { answersToAnswerMatrix } from "@/lib/questionnaire";

export function usePreAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const { questionnaires, answers } = usePreAssessmentChecklistStore();
  const { setDetails } = useSignUpStore();
  const { register, isLoading: authLoading } = useAuth();

  const storeAssessmentAnswers = () => {
    try {
      const answersList = answersToAnswerMatrix(questionnaires, answers);
      localStorage.setItem("assessmentAnswers", JSON.stringify(answersList));
    } catch (error) {
      toast.error("Failed to store assessment answers");
      console.error(error);
    }
  };

  const handleSignUp = async (email: string, password: string, nickname: string) => {
    setIsLoading(true);
    try {
      storeAssessmentAnswers();
      setDetails({
        nickName: nickname,
        email: email,
      });

      // Use JWT-based registration for client role
      const registrationData = {
        email,
        password,
        firstName: nickname, // Use nickname as firstName for compatibility
        lastName: '', // Empty last name - can be filled during onboarding
        role: 'client' as const,
      };

      // TODO: We need to extend the backend register endpoint to accept 
      // pre-assessment data. For now, store it in localStorage to be 
      // processed during onboarding.
      localStorage.setItem('pendingPreAssessmentData', JSON.stringify({
        answers: answersToAnswerMatrix(questionnaires, answers),
        source: "preAssessment",
        completedAt: new Date().toISOString(),
      }));

      await register(registrationData);

      return true;
    } catch (error: any) {
      toast.error(`Failed to sign up: ${error?.message || error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_microsoft") => {
    setIsLoading(true);
    try {
      storeAssessmentAnswers();
      toast.info(`Signing in with ${provider === "oauth_google" ? "Google" : "Microsoft"}...`);

      // TODO: OAuth signup integration needs to be implemented
      // The backend supports OAuth endpoints at /auth/google and /auth/microsoft
      // but the frontend AuthContext doesn't have OAuth methods yet.
      
      // Store pre-assessment data for OAuth flow
      localStorage.setItem('pendingPreAssessmentData', JSON.stringify({
        answers: answersToAnswerMatrix(questionnaires, answers),
        source: "preAssessment",
        completedAt: new Date().toISOString(),
      }));

      // For now, redirect to OAuth provider directly
      const oauthUrl = provider === "oauth_google" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
        : `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`;
      
      window.location.href = oauthUrl;

      return true;
    } catch (error: any) {
      toast.error(`Failed to sign up with ${provider}: ${error?.message || error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading: isLoading || authLoading,
    handleSignUp,
    handleOAuthSignUp,
    storeAssessmentAnswers,
  };
} 