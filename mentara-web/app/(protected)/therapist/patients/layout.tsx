"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  
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

  console.log("Patient Requests Data:", patientRequests);

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

  // Client Card Components - Redesigned
  const MyPatientCard = ({ patient }: { patient: any }) => {
    const isActive = pathname.includes(`/patients/${patient.userId}`);
    const patientName = `${patient.user?.firstName || ""} ${patient.user?.lastName || ""}`;
    const daysSinceAssigned = Math.floor((Date.now() - new Date(patient.assignedAt).getTime()) / (1000 * 60 * 60 * 24));
    const lastLogin = patient.user?.lastLoginAt ? new Date(patient.user.lastLoginAt) : null;

    return (
      <Link href={`/therapist/patients/${patient.userId}`}>
        <div
          className={`group p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
            isActive 
              ? "bg-secondary/10 border-secondary shadow-md" 
              : "bg-white border-gray-200 hover:border-secondary/30 hover:shadow-lg"
          }`}
        >
          {/* Header with Avatar */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-secondary/20 shadow-md">
                <Image
                  src={patient.user?.avatarUrl || patient.user?.profilePicture || "/avatar-placeholder.png"}
                  alt={patientName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online indicator if logged in recently */}
              {lastLogin && (Date.now() - lastLogin.getTime()) < 1000 * 60 * 30 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900 truncate mb-1 group-hover:text-secondary transition-colors">
                {patientName}
              </h4>
              <p className="text-xs text-gray-500 truncate mb-2">
                {patient.user?.email}
              </p>
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-secondary/10 rounded-full">
                  <p className="text-xs font-semibold text-secondary">
                    {daysSinceAssigned} {daysSinceAssigned === 1 ? 'day' : 'days'} connected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Preview */}
          {patient.user?.bio && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                {patient.user.bio}
              </p>
            </div>
          )}

          {/* Last Activity */}
          {lastLogin && (
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3 text-secondary" />
              <span>Last active: {new Date(lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(lastLogin).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs hover:bg-secondary/10 hover:border-secondary/30 hover:text-secondary"
              onClick={(e) => { e.preventDefault(); router.push(`/therapist/messages?contact=${patient.userId}`); }}
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Message
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs hover:bg-secondary/10 hover:border-secondary/30 hover:text-secondary"
              onClick={(e) => { e.preventDefault(); router.push(`/therapist/schedule?client=${patient.userId}`); }}
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Schedule
            </Button>
          </div>
        </div>
      </Link>
    );
  };

  const PatientRequestCard = ({ request }: { request: any }) => {
    const patientName = `${request.user?.firstName || ""} ${request.user?.lastName || ""}`;
    const daysSinceRequest = Math.floor((Date.now() - new Date(request.requestedAt || request.assignedAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="p-5 rounded-xl border-2 bg-gradient-to-br from-secondary/5 to-white border-secondary/30 shadow-md hover:shadow-lg transition-all duration-300">
        {/* Header with Avatar */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-secondary/30 shadow-md">
              <Image
                src={request.user?.avatarUrl || request.user?.profilePicture || "/avatar-placeholder.png"}
                alt={patientName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            {/* New request badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-xs font-bold text-secondary-foreground">!</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-gray-900 truncate mb-1">
              {patientName}
            </h4>
            <p className="text-xs text-gray-500 truncate mb-2">
              {request.user?.email}
            </p>
            <div className="px-2 py-0.5 bg-secondary/20 rounded-full w-fit">
              <p className="text-xs font-semibold text-secondary">
                {daysSinceRequest === 0 ? 'Today' : `${daysSinceRequest} ${daysSinceRequest === 1 ? 'day' : 'days'} ago`}
              </p>
            </div>
          </div>
        </div>

        {/* Bio Preview */}
        {request.user?.bio && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-secondary/20">
            <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
              {request.user.bio}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className="text-xs bg-secondary hover:bg-secondary/90 shadow-sm"
            onClick={() => handleAcceptRequest(request.userId, patientName)}
            disabled={acceptRequest.isPending}
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={() => handleDenyRequest(request.userId, patientName)}
            disabled={denyRequest.isPending}
          >
            <UserX className="w-3.5 h-3.5 mr-1.5" />
            Deny
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
          <h3 className="font-bold text-lg text-gray-900">My Clients</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshData}
            className="p-1.5 text-secondary hover:bg-secondary/10"
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
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm"
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
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all rounded-lg text-center ${
              activeTab === "patients"
                ? "bg-secondary text-secondary-foreground shadow-md"
                : "bg-white text-gray-700 hover:bg-secondary/5 border border-gray-200"
            }`}
          >
            My Clients ({filteredPatients?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all rounded-lg text-center ${
              activeTab === "requests"
                ? "bg-secondary text-secondary-foreground shadow-md"
                : "bg-white text-gray-700 hover:bg-secondary/5 border border-gray-200"
            }`}
          >
            Requests ({filteredRequests?.length || 0})
          </button>
        </div>
      </div>

      {/* Desktop Left sidebar - Controls only */}
      <div className="hidden lg:flex w-80 border-r border-gray-200 bg-white flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">My Clients</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshData}
            className="p-1.5 text-secondary hover:bg-secondary/10"
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
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary text-sm"
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
            className={`w-full px-4 py-3 text-sm font-semibold transition-all rounded-lg text-left ${
              activeTab === "patients"
                ? "bg-secondary text-secondary-foreground shadow-md"
                : "bg-white text-gray-700 hover:bg-secondary/5 border border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>My Clients</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "patients" 
                  ? "bg-secondary-foreground/20" 
                  : "bg-gray-100"
              }`}>
                {filteredPatients?.length || 0}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full px-4 py-3 text-sm font-semibold transition-all rounded-lg text-left ${
              activeTab === "requests"
                ? "bg-secondary text-secondary-foreground shadow-md"
                : "bg-white text-gray-700 hover:bg-secondary/5 border border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Requests</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "requests" 
                  ? "bg-secondary-foreground/20" 
                  : filteredRequests?.length > 0 ? "bg-secondary text-secondary-foreground" : "bg-gray-100"
              }`}>
                {filteredRequests?.length || 0}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main content area - Patient cards */}
      <div className="flex-1 overflow-auto">
        {!isPatientSelected ? (
          <div className="p-4 lg:p-6">
            {activeTab === "patients" ? (
              <>
                <div className="mb-6 hidden lg:block">
                  <h2 className="text-2xl font-bold text-gray-900">My Clients</h2>
                  <p className="text-gray-600 mt-1">Manage your client relationships</p>
                </div>
                {loadingPatients ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-secondary animate-spin" />
                  </div>
                ) : filteredPatients?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-6 rounded-2xl mb-4">
                      <Users className="h-16 w-16 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No Active Clients
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Accepted client requests will appear here. You'll be able to view their profiles and manage sessions.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredPatients?.map((patient: any) => (
                      <MyPatientCard key={patient.userId} patient={patient} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-6 hidden lg:block">
                  <h2 className="text-2xl font-bold text-gray-900">Client Requests</h2>
                  <p className="text-gray-600 mt-1">Review and respond to connection requests</p>
                </div>
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-secondary animate-spin" />
                  </div>
                ) : filteredRequests?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-6 rounded-2xl mb-4">
                      <Clock className="h-16 w-16 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No Pending Requests
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Client connection requests will appear here when clients request to work with you.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
