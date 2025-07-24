"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Users,
  Clock,
  MessageCircle,
  Calendar,
  UserX,
  UserCheck,
  Eye,
  UserMinus,
} from "lucide-react";
import {
  usePatientsList,
  usePatientsRequests,
  useAcceptPatientRequest,
  useDenyPatientRequest,
  useRemovePatient,
} from "@/hooks/therapist/usePatientsList";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Fetch data using the hooks
  const {
    data: myPatients,
    isLoading: loadingPatients,
    error: patientsError,
    refetch: refetchPatients,
  } = usePatientsList();

  console.log("My Patients Data:", myPatients);

  const {
    data: patientRequests,
    isLoading: loadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = usePatientsRequests();

  // Mutations
  const acceptRequest = useAcceptPatientRequest();
  const denyRequest = useDenyPatientRequest();
  const removePatient = useRemovePatient();

  // Local state for search
  const [searchQuery, setSearchQuery] = useState("");

  // Filter functions
  const filterBySearch = (patients: any[], query: string) => {
    if (!query) return patients;
    return patients.filter((patient: any) => {
      const name =
        `${patient.user?.firstName || ""} ${patient.user?.lastName || ""}`.toLowerCase();
      const email = patient.user?.email?.toLowerCase() || "";
      return (
        name.includes(query.toLowerCase()) ||
        email.includes(query.toLowerCase())
      );
    });
  };

  // Filtered data
  const filteredPatients = filterBySearch(myPatients || [], searchQuery);
  const filteredRequests = filterBySearch(patientRequests || [], searchQuery);

  // Action handlers
  const handleAcceptRequest = async (
    patientId: string,
    patientName: string
  ) => {
    try {
      await acceptRequest.mutateAsync(patientId);
      toast.success(`Accepted request from ${patientName}`);
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleDenyRequest = async (patientId: string, patientName: string) => {
    try {
      await denyRequest.mutateAsync(patientId);
      toast.success(`Denied request from ${patientName}`);
    } catch (error) {
      toast.error("Failed to deny request");
    }
  };

  const handleRemovePatient = async (
    patientId: string,
    patientName: string
  ) => {
    try {
      await removePatient.mutateAsync(patientId);
      toast.success(`Removed ${patientName} from your patients`);
    } catch (error) {
      toast.error("Failed to remove patient");
    }
  };

  const refreshData = () => {
    refetchPatients();
    refetchRequests();
  };

  // Check if a patient is selected
  const isPatientSelected = pathname.split("/").length > 3;

  // Tab state
  const [activeTab, setActiveTab] = useState("patients");

  // Patient Card Components
  const MyPatientCard = ({ patient }: { patient: any }) => {
    const isActive = pathname.includes(`/patients/${patient.userId}`);
    const patientName = `${patient.user?.firstName || ""} ${patient.user?.lastName || ""}`;

    return (
      <div
        className={`p-3 rounded-lg border mb-3 ${isActive ? "bg-primary/10 border-primary" : "bg-white border-gray-200 hover:border-gray-300"}`}
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={patient.user?.profilePicture || "/avatar-placeholder.png"}
              alt={patientName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{patientName}</h4>
            <p className="text-xs text-gray-500 truncate">
              {patient.user?.email}
            </p>
            <p className="text-xs text-gray-400 truncate">
              Active since {new Date(patient.assignedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/therapist/patients/${patient.userId}`}>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 lg:h-7 min-w-0"
            >
              <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">View Profile</span>
              <span className="sm:hidden">View</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 lg:h-7 min-w-0"
          >
            <MessageCircle className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Message</span>
            <span className="sm:hidden">Chat</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 lg:h-7 min-w-0"
          >
            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Schedule</span>
            <span className="sm:hidden">Book</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 lg:h-7 text-red-600 hover:text-red-700 min-w-0"
            onClick={() => handleRemovePatient(patient.userId, patientName)}
            disabled={removePatient.isPending}
          >
            <UserMinus className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Remove</span>
            <span className="sm:hidden">Remove</span>
          </Button>
        </div>
      </div>
    );
  };

  const PatientRequestCard = ({ request }: { request: any }) => {
    const patientName = `${request.user?.firstName || ""} ${request.user?.lastName || ""}`;

    return (
      <div className="p-3 rounded-lg border bg-yellow-50 border-yellow-200 mb-3">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={request.user?.profilePicture || "/avatar-placeholder.png"}
              alt={patientName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{patientName}</h4>
            <p className="text-xs text-gray-500 truncate">
              {request.user?.email}
            </p>
            <p className="text-xs text-gray-400 truncate">
              Requested {new Date(request.requestedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="text-xs h-8 lg:h-7 bg-green-600 hover:bg-green-700 min-w-0 flex-1 sm:flex-none"
            onClick={() => handleAcceptRequest(request.userId, patientName)}
            disabled={acceptRequest.isPending}
          >
            <UserCheck className="w-3 h-3 mr-1 flex-shrink-0" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 lg:h-7 text-red-600 hover:text-red-700 min-w-0 flex-1 sm:flex-none"
            onClick={() => handleDenyRequest(request.userId, patientName)}
            disabled={denyRequest.isPending}
          >
            <UserX className="w-3 h-3 mr-1 flex-shrink-0" />
            Deny
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 lg:h-7 min-w-0"
          >
            <MessageCircle className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Message</span>
            <span className="sm:hidden">Chat</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 lg:h-7 min-w-0"
          >
            <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">View Profile</span>
            <span className="sm:hidden">View</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Mobile Header with Tabs - visible only on mobile */}
      <div className="lg:hidden border-b border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">Patients</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshData}
            className="p-1.5"
            disabled={loadingPatients || loadingRequests}
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingPatients || loadingRequests ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
        </div>

        {/* Mobile Error notifications */}
        {/* {(patientsError || requestsError) && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-xs text-yellow-800">
                Failed to load some data
              </p>
            </div>
          </div>
        )} */}

        {/* Mobile Horizontal Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("patients")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors rounded-md text-center ${
              activeTab === "patients"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            My Patients ({filteredPatients?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors rounded-md text-center ${
              activeTab === "requests"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Requests ({filteredRequests?.length || 0})
          </button>
        </div>
      </div>

      {/* Desktop Left sidebar - Controls only */}
      <div className="hidden lg:flex w-80 border-r border-gray-200 bg-white flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">Patients</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshData}
            className="p-1.5"
            disabled={loadingPatients || loadingRequests}
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingPatients || loadingRequests ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Desktop Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
        </div>

        {/* Desktop Error notifications */}
        {/* {(patientsError || requestsError) && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-xs text-yellow-800">
                Failed to load some data
              </p>
            </div>
          </div>
        )} */}

        {/* Desktop Vertical Tabs */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("patients")}
            className={`w-full px-4 py-3 text-sm font-medium transition-colors rounded-md text-left ${
              activeTab === "patients"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            My Patients ({filteredPatients?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full px-4 py-3 text-sm font-medium transition-colors rounded-md text-left ${
              activeTab === "requests"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Requests ({filteredRequests?.length || 0})
          </button>
        </div>
      </div>

      {/* Main content area - Patient cards */}
      <div className="flex-1 overflow-auto">
        {!isPatientSelected ? (
          <div className="p-4 lg:p-6">
            {activeTab === "patients" ? (
              <>
                <h2 className="text-lg font-semibold mb-4 hidden lg:block">
                  My Patients
                </h2>
                {loadingPatients ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : filteredPatients?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mb-4" />
                    <p className="text-base lg:text-lg text-gray-500 mb-2">
                      No active patients
                    </p>
                    <p className="text-sm text-gray-400">
                      Accepted patient requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredPatients?.map((patient: any) => (
                      <MyPatientCard key={patient.userId} patient={patient} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4 hidden lg:block">
                  Patient Requests
                </h2>
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : filteredRequests?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mb-4" />
                    <p className="text-base lg:text-lg text-gray-500 mb-2">
                      No pending requests
                    </p>
                    <p className="text-sm text-gray-400">
                      Patient connection requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredRequests?.map((request: any) => (
                      <PatientRequestCard
                        key={request.userId}
                        request={request}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
