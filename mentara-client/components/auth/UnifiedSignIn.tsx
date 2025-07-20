"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ContinueWithGoogle } from "@/components/auth/ContinueWithGoogle";
import { ContinueWithMicrosoft } from "@/components/auth/ContinueWithMicrosoft";
import { useApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthErrorHandler } from "@/hooks/auth/useAuthErrorHandler";
import { useAuthLoadingStates } from "@/hooks/auth/useAuthLoadingStates";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof signInSchema>;

export function UnifiedSignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const api = useApi();
  const { login: authLogin } = useAuth();
  const { handleAuthError, handleRetry } = useAuthErrorHandler();
  const {
    setLoadingWithDefaults,
    isLoading: isAuthLoading,
    getLoadingMessage,
  } = useAuthLoadingStates();

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: SignInForm) => {
      try {
        setFieldErrors({});
        setLoadingWithDefaults("login", true);

        // Use the AuthContext's universal login method
        await authLogin({ email: data.email, password: data.password });

        // Reset retry count on success
        setRetryCount(0);
        setLoadingWithDefaults("login", false);

        // AuthContext handles storing tokens, user data, and role-based redirects
        // No manual redirect needed here
        
      } catch (err) {
        setLoadingWithDefaults("login", false);

        const result = handleAuthError(err, {
          component: "UnifiedSignIn",
          action: "login",
          userId: data.email,
          metadata: { retryCount },
        });

        // Handle field-level errors
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }

        // Handle redirect
        if (result.shouldRedirect && result.redirectTo) {
          router.push(result.redirectTo);
          return;
        }

        // Handle automatic retry for transient errors
        if (result.shouldRetry && retryCount < 3) {
          setIsRetrying(true);
          setRetryCount((prev) => prev + 1);

          try {
            await handleRetry(
              async () => {
                await authLogin({ email: data.email, password: data.password });
              },
              result.retryAfter || 5000,
              3 - retryCount
            );

            // Success after retry
            setRetryCount(0);
            setIsRetrying(false);
          } catch {
            setIsRetrying(false);
            // Final retry failed, don't try again
          }
        }
      }
    },
    [
      authLogin,
      handleAuthError,
      handleRetry,
      setLoadingWithDefaults,
      router,
      retryCount,
    ]
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Welcome to Mentara
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Sign in to access your account
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Retry indicator */}
        {isRetrying && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Connection failed. Retrying... (Attempt {retryCount}/3)
            </AlertDescription>
          </Alert>
        )}

        {/* Network/General error indicator */}
        {retryCount >= 3 && !isRetrying && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Multiple connection attempts failed. Please check your internet
              connection and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <ContinueWithGoogle />
          <ContinueWithMicrosoft />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      disabled={
                        isAuthLoading("login") || isRetrying
                      }
                      className={fieldErrors.email ? "border-red-500" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Field-specific error from API */}
                  {fieldErrors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.email}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                        disabled={
                          isAuthLoading("login") || isRetrying
                        }
                        className={fieldErrors.password ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={
                          isAuthLoading("login") || isRetrying
                        }
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
                  {/* Field-specific error from API */}
                  {fieldErrors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.password}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isAuthLoading("login") || isRetrying}
            >
              {isAuthLoading("login") || isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRetrying
                    ? `Retrying... (${retryCount}/3)`
                    : getLoadingMessage("login") || "Signing in..."}
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        {/* Additional Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Forgot your password?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => router.push("/reset-password")}
            >
              Reset it here
            </Button>
          </p>
          <p className="text-sm text-muted-foreground">
            New to Mentara?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => router.push("/pre-assessment")}
            >
              Start your assessment
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
