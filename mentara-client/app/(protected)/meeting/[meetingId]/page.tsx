"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MeetingRoom } from "@/components/meeting/MeetingRoom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Video,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const api = useApi();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Get meeting details
  const {
    data: meeting,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => api.meetings.getMeeting(meetingId),
    enabled: !!meetingId,
    retry: false,
  });

  // Check media permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasPermission(true);
      } catch (error) {
        console.warn("Media permission denied:", error);
        setHasPermission(false);
      }
    };

    checkPermissions();
  }, []);

  const handleLeaveMeeting = () => {
    router.push("/user"); // Redirect to dashboard
  };

  const handleGrantPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasPermission(true);
      toast.success("Media permissions granted");
    } catch (error) {
      toast.error("Failed to grant media permissions");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Meeting Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This meeting doesn't exist or you don't have permission to join it.
            </p>
            <Button onClick={() => router.push("/user")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Meeting Not Available</h2>
            <p className="text-muted-foreground mb-4">
              This meeting is not currently available.
            </p>
            <Button onClick={() => router.push("/user")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show permission request if needed
  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">Camera & Microphone Access</h2>
            <p className="text-muted-foreground mb-4">
              This meeting requires access to your camera and microphone to participate.
            </p>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Click "Allow" when your browser asks for permission, or grant permissions manually in your browser settings.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={handleGrantPermissions} className="w-full">
                Grant Permissions
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setHasPermission(true)}
                className="w-full"
              >
                Join Without Media
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show meeting preview before joining
  if (hasPermission === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {meeting.title || "Therapy Session"}
              </h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  {new Date(meeting.startTime).toLocaleString()}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  {meeting.duration} minutes
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm">
                <strong>Participants:</strong>
                <div className="mt-1 space-y-1">
                  <div>• {meeting.therapist?.user.firstName} {meeting.therapist?.user.lastName} (Therapist)</div>
                  <div>• {meeting.client?.user.firstName} {meeting.client?.user.lastName} (Client)</div>
                </div>
              </div>
              
              {meeting.description && (
                <div className="text-sm">
                  <strong>Description:</strong>
                  <p className="mt-1 text-muted-foreground">{meeting.description}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Checking media permissions...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main meeting room
  return (
    <MeetingRoom 
      meetingId={meetingId} 
      onLeave={handleLeaveMeeting}
    />
  );
}