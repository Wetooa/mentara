import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { TOKEN_STORAGE_KEY } from "@/lib/constants/auth";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";

interface LoginCredentials {
  email: string;
  password: string;
  sessionId?: string;
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const api = useApi();
  const { sessionId: zustandSessionId } = usePreAssessmentChecklistStore();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      // Check for chatbot sessionId in localStorage
      let chatbotSessionId;
      try {
        const chatbotResultsStr = localStorage.getItem('preassessment_chatbot_results');
        if (chatbotResultsStr) {
          const chatbotResults = JSON.parse(chatbotResultsStr);
          chatbotSessionId = chatbotResults.sessionId;
        }
      } catch (err) {
        console.warn('Error reading chatbot results from localStorage', err);
      }

      // Merge sessionIds
      const finalSessionId = credentials.sessionId || chatbotSessionId || zustandSessionId || undefined;

      // Use universal login endpoint
      const response = await api.auth.login({
        ...credentials,
        sessionId: finalSessionId,
      });

      // Clear the local session storage now that it's linked
      if (finalSessionId) {
        localStorage.removeItem('preassessment_chatbot_results');
      }

      // Store only token in localStorage (secure)
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token || response.accessToken);

      // Keep loading state during redirect to show loading screen
      // Redirect immediately - AuthProvider will handle welcome page logic
      router.push(`/${response.user.role}`);

      // Don't clear loading state immediately - let the redirect happen
      // The loading state will be cleared when the component unmounts or redirect completes
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    // Note: Don't clear loading in finally - keep it true during redirect
  };

  return {
    login,
    isLoading,
  };
}
