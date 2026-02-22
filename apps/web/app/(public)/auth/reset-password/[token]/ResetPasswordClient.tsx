"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePasswordReset } from "@/hooks/auth";

// Validation schema for new password
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordClientProps {
  token: string;
}

export default function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const router = useRouter();
  
  const { validateResetToken, resetPassword, isLoading, isValidatingToken } = usePasswordReset();
  
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await validateResetToken(token);
        setIsTokenValid(response.valid);
        
        if (!response.valid) {
          toast.error("Invalid or expired reset link");
        }
        
      } catch (error) {
        console.error("Token validation error:", error);
        setIsTokenValid(false);
        toast.error("Invalid or expired reset link");
      }
    };

    validateToken();
  }, [token, validateResetToken]);

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await resetPassword(token, data.newPassword, data.confirmPassword);
      
      setIsResetSuccess(true);
      toast.success("Password reset successfully!");
      
      // Redirect to sign in after a delay
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 3000);
      
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to reset password. Please try again.");
      
      // Set form error
      form.setError("root", {
        type: "manual",
        message: "Failed to reset password. Please try again or request a new reset link.",
      });
    }
  };

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Validating reset link...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your password reset request
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid reset link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This password reset link is invalid or has expired
            </p>
          </div>
          
          <Card className="w-full">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  Reset links expire after 1 hour for security reasons. You can request a new one.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => router.push("/auth/reset-password")}
                >
                  Request new reset link
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/auth/sign-in")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (isResetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Password reset successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been successfully updated
            </p>
          </div>
          
          <Card className="w-full">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800">
                  You can now sign in with your new password. You'll be redirected to the sign in page shortly.
                </p>
              </div>
              
              <Button
                className="w-full"
                onClick={() => router.push("/auth/sign-in")}
              >
                Continue to sign in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create new password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose a strong password for your account
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Reset Password
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your new password below
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            {...field}
                            disabled={isLoading}
                            onChange={(e) => {
                              field.onChange(e);
                              if (form.formState.errors.root) {
                                form.clearErrors("root");
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            {...field}
                            disabled={isLoading}
                            onChange={(e) => {
                              field.onChange(e);
                              if (form.formState.errors.root) {
                                form.clearErrors("root");
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800 font-medium mb-2">Password requirements:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                  </ul>
                </div>

                {/* Display form-level errors */}
                {form.formState.errors.root && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <Link 
                href="/auth/sign-in" 
                className="text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="mr-1 h-3 w-3 inline" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}