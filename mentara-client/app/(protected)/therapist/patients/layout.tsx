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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  usePatientsList,
  usePatientsRequests,
  useAcceptPatientRequest,
  useDenyPatientRequest,
  useRemovePatient,
} from "@/hooks/therapist/usePatientsList";
import { useCalendarMeetings } from "@/hooks/calendar/useCalendarMeetings";
import AppointmentCalendar from "@/components/calendar-02";
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

  console.log("Patient Requests Data:", patientRequests);

  // Mutations
  const acceptRequest = useAcceptPatientRequest();
  const denyRequest = useDenyPatientRequest();
  const removePatient = useRemovePatient();

  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: 'all' });

  // Fetch meeting data for calendar
  const {
    meetings: meetingsData,
    isLoading: loadingMeetings,
    error: meetingsError,
    refetch: refetchMeetings,
  } = useCalendarMeetings({ limit: 100 });

  // Helper functions
  const searchPatients = (query: string) => {
    setSearchQuery(query);
  };

  const updateFilters = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const refreshData = () => {
    refetchPatients();
    refetchRequests();
    refetchMeetings();
  };

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
    <div className="flex h-full">
      {/* Left sidebar for patient list */}
      <div className="w-64 md:w-72 lg:w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Availability button with professional healthcare styling */}
        <div className="p-2 md:p-3 border-b border-slate-200">
          <button className="w-full py-2 px-3 md:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex justify-between items-center text-sm md:text-base transition-colors duration-200 shadow-sm">
            <span className="font-medium">Manage Availability</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="md:w-[18px] md:h-[18px]"
            >
              <path
                d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Calendar section with professional styling */}
        <div className="p-2 md:p-3 border-b border-slate-200">
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <h3 className="font-semibold text-sm md:text-base text-blue-900">Appointments</h3>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
              {meetingsData?.length || 0} scheduled
            </span>
          </div>

          {/* Full-width Appointment Calendar */}
          <div className="appointment-calendar-container bg-white rounded-lg border border-slate-200">
            <AppointmentCalendar
              meetings={meetingsData || []}
              selected={selectedDate}
              onSelect={setSelectedDate}
              showMeetingDetails={false}
              className="w-full border-0"
            />
          </div>
        </div>

        {/* Patient list section */}
        <div className="p-2 md:p-3 flex-1 overflow-hidden flex flex-col">
          <div className="mb-2 md:mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm md:text-base text-blue-900">My Patients</h3>
            <button
              onClick={refreshData}
              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
              title="Refresh patients list"
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${loadingPatients ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Error notification with professional styling */}
          {patientsError && (
            <div className="mb-2 md:mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-600 mr-2" />
                <p className="text-[10px] md:text-xs text-blue-800">
                  {(patientsError as any)?.message?.includes("mock data") 
                    ? "No assigned clients yet - new assignments will appear here"
                    : "Unable to load patient data"}
                </p>
              </div>
            </div>
          )}

          {/* Search and filter with professional styling */}
          <div className="relative mb-2 md:mb-3">
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => searchPatients(e.target.value)}
              className="w-full pl-7 md:pl-9 pr-4 py-1.5 md:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm transition-colors duration-200"
              disabled={loadingPatients}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              <button
                className="text-slate-500 hover:text-blue-600 flex items-center text-[10px] md:text-xs transition-colors duration-200"
                onClick={() => setFilterOpen(!filterOpen)}
                disabled={loadingPatients}
              >
                {filters.status === 'all' ? 'All' : filters.status?.charAt(0).toUpperCase() + filters.status?.slice(1)}{" "}
                {filterOpen ? (
                  <ChevronDown size={12} className="md:w-[14px] md:h-[14px]" />
                ) : (
                  <ChevronRight size={12} className="md:w-[14px] md:h-[14px]" />
                )}
              </button>
            </div>
          </div>

          {/* Filter dropdown with professional styling */}
          {filterOpen && (
            <div className="mb-2 md:mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] md:text-xs font-medium text-slate-700">Status</label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => updateFilters({ status: e.target.value as 'active' | 'inactive' | 'completed' | 'all' })}
                    className="w-full mt-1 text-[10px] md:text-xs border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Patients</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Patient list */}
          <div className="flex-1 overflow-y-auto">
            {loadingPatients && (!myPatients || myPatients.length === 0) ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Loading patients...</p>
                </div>
              </div>
            ) : (!filteredPatients || filteredPatients.length === 0) ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">No patients found</p>
                  {searchQuery && (
                    <p className="text-xs text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  )}
                </div>
              </div>
            ) : (
              filteredPatients.map((patient: any) => {
                const isActive = pathname.includes(`/patients/${patient.userId}`);
                const patientName = `${patient.user?.firstName || ""} ${patient.user?.lastName || ""}`;

                return (
                  <Link
                    key={patient.userId}
                    href={`/therapist/patients/${patient.userId}`}
                  >
                    <div
                      className={`flex items-center p-1.5 md:p-2 rounded-lg mb-1.5 md:mb-2 transition-colors duration-200 ${
                        isActive ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden mr-2 md:mr-3 bg-gray-200 flex-shrink-0">
                        <Image
                          src={patient.user?.profilePicture || "/avatar-placeholder.png"}
                          alt={patientName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-xs md:text-sm truncate ${isActive ? "font-semibold text-blue-900" : "font-medium"}`}
                        >
                          {patientName}
                        </h4>
                        <p className="text-[10px] md:text-xs text-gray-500 truncate">
                          {patient.user?.email}
                        </p>
                        <div className="flex items-center mt-0.5 md:mt-1">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1.5 md:mr-2 bg-green-400" />
                          <span className="text-[9px] md:text-xs text-gray-400">
                            Active since {new Date(patient.assignedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-0.5 md:space-x-1 flex-shrink-0">
                        <button className="p-0.5 md:p-1 text-gray-400 hover:text-gray-600">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button className="p-0.5 md:p-1 text-gray-400 hover:text-gray-600">
                          <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Desktop Vertical Tabs */}
        <div className="p-2 md:p-3 border-t border-slate-200">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("patients")}
              className={`w-full px-4 py-3 text-sm font-medium transition-colors rounded-md text-left ${
                activeTab === "patients"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              My Patients ({filteredPatients?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`w-full px-4 py-3 text-sm font-medium transition-colors rounded-md text-left ${
                activeTab === "requests"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Requests ({filteredRequests?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {isPatientSelected ? (
          children
        ) : (
          <div className="p-4 lg:p-6">
            {activeTab === "patients" ? (
              <>
                <h2 className="text-lg font-semibold mb-4 hidden lg:block">My Patients</h2>
                {loadingPatients ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (!filteredPatients || filteredPatients.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mb-4" />
                    <p className="text-base lg:text-lg text-gray-500 mb-2">No active patients</p>
                    <p className="text-sm text-gray-400">Accepted patient requests will appear here</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredPatients.map((patient: any) => (
                      <MyPatientCard key={patient.userId} patient={patient} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4 hidden lg:block">Patient Requests</h2>
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (!filteredRequests || filteredRequests.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mb-4" />
                    <p className="text-base lg:text-lg text-gray-500 mb-2">No pending requests</p>
                    <p className="text-sm text-gray-400">Patient connection requests will appear here</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredRequests.map((request: any) => (
                      <PatientRequestCard key={request.userId} request={request} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
