import React from "react";
import { Calendar, Clock, CheckCircle, Filter } from "lucide-react";

interface WorksheetsSidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  therapistFilter: string;
  setTherapistFilter: (therapist: string) => void;
}

export default function WorksheetsSidebar({
  activeFilter,
  setActiveFilter,
  therapistFilter,
  setTherapistFilter,
}: WorksheetsSidebarProps) {
  const filters = [
    {
      id: "everything",
      name: "Everything",
      icon: <Filter className="h-4 w-4" />,
    },
    {
      id: "upcoming",
      name: "Upcoming",
      icon: <Calendar className="h-4 w-4" />,
    },
    { id: "past_due", name: "Past Due", icon: <Clock className="h-4 w-4" /> },
    {
      id: "completed",
      name: "Completed",
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-medium text-gray-700 mb-3">Filters</h2>

      {/* Filter buttons */}
      <div className="space-y-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
              activeFilter === filter.id
                ? "bg-green-100 text-green-800"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="mr-3 text-green-600">{filter.icon}</span>
            <span>{filter.name}</span>
          </button>
        ))}
      </div>

      {/* Therapist filter */}
      <div className="mt-6">
        <label
          htmlFor="therapistFilter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          From Therapist:
        </label>
        <input
          type="text"
          id="therapistFilter"
          value={therapistFilter}
          onChange={(e) => setTherapistFilter(e.target.value)}
          placeholder="Type therapist name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );
}
