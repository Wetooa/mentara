"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Flag, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useModeratorAuth } from "@/hooks/auth/moderator";

const moderatorSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type ModeratorSignInForm = z.infer<typeof moderatorSignInSchema>;

export function ModeratorSignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isLoading } = useModeratorAuth();

  const form = useForm<ModeratorSignInForm>({
    resolver: zodResolver(moderatorSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: ModeratorSignInForm) => {
    try {
      setError(null);
      await login(data);
      // Navigation handled by useModeratorAuth hook
    } catch (err) {
      setError(err instanceof Error ? err.message : "Moderator sign in failed");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-orange-200">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="p-2 rounded-full bg-orange-100">
            <Flag className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-orange-700">Moderator Portal</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Content moderation and community management
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Access Notice */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-xs text-orange-700">
            Moderator access required. Your actions help maintain community safety.
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
                  <FormLabel>Moderator Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your moderator email"
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
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Access Moderation Dashboard"
              )}
            </Button>
          </form>
        </Form>

        {/* Moderator-specific links */}
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
            Need moderator access?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => router.push("/admin/contact")}
            >
              Contact admin
            </Button>
          </p>
        </div>

        {/* Community Guidelines Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-700 text-center">
            <Flag className="h-3 w-3 inline mr-1" />
            Help us maintain a safe and supportive community for all users.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}