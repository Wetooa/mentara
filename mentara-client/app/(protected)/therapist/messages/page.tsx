"use client";

import React from 'react';
import { MessengerInterface } from '@/components/messaging/MessengerInterface';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function TherapistMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const api = useApi();
  const { user } = useAuth();

  const handleCallInitiate = async (conversationId: string, type: 'audio' | 'video') => {
    try {
      toast.info(`Initiating ${type} call...`);
      
      // For instant calls from messaging, we need to create an immediate meeting
      // and then navigate to it. The backend should handle creating a meeting
      // that starts immediately for video/audio calls from conversations.
      
      if (!user) {
        toast.error('Authentication required to start a call');
        return;
      }

      // We'll use the conversation ID as a temporary meeting ID
      // and let the meeting room handle the call setup
      // The meeting room should be enhanced to handle instant calls
      router.push(`/therapist/meeting/${conversationId}?type=${type}&instant=true&callType=${type}`);
      
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast.error(`Failed to start ${type} call. Please try again.`);
    }
  };

  const handleVideoMeetingJoin = (conversationId: string) => {
    // Navigate to video meeting room
    router.push(`/therapist/meeting/${conversationId}`);
  };

  return (
    <div className="h-full w-full p-6 flex flex-col">
      <div className="flex-1 min-h-0">
        <MessengerInterface
          onCallInitiate={handleCallInitiate}
          onVideoMeetingJoin={handleVideoMeetingJoin}
          className="h-full w-full"
          targetUserId={targetUserId || undefined}
        />
      </div>
    </div>
  );
}