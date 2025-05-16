"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import TherapistListing from "@/components/therapist/listing/TherapistListing";
import MeetingsSection from "@/components/therapist/listing/MeetingsSection";
import RecommendedSection from "@/components/therapist/listing/RecommendedSection";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TherapistPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  return (
    <div className="w-full h-full p-6 space-y-8">
      {/* Page Header */}
      <h1 className="text-2xl font-bold">My Therapists</h1>

      {/* Search and Filter */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedFilter}
          onValueChange={(value) => setSelectedFilter(value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue>{selectedFilter}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="CBT">CBT</SelectItem>
            <SelectItem value="DBT">DBT</SelectItem>
            <SelectItem value="EMDR">EMDR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Therapist Listings */}
      <TherapistListing searchQuery={searchQuery} filter={selectedFilter} />

      {/* Meetings and Recommended Sections placed side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        <div className="w-full lg:col-span-1">
          <MeetingsSection />
        </div>
        <div className="w-full lg:col-span-2 h-full">
          <RecommendedSection />
        </div>
      </div>
    </div>
  );
}
