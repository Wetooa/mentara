"use client";

import React, { useState, useCallback, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation"; // Import useRouter
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  // AlertDialogCancel, // Can remove if not used
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, FileText, X } from "lucide-react"; // Removed unused icons
import { OnboardingStepper } from "@/components/ui/onboardingstepper";

// --- Document Upload Card Component (Handles error display) ---
const DocumentUpload = ({
  title,
  description,
  required = false,
  onFileChange,
  files,
  onRemoveFile,
  hasError, // Added hasError prop
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileChange(e.dataTransfer.files);
        // Clear error visually if needed immediately, though state handles it
      }
    },
    [onFileChange]
  );

  return (
    <Card
      className={`mb-6 border overflow-hidden ${
        hasError ? "border-red-500" : "border-gray-200"
      }`}
    >
      {" "}
      {/* Error border */}
      <CardContent className="p-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {/* Apply error styling to title */}
            <h3
              className={`text-lg font-medium ${
                hasError ? "text-red-700" : "text-green-800"
              }`}
            >
              {title}
            </h3>
            {required && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  hasError
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        {/* File Upload Area */}
        <div className="p-5">
          {files && files.length > 0 ? (
            <div className="space-y-3">
              {Array.from(files).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center min-w-0">
                    {" "}
                    {/* Added min-w-0 for truncation */}
                    <FileText
                      size={18}
                      className="text-green-600 mr-3 flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      {" "}
                      {/* Added flex-grow and min-w-0 */}
                      <p className="text-sm font-medium truncate">
                        {" "}
                        {/* Removed max-w-xs */}
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 ml-2" // Prevent button from shrinking/affecting layout
                    onClick={() => onRemoveFile(index)}
                    aria-label={`Remove ${file.name}`} // Accessibility
                  >
                    <X size={16} className="text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
              ))}
              {/* Allow adding more files */}
              <Button
                variant="outline"
                type="button" // Ensure it doesn't submit form
                className="w-full mt-3 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600"
                onClick={() =>
                  document.getElementById(`file-input-${title}`).click()
                }
              >
                <Upload size={16} className="mr-2" /> Upload Additional File(s)
              </Button>
            </div>
          ) : (
            // Drop zone
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                hasError
                  ? "border-red-400 hover:border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-green-400 bg-white"
              }`} // Error styling for drop zone
              onClick={() =>
                document.getElementById(`file-input-${title}`).click()
              }
            >
              <Upload
                className={`mx-auto h-12 w-12 ${
                  hasError ? "text-red-400" : "text-gray-400"
                }`}
              />
              <div className="mt-3">
                <p
                  className={`text-sm font-medium ${
                    hasError ? "text-red-700" : "text-gray-700"
                  }`}
                >
                  Drag and drop your file(s) here, or
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, JPG, PNG or DOCX up to 10MB each
                </p>
              </div>
              <Button
                type="button" // Ensure it doesn't submit form
                variant="outline"
                className={`mt-4 ${
                  hasError
                    ? "bg-white text-red-600 border-red-300 hover:bg-red-50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Browse Files
              </Button>
            </div>
          )}
          {/* Hidden file input */}
          <Input
            id={`file-input-${title}`}
            type="file"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple // Allow multiple file selection from browse dialog
          />
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Application Component ---
const DocumentUploadPage = () => {
  const router = useRouter(); // Initialize router

  // State for document files
  const [documents, setDocuments] = useState({
    prcLicense: [],
    nbiClearance: [],
    resumeCV: [],
    liabilityInsurance: [],
    birForm: [],
  });

  // State for consent checkbox
  const [consentChecked, setConsentChecked] = useState(false);
  // State for validation errors
  const [errors, setErrors] = useState({});

  // State for showing alert dialog for missing files
  const [alertOpen, setAlertOpen] = useState(false);
  const [incompleteFields, setIncompleteFields] = useState([]);

  // Handler for file change
  const handleFileChange = (docType, files) => {
    if (!files || files.length === 0) return;

    // Basic file type validation (example)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSizeMB = 10;
    const validFiles = Array.from(files).filter(
      (file) =>
        allowedTypes.includes(file.type) && file.size <= maxSizeMB * 1024 * 1024
    );

    // Optional: Provide feedback for invalid files (e.g., using a toast notification)
    if (validFiles.length !== files.length) {
      console.warn(
        "Some files were invalid (type or size) and were not added."
      );
      // Add user feedback here
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: [...prev[docType], ...validFiles],
    }));
    // Clear error for this doc type when files are added
    if (errors[docType]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[docType];
        return newErrors;
      });
    }
  };

  // Handler for file removal
  const handleRemoveFile = (docType, index) => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: prev[docType].filter((_, i) => i !== index),
    }));
    // Optional: Re-validate required status if last file was removed?
    // Or wait until submit. Let's wait until submit.
  };

  // Handler for consent checkbox change
  const handleConsentChange = (checked) => {
    setConsentChecked(checked);
    // Clear error on change
    if (errors.consent) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.consent;
        return newErrors;
      });
    }
  };

  // Steps for the sidebar
  const steps = [
    { label: "Therapist Profile", completed: true },
    { label: "Document Upload", completed: true }, // Mark current step visually
    { label: "Verification", completed: false },
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    setIncompleteFields([]); // Clear previous missing fields

    let validationPassed = true;
    const currentErrors = {};
    const missingDocs = [];

    // 1. Check for required documents
    const requiredDocs = {
      prcLicense: "PRC License",
      nbiClearance: "NBI Clearance",
      resumeCV: "Resume/CV",
    };

    Object.entries(requiredDocs).forEach(([key, name]) => {
      if (documents[key].length === 0) {
        validationPassed = false;
        currentErrors[key] = `${name} is required.`; // Add specific error message
        missingDocs.push(name);
      }
    });

    // 2. Check consent checkbox
    if (!consentChecked) {
      validationPassed = false;
      currentErrors.consent =
        "You must certify that the documents are authentic.";
    }

    // 3. Handle validation results
    if (validationPassed) {
      // Submit the form data (e.g., upload files)
      console.log("Validation successful!");
      console.log("Documents to submit:", documents);
      // TODO: Implement actual file upload logic here

      // Navigate to the next page
      router.push("/therapist-application/3"); // Assuming '/3' is the next step
    } else {
      console.log("Validation failed:", currentErrors);
      setErrors(currentErrors); // Set errors to display inline

      // If there were missing documents, prepare for and show the dialog
      if (missingDocs.length > 0) {
        setIncompleteFields(missingDocs);
        setAlertOpen(true); // Show dialog specifically for missing docs
      } else if (currentErrors.consent) {
        // If *only* the consent is missing, scroll to it
        const consentElement = document.getElementById("consent-section");
        if (consentElement) {
          consentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        // If other errors exist (maybe file type/size in future), scroll to first doc error
        const firstErrorKey = Object.keys(currentErrors)[0];
        const errorElement = document
          .getElementById(`file-input-${firstErrorKey}`)
          ?.closest("div.p-5"); // Find parent container
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-gray-50">
      {/* Left sidebar (Improved Stepper) */}
      <div className="w-1/5 bg-gradient-to-b from-green-100 via-green-50 to-gray-50 p-6 flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="mb-8">
          <Image
            src="/mentara-landscape.png" // Replace with actual logo
            alt="Mentara logo"
            width={250}
            height={100}
          />
        </div>
        <div className="mt-4 mb-8">
          <p className="text-sm text-gray-600 mb-1">You're working on</p>
          <h1 className="text-2xl font-bold text-green-900">Application</h1>
        </div>
        <OnboardingStepper steps={steps}></OnboardingStepper>
        <div className="mt-auto text-xs text-gray-500">
          © {new Date().getFullYear()} Mentara. All rights reserved.
        </div>
      </div>

      {/* Right content area - scrollable form */}
      <div className="w-4/5 flex justify-center p-8">
        <div className="w-full max-w-3xl h-full">
          <form onSubmit={handleSubmit} noValidate>
            {/* Required Documents Section */}
            <div className="mb-8 p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white via-gray-50 to-white shadow-sm scroll-mt-20">
              <h2 className="text-xl font-semibold text-green-800 mb-5 border-b pb-2 border-gray-100">
                Required Documents
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Please upload the following documents to complete your
                application. All documents must be clear and legible. Accepted
                formats: PDF, JPG, PNG, DOCX (Max 10MB each).
              </p>

              <DocumentUpload
                title="PRC License"
                description="Upload a clear copy of your valid PRC license"
                required={true}
                onFileChange={(files) => handleFileChange("prcLicense", files)}
                files={documents.prcLicense}
                onRemoveFile={(index) => handleRemoveFile("prcLicense", index)}
                hasError={!!errors.prcLicense} // Pass error status
              />
              {/* Display inline error message */}
              {errors.prcLicense && (
                <p className="text-red-600 text-sm -mt-4 mb-4 ml-1">
                  {errors.prcLicense}
                </p>
              )}

              <DocumentUpload
                title="NBI Clearance"
                description="Upload your NBI clearance (issued within the last 6 months)"
                required={true}
                onFileChange={(files) =>
                  handleFileChange("nbiClearance", files)
                }
                files={documents.nbiClearance}
                onRemoveFile={(index) =>
                  handleRemoveFile("nbiClearance", index)
                }
                hasError={!!errors.nbiClearance} // Pass error status
              />
              {errors.nbiClearance && (
                <p className="text-red-600 text-sm -mt-4 mb-4 ml-1">
                  {errors.nbiClearance}
                </p>
              )}

              <DocumentUpload
                title="Resume/CV"
                description="Upload your professional resume or curriculum vitae"
                required={true}
                onFileChange={(files) => handleFileChange("resumeCV", files)}
                files={documents.resumeCV}
                onRemoveFile={(index) => handleRemoveFile("resumeCV", index)}
                hasError={!!errors.resumeCV} // Pass error status
              />
              {errors.resumeCV && (
                <p className="text-red-600 text-sm -mt-4 mb-4 ml-1">
                  {errors.resumeCV}
                </p>
              )}
            </div>

            {/* Additional Documents Section */}
            <div className="mb-8 p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white via-gray-50 to-white shadow-sm">
              <h2 className="text-xl font-semibold text-green-800 mb-5 border-b pb-2 border-gray-100">
                Additional Documents (Optional)
              </h2>

              <DocumentUpload
                title="Professional Liability Insurance"
                description="If applicable, upload a copy of your professional liability insurance"
                required={false}
                onFileChange={(files) =>
                  handleFileChange("liabilityInsurance", files)
                }
                files={documents.liabilityInsurance}
                onRemoveFile={(index) =>
                  handleRemoveFile("liabilityInsurance", index)
                }
                hasError={!!errors.liabilityInsurance} // Can have errors even if optional (e.g., file type)
              />
              {/* Display error if any (e.g., invalid file type) */}
              {errors.liabilityInsurance && (
                <p className="text-red-600 text-sm -mt-4 mb-4 ml-1">
                  {errors.liabilityInsurance}
                </p>
              )}

              <DocumentUpload
                title="BIR Form 2303 / Certificate of Registration"
                description="Optional: Upload for tax reporting and payment processing"
                required={false}
                onFileChange={(files) => handleFileChange("birForm", files)}
                files={documents.birForm}
                onRemoveFile={(index) => handleRemoveFile("birForm", index)}
                hasError={!!errors.birForm}
              />
              {errors.birForm && (
                <p className="text-red-600 text-sm -mt-4 mb-4 ml-1">
                  {errors.birForm}
                </p>
              )}
            </div>

            {/* Consent Section */}
            <div
              id="consent-section"
              className="mb-8 p-5 border border-gray-200 rounded-xl bg-white shadow-sm scroll-mt-20"
            >
              {" "}
              {/* Added ID and scroll-mt */}
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Certification
              </h2>
              <div
                className={`flex items-start space-x-3 p-4 rounded-lg ${
                  errors.consent ? "border border-red-500 bg-red-50" : ""
                }`}
              >
                <Checkbox
                  id="consent"
                  className={`mt-1 flex-shrink-0 ${
                    errors.consent ? "border-red-400" : ""
                  }`}
                  checked={consentChecked}
                  onCheckedChange={handleConsentChange} // Use specific handler
                  aria-describedby={
                    errors.consent ? "consent-error" : undefined
                  } // Link error msg
                />
                <Label
                  htmlFor="consent"
                  className={`text-sm ${
                    errors.consent ? "text-red-800" : "text-gray-700"
                  }`}
                >
                  I certify that all documents uploaded are authentic and valid.
                  I understand that providing false information may result in
                  the rejection of my application.
                </Label>
              </div>
              {/* Display consent error inline */}
              {errors.consent && (
                <p
                  id="consent-error"
                  className="text-red-600 text-sm mt-2 ml-2"
                >
                  {errors.consent}
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                className="px-8 py-3 rounded-full text-gray-700 border-gray-300 hover:bg-gray-100"
                onClick={() => router.back()} // Go back to previous page
              >
                Back
              </Button>

              <Button
                type="submit"
                className="px-8 py-3 rounded-full bg-green-600 text-white font-semibold text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
              >
                Save and Continue
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Alert Dialog for Incomplete *Required Files* */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Required Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Please upload the following required document(s):
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {incompleteFields.map((field, index) => (
                  <li key={index} className="text-red-600 font-medium">
                    {field}
                  </li>
                ))}
              </ul>
              You can drag & drop files or use the browse button for each
              section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentUploadPage;
