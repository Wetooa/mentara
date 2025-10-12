import React from "react";
import { Calendar, Clock, CheckCircle, Filter, Eye } from "lucide-react";

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
    {
      id: "reviewed",
      name: "Reviewed",
      icon: <Eye className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-72 bg-white border-r border-border/50 p-6 overflow-y-auto h-full min-h-screen flex flex-col sticky top-0 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Worksheets</h2>
        <p className="text-sm text-gray-500">Filter your assignments</p>
      </div>

      {/* Filter buttons */}
      <div className="space-y-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center w-full px-4 py-3 text-left rounded-xl transition-all font-medium ${
              activeFilter === filter.id
                ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-sm"
                : "text-gray-700 hover:bg-gray-50 border border-transparent"
            }`}
          >
            <span
              className={`mr-3 ${activeFilter === filter.id ? "text-primary" : "text-gray-500"}`}
            >
              {filter.icon}
            </span>
            <span>{filter.name}</span>
          </button>
        ))}
      </div>

      {/* Therapist filter */}
      <div className="pt-6 border-t border-border/50">
        <label
          htmlFor="therapistFilter"
          className="block text-sm font-semibold text-gray-900 mb-3"
        >
          From Therapist
        </label>
        <input
          type="text"
          id="therapistFilter"
          value={therapistFilter}
          onChange={(e) => setTherapistFilter(e.target.value)}
          placeholder="Search therapist..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />
      </div>
    </div>
  );
}
