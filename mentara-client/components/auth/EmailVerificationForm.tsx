"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Clock,
  AlertCircle,
  RefreshCw,
  Shield,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateOtp, sendOtpEmail, formatExpiryTime } from "@/lib/emailjs";

const otpSchema = z.object({
  code: z.string().min(6, "Verification code must be 6 digits").max(6, "Verification code must be 6 digits"),
});

type OtpForm = z.infer<typeof otpSchema>;

interface EmailVerificationFormProps {
  email: string;
  name: string;
  type: 'registration' | 'password_reset' | 'login_verification';
  onVerificationSuccess: (code: string) => void;
  onCancel?: () => void;
  className?: string;
}

const EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN = 60; // seconds

export function EmailVerificationForm({
  email,
  name,
  type,
  onVerificationSuccess,
  onCancel,
  className
}: EmailVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentOtp, setCurrentOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(EXPIRY_MINUTES * 60);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [showCodeHint, setShowCodeHint] = useState(false);

  const form = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  // Generate and send initial OTP
  useEffect(() => {
    sendInitialOtp();
  }, [sendInitialOtp]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendInitialOtp = useCallback(async () => {
    const otp = generateOtp(6);
    setCurrentOtp(otp);
    
    try {
      const result = await sendOtpEmail({
        to_email: email,
        to_name: name,
        otp_code: otp,
        expires_in: formatExpiryTime(EXPIRY_MINUTES),
        type
      });

      if (result.success) {
        toast.success("Verification code sent to your email!");
        setTimeLeft(EXPIRY_MINUTES * 60);
        setIsExpired(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to send verification code");
      console.error(error);
    }
  }, [email, name, type]);

  const handleResendCode = async () => {
    setIsSending(true);
    const newOtp = generateOtp(6);
    setCurrentOtp(newOtp);

    try {
      const result = await sendOtpEmail({
        to_email: email,
        to_name: name,
        otp_code: newOtp,
        expires_in: formatExpiryTime(EXPIRY_MINUTES),
        type
      });

      if (result.success) {
        toast.success("New verification code sent!");
        setTimeLeft(EXPIRY_MINUTES * 60);
        setIsExpired(false);
        setResendCooldown(RESEND_COOLDOWN);
        form.reset({ code: "" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to resend verification code");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (data: OtpForm) => {
    if (isExpired) {
      toast.error("Verification code has expired. Please request a new one.");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if the entered code matches the current OTP
      if (data.code === currentOtp) {
        toast.success("Email verified successfully!");
        onVerificationSuccess(data.code);
      } else {
        toast.error("Invalid verification code. Please try again.");
        form.setError("code", { message: "Invalid code" });
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'registration':
        return {
          title: 'Verify Your Email',
          description: 'Complete your registration by verifying your email address',
          icon: <Mail className="h-6 w-6" />,
          color: 'from-purple-500 to-pink-500'
        };
      case 'password_reset':
        return {
          title: 'Reset Password',
          description: 'Verify your identity to reset your password',
          icon: <Shield className="h-6 w-6" />,
          color: 'from-orange-500 to-red-500'
        };
      case 'login_verification':
        return {
          title: 'Secure Login',
          description: 'Two-factor authentication for enhanced security',
          icon: <Shield className="h-6 w-6" />,
          color: 'from-blue-500 to-cyan-500'
        };
    }
  };

  const config = getTypeConfig();
  const progressValue = ((EXPIRY_MINUTES * 60 - timeLeft) / (EXPIRY_MINUTES * 60)) * 100;

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
              <CardTitle className="text-xl font-bold">{config.title}</CardTitle>
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
            <form onSubmit={form.handleSubmit(handleVerifyCode)} className="space-y-6">
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
                    disabled={isLoading || isExpired}
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
                    <span className={cn(
                      "font-medium",
                      isExpired ? "text-red-500" : timeLeft < 60 ? "text-orange-500" : "text-muted-foreground"
                    )}>
                      {isExpired ? "Expired" : formatTime(timeLeft)}
                    </span>
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCodeHint(!showCodeHint)}
                      className="h-auto p-1 text-xs"
                    >
                      {showCodeHint ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
                
                <Progress 
                  value={progressValue} 
                  className={cn(
                    "h-2",
                    isExpired && "opacity-50"
                  )}
                />

                {/* Development hint */}
                <AnimatePresence>
                  {showCodeHint && process.env.NODE_ENV === 'development' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">Dev Mode</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Code: <code className="font-mono font-bold">{currentOtp}</code>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                        Your verification code has expired. Please request a new one.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading || isExpired || form.watch("code").length !== 6}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
                  <span className="text-sm text-muted-foreground">Didn&apos;t receive the code?</span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleResendCode}
                    disabled={isSending || resendCooldown > 0}
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
                    Never share your verification code with anyone. Mentara will never ask for your codes.
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