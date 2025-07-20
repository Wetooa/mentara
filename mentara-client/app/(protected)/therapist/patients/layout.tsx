"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronDown, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { usePatientsList } from "@/hooks/usePatientsList";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Use modern hook and implement filtering locally
  const { data: rawPatients, isLoading, error, refetch } = usePatientsList();
  
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
        {/* Availability button */}
        <div className="p-2 md:p-3 border-b border-gray-200">
          <button className="w-full py-2 px-3 md:px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-md flex justify-between items-center text-sm md:text-base">
            <span>Availability</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="md:w-[18px] md:h-[18px]"
            >
              <path
                d="M15.2324 5.23242L5.23242 15.2324M5.23242 5.23242L15.2324 15.2324"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Calendar section */}
        <div className="p-2 md:p-3 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <h3 className="font-medium text-sm md:text-base">Appointments</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              6
            </span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-xs bg-gray-100 rounded px-2 py-1">
              May 2023
            </span>
          </div>

          {/* Calendar header */}
          <div className="grid grid-cols-7 text-center text-[10px] md:text-xs text-gray-500 mb-1">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-center text-xs md:text-sm">
            {/* Days numbers with some dates highlighted */}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const isActive = [1, 8, 15, 22, 29].includes(day);
              return (
                <div
                  key={day}
                  className={`
                  h-6 w-6 md:h-8 md:w-8 flex items-center justify-center rounded-full mx-auto text-xs md:text-sm
                  ${isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Patient list section */}
        <div className="p-2 md:p-3 flex-1 overflow-hidden flex flex-col">
          <div className="mb-2 md:mb-3 flex items-center justify-between">
            <h3 className="font-medium text-sm md:text-base">My Patients</h3>
            <button
              onClick={refreshPatients}
              className="p-1.5 text-gray-500 hover:text-primary rounded-md hover:bg-gray-100"
              title="Refresh patients list"
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Error notification */}
          {error && (
            <div className="mb-2 md:mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-yellow-600 mr-2" />
                <p className="text-[10px] md:text-xs text-yellow-800">
                  {error.message.includes("mock data") 
                    ? "Using offline data - API unavailable"
                    : "Failed to load patients"}
                </p>
              </div>
            </div>
          )}

          {/* Search and filter */}
          <div className="relative mb-2 md:mb-3">
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => searchPatients(e.target.value)}
              className="w-full pl-7 md:pl-9 pr-4 py-1.5 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-xs md:text-sm"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              <button
                className="text-gray-500 hover:text-gray-700 flex items-center text-[10px] md:text-xs"
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

          {/* Filter dropdown */}
          {filterOpen && (
            <div className="mb-2 md:mb-3 p-2 bg-gray-50 rounded-md border">
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] md:text-xs font-medium text-gray-700">Status</label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => updateFilters({ status: e.target.value as 'active' | 'inactive' | 'completed' | 'all' })}
                    className="w-full mt-1 text-[10px] md:text-xs border border-gray-300 rounded px-2 py-1"
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
                      className={`flex items-center p-1.5 md:p-2 rounded-md mb-1.5 md:mb-2 ${
                        isActive ? "bg-primary/10" : "hover:bg-gray-100"
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
                          className={`text-xs md:text-sm truncate ${isActive ? "font-medium" : ""}`}
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
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center p-6">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21"
                  stroke="#658e32"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="4"
                  stroke="#658e32"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13"
                  stroke="#658e32"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 3.13C17.7699 3.58317 19.0078 5.17885 19.0078 7.005C19.0078 8.83115 17.7699 10.4268 16 10.88"
                  stroke="#658e32"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-2">No Patient Selected</h2>
            <p className="text-gray-600 max-w-md">
              Please select a patient from the sidebar to view their profile,
              treatment plan, and session history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
