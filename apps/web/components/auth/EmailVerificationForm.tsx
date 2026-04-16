"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Clock,
  AlertCircle,
  RefreshCw,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEmailVerification } from "@/hooks/auth/useEmailVerification";

const otpSchema = z.object({
  code: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits"),
});

type OtpForm = z.infer<typeof otpSchema>;

interface EmailVerificationFormProps {
  email: string;
  name: string;
  type: "registration" | "password_reset" | "login_verification";
  onVerificationSuccess: (code: string) => void;
  onCancel?: () => void;
  onResendCode?: () => void;
  isVerifying?: boolean;
  className?: string;
}

export function EmailVerificationForm({
  email,
  type,
  onVerificationSuccess,
  onCancel,
  onResendCode,
  isVerifying = false,
  className,
}: EmailVerificationFormProps) {
  // Use the email verification hook for ALL business logic
  const {
    timeLeft,
    isExpired,
    progressValue,
    isSending,
    resendCooldown,
    handleResendCode,
    handleVerifyCode,
    formatTime,
    getTypeConfig,
  } = useEmailVerification();

  const form = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  // Simple wrapper functions that delegate to the hook
  const onResendCodeWrapper = async () => {
    await handleResendCode(onResendCode);
    form.reset({ code: "" });
  };

  const onVerifyCodeWrapper = async (data: OtpForm) => {
    await handleVerifyCode(
      data.code,
      onVerificationSuccess,
      (message: string) => form.setError("code", { message })
    );
  };

  const config = getTypeConfig(type);

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "w-16 h-16 mx-auto rounded-full bg-gradient-to-r flex items-center justify-center text-white",
                config.color
              )}
            >
              {config.icon}
            </motion.div>

            <div>
              <CardTitle className="text-xl font-bold">
                {config.title}
              </CardTitle>
              <p className="text-muted-foreground mt-2">{config.description}</p>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to
              </p>
              <p className="font-medium">{email}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form
              onSubmit={form.handleSubmit(onVerifyCodeWrapper)}
              className="space-y-6"
            >
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-center block">
                  Enter verification code
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={form.watch("code")}
                    onChange={(value) => form.setValue("code", value)}
                    disabled={isVerifying || isExpired}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {form.formState.errors.code && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 text-center"
                  >
                    {form.formState.errors.code.message}
                  </motion.p>
                )}
              </div>

              {/* Timer and Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={cn(
                        "font-medium",
                        isExpired
                          ? "text-red-500"
                          : timeLeft < 60
                            ? "text-orange-500"
                            : "text-muted-foreground"
                      )}
                    >
                      {isExpired ? "Expired" : formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                <Progress
                  value={progressValue}
                  className={cn("h-2", isExpired && "opacity-50")}
                />
              </div>

              {/* Status Messages */}
              <AnimatePresence>
                {isExpired && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your verification code has expired. Please request a new
                        one.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={
                    isVerifying || isExpired || form.watch("code").length !== 6
                  }
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="mr-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </motion.div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={onResendCodeWrapper}
                    disabled={isSending || resendCooldown > 0 || !onResendCode}
                    className="h-auto p-0 text-sm"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend code"
                    )}
                  </Button>
                </div>
              </div>

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

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Security Notice</p>
                  <p className="text-blue-700 mt-1">
                    Never share your verification code with anyone. Mentara will
                    never ask for your codes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
