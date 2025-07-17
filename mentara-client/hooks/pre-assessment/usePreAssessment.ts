import { usePreAssessmentChecklistStore, useSignUpStore } from "@/store/pre-assessment";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { answersToAnswerMatrix } from "@/lib/questionnaire";

export function usePreAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const { questionnaires, answers } = usePreAssessmentChecklistStore();
  const { setDetails } = useSignUpStore();
  const { isLoaded, signUpWithEmail, signUpWithOAuth } = useAuth();

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
    if (!isLoaded) return;
    
    setIsLoading(true);
    try {
      storeAssessmentAnswers();
      setDetails({
        nickName: nickname,
        email: email,
      });

      // Use local auth with basic registration data
      const registrationData = {
        email,
        password,
        firstName: nickname, // Use nickname as firstName for compatibility
        lastName: '',
      };

      await signUpWithEmail(registrationData, {
        preAssessmentAnswers: answersToAnswerMatrix(questionnaires, answers),
        source: "preAssessment",
        sendEmailVerification: true,
      });

      return true;
    } catch (error: any) {
      toast.error(`Failed to sign up: ${error?.message || error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_microsoft") => {
    if (!isLoaded) return;
    
    setIsLoading(true);
    try {
      storeAssessmentAnswers();
      toast.info(`Signing in with ${provider === "oauth_google" ? "Google" : "Microsoft"}...`);

      await signUpWithOAuth(provider, {
        hasPreAssessmentData: true,
        redirectPath: "/user/welcome",
      });

      return true;
    } catch (error: any) {
      toast.error(`Failed to sign up with ${provider}: ${error?.message || error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignUp,
    handleOAuthSignUp,
    storeAssessmentAnswers,
  };
} 