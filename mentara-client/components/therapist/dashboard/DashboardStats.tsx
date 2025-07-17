import React from "react";
import { Clock, Trash, DollarSign, UserPlus } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    activePatients: number;
    rescheduled: number;
    cancelled: number;
    income: number;
    patientStats: {
      total: number;
      percentage: number;
      months: number;
      chartData: Array<{ month: string; value: number }>;
    };
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        value={stats.activePatients}
        label="Active Patients"
        icon={<UserPlus className="h-5 w-5 text-white" />}
        iconBg="bg-blue-700"
      />
      <StatCard
        value={stats.rescheduled}
        label="Rescheduled"
        icon={<Clock className="h-5 w-5 text-white" />}
        iconBg="bg-teal-600"
      />
      <StatCard
        value={stats.cancelled}
        label="Cancelled meetings"
        icon={<Trash className="h-5 w-5 text-white" />}
        iconBg="bg-red-800"
      />
      <StatCard
        value={stats.income}
        label="Today's income"
        icon={<DollarSign className="h-5 w-5 text-white" />}
        iconBg="bg-purple-700"
        prefix="₱"
        suffix="K"
      />
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  prefix?: string;
  suffix?: string;
}

function StatCard({
  value,
  label,
  icon,
  iconBg,
  prefix = "",
  suffix = "",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-3xl font-bold">
            {prefix}
            {value}
            {suffix}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
        <div className={`rounded-full p-2 ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}
