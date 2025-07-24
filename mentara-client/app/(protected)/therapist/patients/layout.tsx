"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronDown, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { usePatientsList } from "@/hooks/therapist/usePatientsList";
import AppointmentCalendar from "@/components/calendar-02";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const api = useApi();
  
  // Use modern hook and implement filtering locally
  const { data: rawPatients, isLoading, error, refetch } = usePatientsList();
  
  // Fetch meetings/appointments for calendar
  const { data: meetingsData } = useQuery({
    queryKey: ['meetings', 'upcoming'],
    queryFn: () => api.meetings.getUpcomingMeetings(50), // Get up to 50 upcoming meetings
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    status: 'all' | 'active' | 'completed' | 'inactive';
  }>({
    status: 'all',
  });

  // Transform and filter patients
  const patients = rawPatients || [];
  
  // Local interface for patient data
  interface Patient {
    id: string;
    name: string;
    diagnosis?: string;
    email?: string;
    avatar?: string;
    currentSession: number;
    totalSessions: number;
  }

  const filteredPatients = patients.filter((patient: Patient) => {
    // Search filter
    const matchesSearch = 
      searchQuery === "" ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter (for now, just show all active patients since status isn't in PatientData)
    const matchesStatus = filters.status === 'all' || filters.status === 'active';

    return matchesSearch && matchesStatus;
  });

  // Helper functions
  const searchPatients = (query: string) => setSearchQuery(query);
  const updateFilters = (newFilters: Partial<typeof filters>) => 
    setFilters(prev => ({ ...prev, ...newFilters }));
  const refreshPatients = () => refetch();

  // Check if a patient is selected
  const isPatientSelected = pathname.split("/").length > 3;

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
              {meetingsData?.meetings?.length || 0} scheduled
            </span>
          </div>

          {/* Full-width Appointment Calendar */}
          <div className="appointment-calendar-container bg-white rounded-lg border border-slate-200 p-2">
            <AppointmentCalendar
              meetings={meetingsData?.meetings || []}
              selected={selectedDate}
              onSelect={setSelectedDate}
              showMeetingDetails={false}
              className="w-full"
            />
          </div>
        </div>

        {/* Patient list section */}
        <div className="p-2 md:p-3 flex-1 overflow-hidden flex flex-col">
          <div className="mb-2 md:mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm md:text-base text-blue-900">My Patients</h3>
            <button
              onClick={refreshPatients}
              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
              title="Refresh patients list"
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Error notification with professional styling */}
          {error && (
            <div className="mb-2 md:mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-600 mr-2" />
                <p className="text-[10px] md:text-xs text-blue-800">
                  {error.message.includes("mock data") 
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
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              <button
                className="text-slate-500 hover:text-blue-600 flex items-center text-[10px] md:text-xs transition-colors duration-200"
                onClick={() => setFilterOpen(!filterOpen)}
                disabled={isLoading}
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
            {isLoading && filteredPatients.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Loading patients...</p>
                </div>
              </div>
            ) : filteredPatients.length === 0 ? (
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
              filteredPatients.map((patient: Patient) => {
                const isActive = pathname.includes(`/patients/${patient.id}`);

                return (
                  <Link
                    key={patient.id}
                    href={`/therapist/patients/${patient.id}`}
                  >
                    <div
                      className={`flex items-center p-1.5 md:p-2 rounded-lg mb-1.5 md:mb-2 transition-colors duration-200 ${
                        isActive ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden mr-2 md:mr-3 bg-gray-200 flex-shrink-0">
                        <Image
                          src={patient.avatar || "/avatar-placeholder.png"}
                          alt={patient.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-xs md:text-sm truncate ${isActive ? "font-semibold text-blue-900" : "font-medium"}`}
                        >
                          {patient.name}
                        </h4>
                        <p className="text-[10px] md:text-xs text-gray-500 truncate">
                          {patient.diagnosis}
                        </p>
                        <div className="flex items-center mt-0.5 md:mt-1">
                          <div 
                            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1.5 md:mr-2 ${
                              patient.currentSession >= patient.totalSessions ? 'bg-blue-400' : 'bg-green-400'
                            }`}
                          />
                          <span className="text-[9px] md:text-xs text-gray-400">
                            Session {patient.currentSession}/{patient.totalSessions}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-0.5 md:space-x-1 flex-shrink-0">
                        <button className="p-0.5 md:p-1 text-gray-400 hover:text-gray-600">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="md:w-4 md:h-4"
                          >
                            <rect
                              x="4"
                              y="4"
                              width="16"
                              height="16"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M16 2V6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M8 2V6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M4 10H20"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                        <button className="p-0.5 md:p-1 text-gray-400 hover:text-gray-600">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="md:w-4 md:h-4"
                          >
                            <path
                              d="M12 5V19"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M19 12L5 12"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {isPatientSelected ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-center p-6">
            <div className="rounded-full bg-blue-100 p-6 mb-4 shadow-sm">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="4"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 3.13C17.7699 3.58317 19.0078 5.17885 19.0078 7.005C19.0078 8.83115 17.7699 10.4268 16 10.88"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Select a Patient</h2>
            <p className="text-slate-600 max-w-md">
              Choose a patient from the sidebar to view their profile,
              treatment plan, and session history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
