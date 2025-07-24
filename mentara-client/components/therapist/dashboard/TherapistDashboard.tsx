"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Heart, Calendar } from "lucide-react";
import MyTherapistSection from "./MyTherapistSection";
import FindTherapistSection from "./FindTherapistSection";
import MeetingsSection from "@/components/therapist/listing/MeetingsSection";
import { TherapistListingErrorWrapper } from "@/components/common/TherapistListingErrorBoundary";

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState("my-therapist");

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Therapist Dashboard</h1>
        <p className="text-gray-600">Manage your therapy connections and find new therapists</p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-96 mx-0 bg-gray-100 rounded-lg p-1">
          <TabsTrigger 
            value="my-therapist" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">My Therapist</span>
            <span className="sm:hidden">My</span>
          </TabsTrigger>
          <TabsTrigger 
            value="find-therapist" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Find a Therapist</span>
            <span className="sm:hidden">Find</span>
          </TabsTrigger>
        </TabsList>

        {/* My Therapist Tab Content */}
        <TabsContent value="my-therapist" className="space-y-6 mt-6">
          <TherapistListingErrorWrapper
            onError={(error, errorInfo) => {
              console.error('My Therapist section error:', { error, errorInfo });
            }}
          >
            <MyTherapistSection />
          </TherapistListingErrorWrapper>

          {/* Meetings Section for My Therapist tab */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <MeetingsSection />
          </div>
        </TabsContent>

        {/* Find Therapist Tab Content */}
        <TabsContent value="find-therapist" className="space-y-6 mt-6">
          <TherapistListingErrorWrapper
            onError={(error, errorInfo) => {
              console.error('Find Therapist section error:', { error, errorInfo });
            }}
          >
            <FindTherapistSection />
          </TherapistListingErrorWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}