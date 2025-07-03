"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, RefreshCw, ArrowLeft, Mail, FileText } from "lucide-react";

type ErrorType = "email_exists" | "validation_error" | "upload_error" | "server_error" | "unknown";

interface ErrorDetails {
  title: string;
  description: string;
  icon: React.ReactNode;
  suggestion: string;
  actionText: string;
  actionHref: string;
}

const errorTypes: Record<ErrorType, ErrorDetails> = {
  email_exists: {
    title: "Email Already Registered",
    description: "An application with this email address has already been submitted to our system.",
    icon: <Mail className="w-10 h-10 text-orange-600" />,
    suggestion: "If you believe this is an error or need to update your application, please contact our support team. You can also try using a different email address.",
    actionText: "Try Different Email",
    actionHref: "/therapist-application"
  },
  validation_error: {
    title: "Application Validation Error",
    description: "Some required fields in your application are missing or contain invalid information.",
    icon: <FileText className="w-10 h-10 text-red-600" />,
    suggestion: "Please review your application form and ensure all required fields are properly filled out before resubmitting.",
    actionText: "Review Application",
    actionHref: "/therapist-application"
  },
  upload_error: {
    title: "Document Upload Failed",
    description: "There was an issue uploading your documents. This may be due to file size, format, or connection issues.",
    icon: <AlertTriangle className="w-10 h-10 text-yellow-600" />,
    suggestion: "Please check that your documents are in the correct format (PDF, JPG, PNG, DOCX) and under 10MB each. Try uploading again.",
    actionText: "Try Upload Again",
    actionHref: "/therapist-application"
  },
  server_error: {
    title: "Server Error",
    description: "We encountered a technical issue while processing your application. This is temporary and not caused by your submission.",
    icon: <RefreshCw className="w-10 h-10 text-blue-600" />,
    suggestion: "Please wait a few minutes and try submitting your application again. If the problem persists, contact our support team.",
    actionText: "Try Again",
    actionHref: "/therapist-application"
  },
  unknown: {
    title: "Application Submission Failed",
    description: "An unexpected error occurred while submitting your application.",
    icon: <AlertTriangle className="w-10 h-10 text-red-600" />,
    suggestion: "Please try submitting your application again. If the issue continues, contact our support team for assistance.",
    actionText: "Try Again",
    actionHref: "/therapist-application"
  }
};

export default function ApplicationErrorPage() {
  const searchParams = useSearchParams();
  const [errorType, setErrorType] = useState<ErrorType>("unknown");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const type = (searchParams.get("type") as ErrorType) || "unknown";
    const message = searchParams.get("message") || "";
    
    setErrorType(type);
    setErrorMessage(message);
  }, [searchParams]);

  const errorDetails = errorTypes[errorType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <Image
            src="/icons/mentara/mentara-landscape.png"
            alt="Mentara logo"
            width={200}
            height={80}
            className="mx-auto mb-4"
          />
        </div>

        {/* Error Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                {errorDetails.icon}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {errorDetails.title}
              </h1>
              <p className="text-gray-600">
                {errorDetails.description}
              </p>
            </div>

            {/* Error Message Details */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* Suggestion */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What you can do</h3>
              <p className="text-sm text-blue-700">{errorDetails.suggestion}</p>
            </div>

            {/* Contact Support for Email Exists */}
            {errorType === "email_exists" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">Need Help?</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  If you need to update your existing application or have questions about the status, 
                  our support team can help you.
                </p>
                <div className="text-sm text-yellow-700">
                  <p><strong>Email:</strong> support@mentara.ph</p>
                  <p><strong>Subject:</strong> Therapist Application - Email Already Exists</p>
                </div>
              </div>
            )}

            {/* Common Issues for Upload Errors */}
            {errorType === "upload_error" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">Common File Issues</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• File size exceeds 10MB limit</li>
                  <li>• Unsupported file format (only PDF, JPG, PNG, DOCX allowed)</li>
                  <li>• Poor internet connection during upload</li>
                  <li>• File is corrupted or cannot be read</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href={errorDetails.actionHref} className="flex-1">
                <Button className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {errorDetails.actionText}
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </Link>
            </div>

            {/* Contact Information */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Still having trouble? We're here to help.
              </p>
              <p className="text-sm text-gray-500">
                Contact us at{" "}
                <a href="mailto:support@mentara.ph" className="text-blue-600 hover:underline">
                  support@mentara.ph
                </a>
                {" "}or call our support line.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}