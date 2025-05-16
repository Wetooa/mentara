import React from "react";
import TherapistCard from "./TherapistCard";
import { mockTherapists, TherapistData } from "@/data/mockTherapistListingData";

interface TherapistListingProps {
  searchQuery: string;
  filter: string;
}

export default function TherapistListing({
  searchQuery,
  filter,
}: TherapistListingProps) {
  // Filter therapists based on search query and selected filter
  const filteredTherapists = mockTherapists.filter((therapist) => {
    const matchesSearch =
      searchQuery === "" ||
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      filter === "All" ||
      therapist.specialties.some((specialty) => specialty === filter);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredTherapists.map((therapist) => (
        <TherapistCard key={therapist.id} therapist={therapist} />
      ))}
    </div>
  );
}
