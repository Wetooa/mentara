"use client";

import React from "react";
import { Users } from "lucide-react";

export default function PatientsPage() {
  return (
    <main className="flex flex-col items-center justify-center h-full bg-gray-50 text-center p-6" aria-label="Patients page">
      <div className="rounded-full bg-primary/10 p-6 mb-4" aria-hidden="true">
        <Users size={48} className="text-primary" />
      </div>
      <h2 className="text-xl font-medium mb-2">Select a Patient</h2>
      <p className="text-gray-600 max-w-md">
        Please select a patient from the sidebar to view their profile,
        treatment plan, and session history.
      </p>
    </main>
  );
}
