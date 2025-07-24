import React from "react";

interface DashboardGreetingProps {
  name: string;
}

export default function DashboardGreeting({ name }: DashboardGreetingProps) {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("en-US", options);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-amber-900">
        {getGreeting()}, {name}
      </h1>
      <p className="text-amber-700 mt-1">{formattedDate}</p>
    </div>
  );
}
