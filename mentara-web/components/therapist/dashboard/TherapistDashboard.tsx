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
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Your Therapists
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5">
                Connect with mental health professionals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Side Panel Layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        {/* Side Navigation Panel - responsive */}
        <div className="w-full lg:w-72 flex-shrink-0 order-1 lg:order-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4 lg:sticky lg:top-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Sections</h2>
            
            {/* Side Panel Navigation */}
            <nav className="flex flex-row lg:flex-col gap-2">
              <button
                onClick={() => setActiveTab("my-therapist")}
                className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  activeTab === "my-therapist"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">My Therapist</span>
              </button>

              <button
                onClick={() => setActiveTab("find-therapist")}
                className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  activeTab === "find-therapist"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Search className="h-4 w-4" />
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
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-4 sm:px-6 py-3 border-b border-gray-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Pending Requests
                      </h3>
                      <p className="text-xs text-gray-600">
                        Track your connection requests
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
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