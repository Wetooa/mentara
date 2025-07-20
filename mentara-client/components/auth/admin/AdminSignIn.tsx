"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Settings, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useAdminAuth } from "@/hooks/auth/admin";

const adminSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Admin password must be at least 8 characters"),
});

type AdminSignInForm = z.infer<typeof adminSignInSchema>;

export function AdminSignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isLoading } = useAdminAuth();

  const form = useForm<AdminSignInForm>({
    resolver: zodResolver(adminSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminSignInForm) => {
    try {
      setError(null);
      await login(data);
      // Navigation handled by useAdminAuth hook
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin sign in failed");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-red-200">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="p-2 rounded-full bg-red-100">
            <Settings className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-red-700">Admin Portal</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Administrative access to Mentara platform
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Security Warning */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Restricted access. Unauthorized access attempts are logged.
          </AlertDescription>
        </Alert>

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
                  <FormLabel>Admin Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your admin email"
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
                  <FormLabel>Admin Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your admin password"
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
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Access Admin Dashboard"
              )}
            </Button>
          </form>
        </Form>

        {/* Admin-specific links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Issues with admin access?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => router.push("/admin/support")}
            >
              Contact IT Support
            </Button>
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700 text-center">
            <Settings className="h-3 w-3 inline mr-1" />
            This portal is for authorized administrators only. All activities are monitored and logged.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}