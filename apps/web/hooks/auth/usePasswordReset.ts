import { useState } from "react";
import { useApi } from "@/lib/api";
import { RequestPasswordResetDto, ResetPasswordDto } from "@/lib/api/types";

/**
 * Password reset hook for handling password reset flow
 * Follows the data flow pattern: page > components > hooks > lib/api axios > REST > backend controller
 */
export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const api = useApi();

  /**
   * Request password reset by email
   */
  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);

    try {
      const requestData: RequestPasswordResetDto = { email };
      return await api.auth.requestPasswordReset(requestData);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Validate reset token
   */
  const validateResetToken = async (token: string) => {
    setIsValidatingToken(true);

    try {
      return await api.auth.validateResetToken(token);
    } finally {
      setIsValidatingToken(false);
    }
  };

  /**
   * Reset password with token and new password
   */
  const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
    setIsLoading(true);

    try {
      const resetData: ResetPasswordDto = {
        token,
        newPassword,
        confirmPassword,
      };
      return await api.auth.resetPassword(resetData);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Methods
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    
    // Loading states
    isLoading,
    isValidatingToken,
  };
}