"use client";

import React, { useState, useCallback, Suspense } from "react";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// Extracted Section Components
import { SectionComponent } from "@/components/therapist-application/SectionComponent";
import { TherapistApplicationLayout } from "@/components/therapist-application/TherapistApplicationLayout";

// Hooks and utilities
import { useTherapistApplicationForm } from "@/hooks/therapist-application/useTherapistApplicationForm";

function SinglePageTherapistApplicationContent() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);

  // Use extracted form hook
  const {
    form,
    watchedValues,
    isSubmitting,
    sections,
    sectionCompletions,
    openSections,
    overallProgress,
    displayProgress,
    documents,
    toggleSection,
    handleSubmit,
    handleRestartForm: handleRestartFormInternal,
    updateDocuments,
    removeDocument,
    currentSectionIndex,
    goToNextSection,
    goToPreviousSection,
  } = useTherapistApplicationForm();

  // Mobile navigation handlers
  const handleMobileMenuClick = useCallback(() => {
    setMobileDrawerOpen(true);
  }, []);

  const handleMobileDrawerClose = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  // Restart form handler with modal
  const handleRestartForm = useCallback(() => {
    handleRestartFormInternal();
    setShowRestartModal(false);
  }, [handleRestartFormInternal]);

  // Current section
  const currentSection = sections[currentSectionIndex];

  return (
    <TherapistApplicationLayout
      sections={sections}
      sectionCompletions={sectionCompletions}
      openSections={openSections}
      displayProgress={displayProgress}
      currentSectionIndex={currentSectionIndex}
      currentSection={currentSection}
      onToggleSection={toggleSection}
      onMobileMenuClick={handleMobileMenuClick}
      onMobileDrawerClose={handleMobileDrawerClose}
      onGoToNextSection={goToNextSection}
      onGoToPreviousSection={goToPreviousSection}
      onShowRestartModal={() => setShowRestartModal(true)}
      mobileDrawerOpen={mobileDrawerOpen}
      hasPrevious={currentSectionIndex > 0}
      hasNext={currentSectionIndex < sections.length - 1}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {/* Render each section as collapsible */}
          {sections.map((section) => (
            <SectionComponent
              key={section.id}
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              completion={sectionCompletions[section.id]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              form={form as any}
              watchedValues={watchedValues}
              documents={documents}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              updateDocuments={updateDocuments as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              removeDocument={removeDocument as any}
            />
          ))}

          {/* Submit Button */}
          <Card className="border-2 border-secondary/30 bg-secondary/10">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-secondary mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Ready to Submit?</span>
                </div>
                <p className="text-sm text-secondary/80 mb-6">
                  Please review your information above before submitting your
                  application.
                </p>
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isSubmitting || overallProgress < 100}
                    className="px-8 py-4 rounded-xl font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-secondary/30 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>Submit Application</>
                    )}
                  </Button>
                </div>
                {overallProgress < 100 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Please complete the following sections before submitting:
                    </p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                      {sections
                        .filter((section) => section.isRequired)
                        .map((section) => {
                          const completion = sectionCompletions[section.id];
                          if (completion.percentage < 100) {
                            return (
                              <li key={section.id}>
                                <button
                                  type="button"
                                  className="text-yellow-800 hover:text-yellow-900 underline"
                                  onClick={() => {
                                    toggleSection(section.id);
                                    const element = document.getElementById(
                                      `section-${section.id}`
                                    );
                                    if (element) {
                                      element.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                    }
                                  }}
                                >
                                  {section.title}
                                </button>
                                {` (${completion.completed}/${completion.total} complete)`}
                              </li>
                            );
                          }
                          return null;
                        })}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Restart Form Confirmation Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Restart Form
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to restart the form? All your current
              progress will be lost permanently.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRestartModal(false)}
                className="min-h-[44px] px-4 py-2 touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRestartForm}
                className="min-h-[44px] px-4 py-2 touch-manipulation"
              >
                Yes, Restart Form
              </Button>
            </div>
          </div>
        </div>
      )}
    </TherapistApplicationLayout>
  );
}

export default function SinglePageTherapistApplication() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SinglePageTherapistApplicationContent />
    </Suspense>
  );
}
