"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Heart, Calendar } from "lucide-react";
import MyTherapistSection from "./MyTherapistSection";
import FindTherapistSection from "./FindTherapistSection";
import PendingRequestsSection from "@/components/client/therapist/PendingRequestsSection";
import { TherapistListingErrorWrapper } from "@/components/common/TherapistListingErrorBoundary";

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState("my-therapist");

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50/30 via-white to-green-50/20 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Healthcare Design */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Your Therapy Journey
              </h1>
              <p className="text-gray-600 text-lg">
                Connect with professionals who understand your needs
              </p>
            </div>
          </div>

          {/* Healthcare-focused info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Connections</p>
                  <p className="font-semibold text-gray-900">
                    Manage your therapy relationships
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discover Therapists</p>
                  <p className="font-semibold text-gray-900">
                    Find your perfect match
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Schedule</p>
                  <p className="font-semibold text-gray-900">
                    Book and manage sessions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:max-w-md mx-0 bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-lg">
            <TabsTrigger
              value="my-therapist"
              className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-xl py-3 px-4 font-medium"
            >
              <Users className="h-5 w-5" />
              <span className="hidden sm:inline">My Therapist</span>
              <span className="sm:hidden">My</span>
            </TabsTrigger>
            <TabsTrigger
              value="find-therapist"
              className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-xl py-3 px-4 font-medium"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Find a Therapist</span>
              <span className="sm:hidden">Find</span>
            </TabsTrigger>
          </TabsList>

          {/* My Therapist Tab Content */}
          <TabsContent value="my-therapist" className="space-y-8 mt-8">
            <TherapistListingErrorWrapper
              onError={(error, errorInfo) => {
                console.error("My Therapist section error:", {
                  error,
                  errorInfo,
                });
              }}
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg p-1">
                <MyTherapistSection />
              </div>
            </TherapistListingErrorWrapper>

            {/* Enhanced Pending Requests Section for My Therapist tab */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Pending Requests
                    </h3>
                    <p className="text-orange-100">
                      Track your therapist connection requests
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
          <TabsContent value="find-therapist" className="space-y-8 mt-8">
            <TherapistListingErrorWrapper
              onError={(error, errorInfo) => {
                console.error("Find Therapist section error:", {
                  error,
                  errorInfo,
                });
              }}
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-green-100 shadow-lg p-1">
                <FindTherapistSection />
              </div>
            </TherapistListingErrorWrapper>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
