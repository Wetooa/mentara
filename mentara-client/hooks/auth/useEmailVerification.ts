import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN = 60; // seconds

export interface UseEmailVerificationReturn {
  // Timer states
  timeLeft: number;
  isExpired: boolean;
  progressValue: number;

  // Resend states
  isSending: boolean;
  resendCooldown: number;

  // Actions
  handleResendCode: (onResendCode?: () => Promise<void>) => Promise<void>;
  handleVerifyCode: (
    code: string,
    onVerificationSuccess: (code: string) => Promise<void>,
    setFormError: (message: string) => void
  ) => Promise<void>;
  resetTimer: () => void;

  // Utilities
  formatTime: (seconds: number) => string;
  getTypeConfig: (
    type: "registration" | "password_reset" | "login_verification"
  ) => {
    title: string;
    description: string;
    icon: React.ReactElement;
    color: string;
  };
}

export function useEmailVerification(): UseEmailVerificationReturn {
  const [timeLeft, setTimeLeft] = useState(EXPIRY_MINUTES * 60);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetTimer = () => {
    setTimeLeft(EXPIRY_MINUTES * 60);
    setIsExpired(false);
    setResendCooldown(RESEND_COOLDOWN);
  };

  const handleResendCode = async (
    onResendCode?: () => Promise<void>
  ): Promise<void> => {
    if (!onResendCode) return;

    setIsSending(true);

    try {
      // Call the parent component's resend function
      await onResendCode();

      // Reset timers
      resetTimer();
    } catch (error) {
      console.error("Failed to resend verification code:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (
    code: string,
    onVerificationSuccess: (code: string) => Promise<void>,
    setFormError: (message: string) => void
  ): Promise<void> => {
    if (isExpired) {
      toast.error("Verification code has expired. Please request a new one.");
      return;
    }

    try {
      // Call the parent component's verification function (backend verification)
      await onVerificationSuccess(code);
    } catch (error) {
      console.error("Verification error:", error);
      setFormError("Invalid code");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTypeConfig = (
    type: "registration" | "password_reset" | "login_verification"
  ) => {
    // Create icon elements inline to avoid dependency issues
    const mailIcon = React.createElement(
      "svg",
      {
        className: "h-6 w-6",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
      },
      React.createElement("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
      })
    );

    const shieldIcon = React.createElement(
      "svg",
      {
        className: "h-6 w-6",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
      },
      React.createElement("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
      })
    );

    switch (type) {
      case "registration":
        return {
          title: "Verify Your Email",
          description:
            "Complete your registration by verifying your email address",
          icon: mailIcon,
          color: "from-purple-500 to-pink-500",
        };
      case "password_reset":
        return {
          title: "Reset Password",
          description: "Verify your identity to reset your password",
          icon: shieldIcon,
          color: "from-orange-500 to-red-500",
        };
      case "login_verification":
        return {
          title: "Secure Login",
          description: "Two-factor authentication for enhanced security",
          icon: shieldIcon,
          color: "from-blue-500 to-cyan-500",
        };
    }
  };

  const progressValue =
    ((EXPIRY_MINUTES * 60 - timeLeft) / (EXPIRY_MINUTES * 60)) * 100;

  return {
    // Timer states
    timeLeft,
    isExpired,
    progressValue,

    // Resend states
    isSending,
    resendCooldown,

    // Actions
    handleResendCode,
    handleVerifyCode,
    resetTimer,

    // Utilities
    formatTime,
    getTypeConfig,
  };
}
