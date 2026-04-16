import React, { useState } from "react";
import { Filter, FileText, Clock, CheckCircle, Plus, Eye } from "lucide-react";
import CreateWorksheetModal from "./CreateWorksheetModal";

interface TherapistWorksheetsSidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  patientFilter: string;
  setPatientFilter: (patient: string) => void;
}

export default function WorksheetsSidebar({
  activeFilter,
  setActiveFilter,
  patientFilter,
  setPatientFilter,
}: TherapistWorksheetsSidebarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filters = [
    {
      id: "everything",
      name: "Everything",
      icon: <Filter className="h-4 w-4" />,
    },
    {
      id: "assigned",
      name: "Assigned",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "past_due",
      name: "Past Due",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      id: "completed",
      name: "Completed",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      id: "reviewed",
      name: "Reviewed",
      icon: <Eye className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <button
          className="flex items-center justify-center w-full py-2 px-4 bg-[#436B00] hover:bg-[#129316] text-white font-medium rounded-md transition"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Worksheet
        </button>
      </div>

      <h2 className="text-lg font-medium text-gray-700 mb-3">Filters</h2>

      {/* Filter buttons */}
      <div className="space-y-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
              activeFilter === filter.id
                ? "bg-[#129316]/15 text-[#436B00]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className={`mr-3 ${
                activeFilter === filter.id ? "text-[#436B00]" : "text-gray-500"
              }`}
            >
              {filter.icon}
            </span>
            <span>{filter.name}</span>
          </button>
        ))}
      </div>

      {/* Patient filter */}
      <div className="mt-6">
        <label
          htmlFor="patientFilter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Patient Name:
        </label>
        <input
          type="text"
          id="patientFilter"
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
          placeholder="Search by patient name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#436B00]"
        />
      </div>

      {/* Create Worksheet Modal */}
      <CreateWorksheetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
