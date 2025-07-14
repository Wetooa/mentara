"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TherapistApplicationsTable } from "@/components/admin/TherapistApplicationsTable";
import { motion } from "framer-motion";
import { fadeDown } from "@/lib/animations";
import { useTherapistApplications } from "@/hooks/useTherapistApplications";

// Application status options
const APPLICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export default function TherapistApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Use React Query hook for data fetching
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useTherapistApplications({
    status: statusFilter || undefined,
  });

  // Filter applications based on search query using useMemo for performance
  const filteredApplications = useMemo(() => {
    if (!applications || applications.length === 0) return [];
    if (!searchQuery) return applications;

    const searchLower = searchQuery.toLowerCase();
    return applications.filter(
      (app) =>
        app.firstName?.toLowerCase().includes(searchLower) ||
        app.lastName?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.providerType?.toLowerCase().includes(searchLower) ||
        app.province?.toLowerCase().includes(searchLower)
    );
  }, [applications, searchQuery]);

  // Handle status change - React Query will automatically update the cache
  const handleStatusChange = async () => {
    // React Query mutation in TherapistApplicationsTable will handle the update
    // No manual state management needed - React Query cache will be invalidated
  };

  return (
    <motion.div
      variants={fadeDown}
      initial="initial"
      animate="animate"
      exit="exit"
    >
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
            <Button variant="outline" onClick={() => refetch()}>
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
            <p className="text-red-500">
              {error instanceof Error
                ? error.message
                : "Failed to load applications. Please try again."}
            </p>
            <Button
              onClick={() => refetch()}
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
    </motion.div>
  );
}
