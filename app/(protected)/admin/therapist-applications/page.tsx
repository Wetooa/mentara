"use client";

import { useState, useEffect } from "react";
import { Check, X, ChevronRight, Search, Filter, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Application status options
const APPLICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Sample therapist applications data
const mockTherapistApplications = [
  {
    id: "1",
    firstName: "Tristan James",
    lastName: "Tolentino",
    email: "tristanjamestolentino56@gmail.com",
    mobile: "09472546834",
    province: "Cebu",
    providerType: "Psychologist",
    professionalLicenseType: "rpsy",
    status: APPLICATION_STATUS.PENDING,
    dateApplied: "2025-04-28T09:30:00.000Z",
  },
  {
    id: "2",
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@example.com",
    mobile: "09123456789",
    province: "Manila",
    providerType: "Psychiatrist",
    professionalLicenseType: "md",
    status: APPLICATION_STATUS.APPROVED,
    dateApplied: "2025-04-25T14:15:00.000Z",
  },
  {
    id: "3",
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "juan.delacruz@example.com",
    mobile: "09987654321",
    province: "Davao",
    providerType: "Licensed Professional Counselor",
    professionalLicenseType: "lpc",
    status: APPLICATION_STATUS.REJECTED,
    dateApplied: "2025-04-22T11:00:00.000Z",
  },
  {
    id: "4",
    firstName: "Anna",
    lastName: "Garcia",
    email: "anna.garcia@example.com",
    mobile: "09456789123",
    province: "Iloilo",
    providerType: "Clinical Psychologist",
    professionalLicenseType: "rpsy",
    status: APPLICATION_STATUS.PENDING,
    dateApplied: "2025-04-26T16:45:00.000Z",
  },
];

export default function TherapistApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [applications, setApplications] = useState(mockTherapistApplications);

  // Filter applications based on search query and status filter
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.providerType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === null || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case APPLICATION_STATUS.PENDING:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case APPLICATION_STATUS.APPROVED:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case APPLICATION_STATUS.REJECTED:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
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
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Provider Type</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.firstName} {application.lastName}
                  </TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{application.providerType}</TableCell>
                  <TableCell>{application.province}</TableCell>
                  <TableCell>{formatDate(application.dateApplied)}</TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/admin/therapist-applications/${application.id}`}
                        >
                          <Clock className="mr-1 h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </Button>
                      {application.status === APPLICATION_STATUS.PENDING && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          >
                            <Check className="mr-1 h-4 w-4" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <X className="mr-1 h-4 w-4" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No therapist applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
