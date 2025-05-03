"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Phone, Clock, AlertCircle } from "lucide-react";
import { OnboardingStepper } from "@/components/ui/onboardingstepper";
import useTherapistForm from "@/store/therapistform";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { submitTherapistApplication } from "@/lib/api/therapist-application";
import { Button } from "@/components/ui/button";

const ApplicationConfirmation = () => {
  const router = useRouter();
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Steps for the sidebar - all completed now
  const steps = [
    { label: "Therapist Profile", completed: true },
    { label: "Document Upload", completed: true },
    { label: "Verification", completed: true },
  ];

  const { formValues, documents } = useTherapistForm();

  // Upload files to server
  const uploadFiles = async () => {
    console.log("Uploading files...");
    const fileUploads = [];

    // Create an array of upload promises for each document type
    for (const [docType, files] of Object.entries(documents)) {
      if (!files || !Array.isArray(files) || files.length === 0) continue;

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", docType);

        // Upload each file
        try {
          const response = await fetch("/api/therapist/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${docType}`);
          }

          const data = await response.json();
          fileUploads.push({
            docType,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: data.fileUrl,
            uploadId: data.uploadId,
          });
        } catch (error) {
          console.error(`Error uploading ${docType}:`, error);
          throw error;
        }
      }
    }

    return fileUploads;
  };

  // Submit the application to the database
  const submitApplication = async () => {
    if (submissionStatus === "submitting" || submissionStatus === "success") {
      return;
    }

    setSubmissionStatus("submitting");
    setError(null);

    try {
      // First, upload all documents
      let fileUploads = [];
      try {
        fileUploads = await uploadFiles();
      } catch (uploadError) {
        console.error("Error during file upload:", uploadError);
        throw new Error("Failed to upload documents. Please try again.");
      }

      // Prepare application data with file references
      const applicationData = {
        ...formValues,
        uploadedDocuments: fileUploads,
      };

      // Then, submit the application to the database
      const result = await submitTherapistApplication(applicationData);
      setApplicationId(result.id);

      setSubmissionStatus("success");
    } catch (error) {
      console.error("Failed to submit application:", error);
      setSubmissionStatus("error");
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again."
      );
    }
  };

  // Auto-submit the application on page load
  useEffect(() => {
    submitApplication();
  }, []);

  return (
    <div className="w-full min-h-screen flex bg-gray-50">
      {/* Left sidebar */}
      <div className="w-1/5 bg-gradient-to-b from-green-100 via-green-50 to-gray-50 p-6 flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="mb-8">
          <Image
            src="/mentara-landscape.png"
            alt="Mentara logo"
            width={250}
            height={100}
          />
        </div>
        <div className="mt-4 mb-8">
          <p className="text-sm text-gray-600 mb-1">You're working on</p>
          <h1 className="text-2xl font-bold text-green-900">Application</h1>
        </div>
        <OnboardingStepper steps={steps} />
        <div className="mt-auto text-xs text-gray-500">
          © {new Date().getFullYear()} Mentara. All rights reserved.
        </div>
      </div>

      {/* Right content area */}
      <div className="w-4/5 flex justify-center items-center p-8">
        <div className="w-full max-w-3xl">
          {submissionStatus === "submitting" ? (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-blue-600 p-10 flex flex-col items-center justify-center">
                <div className="flex justify-center items-center mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                </div>
                <h1 className="text-3xl font-bold text-white text-center">
                  Submitting Application...
                </h1>
                <p className="text-blue-100 mt-3 text-center">
                  Please wait while we process your application
                </p>
              </div>
              <CardContent className="p-8">
                <p className="text-gray-700 text-center">
                  This may take a few moments. Please do not close this window.
                </p>
              </CardContent>
            </Card>
          ) : submissionStatus === "error" ? (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-red-600 p-10 flex flex-col items-center justify-center">
                <AlertCircle size={80} className="text-white mb-6" />
                <h1 className="text-3xl font-bold text-white text-center">
                  Submission Error
                </h1>
                <p className="text-red-100 mt-3 text-center">
                  There was a problem submitting your application
                </p>
              </div>
              <CardContent className="p-8">
                <div className="bg-red-50 rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-semibold text-red-800 mb-4">
                    What went wrong?
                  </h2>
                  <p className="text-gray-700 mb-4">
                    {error ||
                      "There was an unexpected error. Please try again."}
                  </p>
                  <div className="flex justify-center">
                    <Button
                      onClick={submitApplication}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-gray-600 mb-6">
                    If you continue to experience issues, please contact our
                    support team for assistance.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button className="px-6 py-3 bg-white border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      Contact Support
                    </button>
                    <button
                      className="px-6 py-3 bg-green-600 rounded-full text-white font-medium hover:bg-green-700 transition-colors"
                      onClick={() => router.push("/")}
                    >
                      Return to Homepage
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-green-600 p-10 flex flex-col items-center justify-center">
                <CheckCircle size={80} className="text-white mb-6" />
                <h1 className="text-3xl font-bold text-white text-center">
                  Application Submitted!
                </h1>
                <p className="text-green-100 mt-3 text-center">
                  Thank you for applying to join the Mentara therapist network
                </p>
              </div>

              <CardContent className="p-8">
                <div className="bg-green-50 rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-semibold text-green-800 mb-4">
                    What happens next?
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <Clock size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Application Review
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Our team will review your application and submitted
                          documents within 5-7 business days.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <Mail size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Email Notification
                        </h3>
                        <p className="text-gray-600 text-sm">
                          You'll receive an email notification once your
                          application has been reviewed.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <Phone size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Interview Scheduling
                        </h3>
                        <p className="text-gray-600 text-sm">
                          If your application meets our requirements, we'll
                          contact you to schedule an interview.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Please keep an eye on your contact details
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Our team may reach out to you via email or phone for
                    additional information or to schedule a follow-up interview.
                    Make sure to check your email and phone regularly.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> If you don't receive any
                      communication within 7 business days, please check your
                      spam folder or contact our support team at{" "}
                      <span className="underline">support@mentara.com</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button className="px-6 py-3 bg-white border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      Contact Support
                    </button>
                    <button
                      className="px-6 py-3 bg-green-600 rounded-full text-white font-medium hover:bg-green-700 transition-colors"
                      onClick={() => router.push("/")}
                    >
                      Return to Homepage
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationConfirmation;
