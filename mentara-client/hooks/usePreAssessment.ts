import { usePreAssessmentChecklistStore, useSignUpStore } from "@/store/pre-assessment";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import { answersToAnswerMatrix } from "@/lib/questionnaire";

export function usePreAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const { questionnaires, answers } = usePreAssessmentChecklistStore();
  const { setDetails } = useSignUpStore();
  const { isLoaded, signUp } = useSignUp();

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
    if (!isLoaded || !signUp) return;
    
    setIsLoading(true);
    try {
      storeAssessmentAnswers();
      setDetails({
        nickName: nickname,
        email: email,
      });

      await signUp.create({
        emailAddress: email,
        password: password,
      });

      const protocol = window.location.protocol;
      const host = window.location.host;

      toast.info("Sending verification email...");
      signUp.createEmailLinkFlow().startEmailLinkFlow({
        redirectUrl: `${protocol}//${host}/sign-up/verify`,
      });

      return true;
    } catch (error) {
      toast.error(`Failed to sign up: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_microsoft") => {
    if (!isLoaded || !signUp) return;
    
    setIsLoading(true);
    try {
      storeAssessmentAnswers();
      toast.info(`Signing in with ${provider === "oauth_google" ? "Google" : "Microsoft"}...`);

      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/user/welcome",
      });

      return true;
    } catch (error) {
      toast.error(`Failed to sign up with ${provider}: ${error.message}`);
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