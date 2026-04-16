import React from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

interface Worksheet {
  id: string;
  title: string;
  assignedDate: string;
  status: "completed" | "pending" | "overdue";
}

interface PatientWorksheetsProps {
  worksheets: Worksheet[];
  patientId: string;
}

export default function PatientWorksheets({
  worksheets,
  patientId,
}: PatientWorksheetsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-50";
      case "pending":
        return "text-amber-500 bg-amber-50";
      case "overdue":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Assigned Worksheets</h3>
        <button className="py-2 px-4 bg-primary text-white rounded-md flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Assign Worksheet
        </button>
      </div>

      {worksheets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {worksheets.map((worksheet) => (
            <Link
              key={worksheet.id}
              href={`/therapist/patients/${patientId}/worksheets/${worksheet.id}`}
              className="bg-white p-4 rounded-lg shadow flex items-start hover:shadow-md transition-shadow"
            >
              <div className="p-2 rounded-md bg-primary/10 text-primary mr-3">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{worksheet.title}</h4>
                <p className="text-sm text-gray-500">
                  Assigned: {worksheet.assignedDate}
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs mt-2 ${getStatusColor(worksheet.status)}`}
                >
                  {worksheet.status.charAt(0).toUpperCase() +
                    worksheet.status.slice(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">No worksheets assigned yet</p>
          <button className="py-2 px-4 bg-primary text-white rounded-md inline-flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Assign First Worksheet
          </button>
        </div>
      )}
    </div>
  );
}
