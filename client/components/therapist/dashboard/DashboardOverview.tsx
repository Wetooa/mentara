import React from "react";
import { ChevronDown } from "lucide-react";

interface DashboardOverviewProps {
  patientStats: {
    total: number;
    percentage: number;
    months: number;
    chartData: Array<{ month: string; value: number }>;
  };
}

export default function DashboardOverview({
  patientStats,
}: DashboardOverviewProps) {
  const { total, percentage, months, chartData } = patientStats;

  // Find min and max values for chart scaling
  const values = chartData.map((item) => item.value);
  const maxValue = Math.max(...values);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Total Patients for {months} months</h3>
        <button className="text-gray-500 flex items-center text-sm">
          <span className="mr-1">6 months</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-end">
          <span className="text-3xl font-bold">{total}</span>
          <span
            className={`ml-2 text-sm ${percentage >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {percentage >= 0 ? "+" : ""}
            {percentage}%
          </span>
        </div>
        <p className="text-xs text-gray-500">Compared to last period</p>
      </div>

      {/* Simple line chart */}
      <div className="h-32 flex items-end justify-between">
        {chartData.map((item, index) => {
          // Calculate height percentage based on max value
          const heightPercentage = (item.value / maxValue) * 100;

          return (
            <div key={index} className="flex flex-col items-center w-1/6">
              <div
                className="w-1 bg-teal-400 rounded-t"
                style={{
                  height: `${heightPercentage}%`,
                  minHeight: "4px",
                }}
              ></div>
              <span className="text-xs text-gray-500 mt-2">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
