import React from "react";

interface PatientInfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function PatientInfoCard({
  icon,
  label,
  value,
}: PatientInfoCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-start">
        {icon}
        <div className="ml-3">
          <div className="text-xs text-gray-500">{label}</div>
          <div className="font-medium">{value}</div>
        </div>
      </div>
    </div>
  );
}
