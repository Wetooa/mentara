"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Clock, Mail, FileText, ArrowLeft } from "lucide-react";

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams();
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    setApplicationId(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
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

        {/* Success Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted Successfully!
              </h1>
              <p className="text-gray-600">
                Thank you for applying to join Mentara as a mental health therapist.
              </p>
            </div>

            {/* Application Reference */}
            {applicationId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Application Reference</h3>
                </div>
                <p className="text-sm text-green-700">
                  Your application ID: <span className="font-mono font-bold">{applicationId}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Please save this reference number for your records.
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                What happens next?
              </h2>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">1</span>
                  </div>
                  <p>
                    <strong>Application Review</strong> - Our team will review your application and uploaded documents within 3-5 business days.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">2</span>
                  </div>
                  <p>
                    <strong>Document Verification</strong> - We will verify your professional credentials and licensing information.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">3</span>
                  </div>
                  <p>
                    <strong>Decision Notification</strong> - You'll receive an email with our decision and next steps.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Notification */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Email Notification</h3>
              </div>
              <p className="text-sm text-blue-700">
                You will receive an email confirmation shortly. If approved, we'll send you login credentials 
                and onboarding instructions to get started on the Mentara platform.
              </p>
            </div>

            {/* Timeline */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-yellow-900 mb-2">Expected Timeline</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>Review Process:</strong> 3-5 business days</li>
                <li>• <strong>Document Verification:</strong> 1-2 business days</li>
                <li>• <strong>Final Decision:</strong> Within 1 week of submission</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </Link>
              <Link href="/sign-in" className="flex-1">
                <Button className="w-full">
                  Go to Sign In
                </Button>
              </Link>
            </div>

            {/* Contact Information */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Questions about your application? Contact us at{" "}
                <a href="mailto:support@mentara.ph" className="text-blue-600 hover:underline">
                  support@mentara.ph
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}