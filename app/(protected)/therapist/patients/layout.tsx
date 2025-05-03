"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { mockPatientsData } from "@/data/mockPatientsData";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Mock patient data list
  const patients = mockPatientsData || [];

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a patient is selected
  const isPatientSelected = pathname.split("/").length > 3;

  return (
    <div className="flex h-full">
      {/* Left sidebar for patient list */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        {/* Availability button */}
        <div className="p-3 border-b border-gray-200">
          <button className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-md flex justify-between items-center">
            <span>Availability</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Appointments</h3>
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
          <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {/* Days numbers with some dates highlighted */}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const isActive = [1, 8, 15, 22, 29].includes(day);
              return (
                <div
                  key={day}
                  className={`
                  h-8 w-8 flex items-center justify-center rounded-full mx-auto 
                  ${isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Patient list section */}
        <div className="p-3 flex-1 overflow-hidden flex flex-col">
          <div className="mb-3">
            <h3 className="font-medium">My Patients</h3>
          </div>

          {/* Search and filter */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              <button
                className="text-gray-500 hover:text-gray-700 flex items-center text-xs"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                All{" "}
                {filterOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Patient list */}
          <div className="flex-1 overflow-y-auto">
            {filteredPatients.map((patient) => {
              const isActive = pathname.includes(`/patients/${patient.id}`);

              return (
                <Link
                  key={patient.id}
                  href={`/therapist/patients/${patient.id}`}
                >
                  <div
                    className={`flex items-center p-2 rounded-md mb-2 ${
                      isActive ? "bg-primary/10" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200">
                      <Image
                        src={patient.avatar || "/avatar-placeholder.png"}
                        alt={patient.name}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-sm ${isActive ? "font-medium" : ""}`}
                      >
                        {patient.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {patient.diagnosis}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
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
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
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
            })}
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
