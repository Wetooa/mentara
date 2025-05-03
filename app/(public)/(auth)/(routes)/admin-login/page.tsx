"use client";

import FormFooter from "@/components/footer/form-footer";
import Logo from "@/components/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSignIn } from "@clerk/nextjs";
import { AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to admin dashboard if already authenticated as admin
  useEffect(() => {
    if (isAdmin && !isCheckingAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, isCheckingAdmin, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      setError("Authentication system is loading. Please try again.");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // First authenticate with Clerk
      const result = await signIn.create({
        identifier: email,
        password,
      });

      // If the sign-in was successful
      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId });

        // Verify if the user has admin privileges
        const adminResponse = await fetch("/api/admin/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (adminResponse.ok) {
          // User is an admin, redirect to admin dashboard
          router.push("/admin");
        } else {
          // User is authenticated but not an admin
          setError("You don't have administrator privileges.");
        }
      } else {
        // Authentication requires additional steps (like 2FA, email verification, etc.)
        setError(
          "Additional authentication steps required. Please complete the sign-in process."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[500px] rounded-3xl shadow-lg overflow-hidden flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-6 text-2xl font-bold text-center text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure access for Mentara administrators
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-center">
              Administrator Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mentara.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !isLoaded || isCheckingAdmin}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>

              <div className="text-sm text-center">
                <Link
                  href="/sign-in"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Return to user login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <FormFooter />
      </div>
    </div>
  );
}
