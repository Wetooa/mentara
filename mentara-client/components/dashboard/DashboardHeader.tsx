"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserDashboardData } from "@/lib/api/types/dashboard";
import ProfileSettings from "./ProfileSettings";

interface DashboardHeaderProps {
  user: UserDashboardData["user"];
  onBookSession?: () => void;
}

export default function DashboardHeader({ user, onBookSession }: DashboardHeaderProps) {
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  // Get current time to display appropriate greeting
  const currentHour = new Date().getHours();
  let greeting = "Good morning";

  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  const handleBookSession = () => {
    onBookSession?.();
  };

  const handleViewProfile = () => {
    setIsProfileSettingsOpen(true);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {user.name}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your mental health journey
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={handleBookSession}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Book Session
        </button>
        <button 
          onClick={handleViewProfile}
          className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
        >
          View Profile
        </button>
      </div>

      <ProfileSettings
        user={user}
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
      />
    </div>
  );
}
