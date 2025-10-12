"use client";

import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Users, Search, Heart, Calendar } from "lucide-react";
import MyTherapistSection from "./MyTherapistSection";
import FindTherapistSection from "./FindTherapistSection";
import PendingRequestsSection from "@/components/client/therapist/PendingRequestsSection";
import { TherapistListingErrorWrapper } from "@/components/common/TherapistListingErrorBoundary";

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState("my-therapist");

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-primary/5 min-h-screen">
      {/* Simplified Clean Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-md">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Your Therapists
              </h1>
              <p className="text-gray-600 mt-1">
                Connect with mental health professionals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Side Panel Layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-6">
        {/* Side Navigation Panel - responsive */}
        <div className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 lg:sticky lg:top-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Sections</h2>
            
            {/* Side Panel Navigation */}
            <nav className="flex flex-row lg:flex-col gap-2">
              <button
                onClick={() => setActiveTab("my-therapist")}
                className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left ${
                  activeTab === "my-therapist"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="hidden sm:inline">My Therapist</span>
              </button>

              <button
                onClick={() => setActiveTab("find-therapist")}
                className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left ${
                  activeTab === "find-therapist"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Search className="h-5 w-5" />
                <span className="hidden sm:inline">Find a Therapist</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 order-2 lg:order-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* My Therapist Tab Content */}
            <TabsContent value="my-therapist" className="space-y-6 mt-0">
              <TherapistListingErrorWrapper
                onError={(error, errorInfo) => {
                  console.error("My Therapist section error:", {
                    error,
                    errorInfo,
                  });
                }}
              >
                <MyTherapistSection />
              </TherapistListingErrorWrapper>

              {/* Compact Pending Requests Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pending Requests
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track your connection requests
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <PendingRequestsSection />
                </div>
              </div>
            </TabsContent>

            {/* Find Therapist Tab Content */}
            <TabsContent value="find-therapist" className="space-y-6 mt-0">
              <TherapistListingErrorWrapper
                onError={(error, errorInfo) => {
                  console.error("Find Therapist section error:", {
                    error,
                    errorInfo,
                  });
                }}
              >
                <FindTherapistSection />
              </TherapistListingErrorWrapper>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}