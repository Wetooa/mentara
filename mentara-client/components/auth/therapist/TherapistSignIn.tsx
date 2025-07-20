"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useTherapistAuth } from "@/hooks/auth/therapist";

const therapistSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type TherapistSignInForm = z.infer<typeof therapistSignInSchema>;

export function TherapistSignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isLoading } = useTherapistAuth();

  const form = useForm<TherapistSignInForm>({
    resolver: zodResolver(therapistSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: TherapistSignInForm) => {
    try {
      setError(null);
      await login(data);
      // Navigation handled by useTherapistAuth hook
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="p-2 rounded-full bg-green-100">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Therapist Portal</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Access your practice dashboard
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your professional email"
                      {...field}
                      disabled={isLoading}
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

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Access Practice Dashboard"
              )}
            </Button>
          </form>
        </Form>

        {/* Professional Links */}
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
            Want to join as a therapist?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => router.push("/therapist-application")}
            >
              Apply here
            </Button>
          </p>
        </div>

        {/* Application Status Note */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700 text-center">
            <Shield className="h-3 w-3 inline mr-1" />
            Secure therapist portal. Your account requires approval before access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}