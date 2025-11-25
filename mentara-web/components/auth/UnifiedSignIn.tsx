"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { useLogin } from "@/hooks/auth/useLogin";
import { toast } from "sonner";
import { mapLoginError } from "@/lib/utils/loginErrors";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof signInSchema>;

export function UnifiedSignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useLogin();

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
        // Clear any previous form errors
        form.clearErrors();
        
        // Use simple login hook that handles token storage and redirect
        await login({ email: data.email, password: data.password });
        toast.success("Welcome back! Redirecting...", {
          description: "Taking you to your dashboard",
        });
      } catch (err: any) {
        // Error is handled by mapLoginError and toast notifications below
        
        // Map error to user-friendly message
        const errorResult = mapLoginError(err);
        
        // Show proper toast notification based on error type
        if (err?.response?.status === 401) {
          toast.error("Invalid credentials", {
            description: "The email or password you entered is incorrect. Please try again.",
          });
        } else if (err?.response?.status === 403) {
          toast.error("Access denied", {
            description: "Your account may be suspended or not yet verified.",
          });
        } else if (err?.response?.status === 429) {
          toast.error("Too many attempts", {
            description: "Please wait a few minutes before trying again.",
          });
        } else if (err?.response?.status >= 500) {
          toast.error("Server error", {
            description: "Something went wrong on our end. Please try again later.",
          });
        } else {
          toast.error("Sign in failed", {
            description: errorResult.message || "An unexpected error occurred. Please try again.",
          });
        }
        
        // Set form error that will display below the form
        form.setError("root", {
          type: "manual",
          message: errorResult.message || "Please check your credentials and try again.",
        });
      }
    },
    [login, form]
  );

  return (
    <div className="relative w-full max-w-md mx-auto">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Signing you in...</p>
          </div>
        </div>
      )}
      <Card className="w-full max-w-md mx-auto relative shadow-xl border-2">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/landing"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to home</span>
            </Link>
            <Link
              href="/landing"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to Mentara
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to access your personalized mental health platform
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
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
                      disabled={isLoading}
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear form errors when user starts typing
                        if (form.formState.errors.root) {
                          form.clearErrors("root");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
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
                        disabled={isLoading}
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear form errors when user starts typing
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

            {/* Display form-level errors */}
            {form.formState.errors.root && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-destructive/90 mt-1">
                    {form.formState.errors.root.message}
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        {/* Additional Links */}
        <div className="text-center space-y-3 pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Forgot your password?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm font-medium"
              onClick={() => router.push("/auth/reset-password")}
            >
              Reset it here
            </Button>
          </p>
          <p className="text-sm text-muted-foreground">
            New to Mentara?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm font-medium"
              onClick={() => router.push("/pre-assessment")}
            >
              Start your assessment
            </Button>
          </p>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
