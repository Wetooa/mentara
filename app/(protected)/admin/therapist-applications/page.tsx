"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TherapistApplicationsTable } from "@/components/admin/TherapistApplicationsTable";
import { toast } from "sonner";

// Application status options
const APPLICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

interface TherapistApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  status: string;
  submissionDate: string;
  [key: string]: any; // For other properties
}

export default function TherapistApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [applications, setApplications] = useState<TherapistApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications from the API
  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build the query parameters
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      // Call the API
      const response = await fetch(
        `/api/therapist/application?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications);
    } catch (err) {
      console.error("Error fetching therapist applications:", err);
      setError("Failed to load applications. Please try again.");
      toast.error("Error loading applications");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch applications on initial load and when status filter changes
  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  // Filter applications based on search query
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      app.firstName.toLowerCase().includes(searchLower) ||
      app.lastName.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower) ||
      app.providerType.toLowerCase().includes(searchLower) ||
      app.province.toLowerCase().includes(searchLower)
    );
  });

  // Handle status change
  const handleStatusChange = async (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => {
    // This is called after the API request succeeds in the TherapistApplicationsTable component
    // Update the local state to reflect the change
    setApplications((prevApplications) =>
      prevApplications.map((app) => (app.id === id ? { ...app, status } : app))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Therapist Applications
        </h1>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              setStatusFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={APPLICATION_STATUS.PENDING}>
                Pending
              </SelectItem>
              <SelectItem value={APPLICATION_STATUS.APPROVED}>
                Approved
              </SelectItem>
              <SelectItem value={APPLICATION_STATUS.REJECTED}>
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="pl-9 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => fetchApplications()}>
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading applications...</p>
          </div>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => fetchApplications()}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <TherapistApplicationsTable
            applications={filteredApplications}
            onStatusChange={handleStatusChange}
          />

          {filteredApplications.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              {searchQuery || statusFilter
                ? "No applications match your filters."
                : "No therapist applications found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
