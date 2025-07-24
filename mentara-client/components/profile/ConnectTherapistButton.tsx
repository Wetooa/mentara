"use client";

import { Button } from "@/components/ui/button";
import { useTherapistRequest } from "@/hooks/therapist/useTherapistRequest";
import { UserPlus, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectTherapistButtonProps {
  therapistId: string;
  connectionStatus: 'connected' | 'pending' | null;
  therapistName: string;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ConnectTherapistButton({
  therapistId,
  connectionStatus,
  therapistName,
  className,
  variant = "default",
  size = "default",
}: ConnectTherapistButtonProps) {
  const { requestTherapist, isLoading } = useTherapistRequest();

  const handleConnect = () => {
    if (connectionStatus === null) {
      requestTherapist(therapistId);
    }
  };

  // Render different states based on connection status
  if (connectionStatus === 'connected') {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("cursor-default", className)}
        disabled
      >
        <Check className="w-4 h-4 mr-2" />
        Connected
      </Button>
    );
  }

  if (connectionStatus === 'pending') {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("cursor-default", className)}
        disabled
      >
        <Clock className="w-4 h-4 mr-2" />
        Waiting for Approval
      </Button>
    );
  }

  // No connection - show connect button
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleConnect}
      disabled={isLoading}
    >
      <UserPlus className="w-4 h-4 mr-2" />
      {isLoading ? "Connecting..." : "Connect with this Therapist"}
    </Button>
  );
}

export default ConnectTherapistButton;