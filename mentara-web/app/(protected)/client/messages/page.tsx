"use client";

import React from 'react';
import { MessengerInterface } from '@/components/messaging/MessengerInterface';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const api = useApi();
  const { user } = useAuth();

  const handleCallInitiate = async (conversationId: string, type: 'audio' | 'video') => {
    try {
      toast.info(`Initiating ${type} call...`);
      
      if (!user) {
        toast.error('Authentication required to start a call');
        return;
      }

      // Get conversation details to find the other participant
      const conversation = await api.messaging.getConversation(conversationId);
      const otherParticipant = conversation.participants.find(p => p.userId !== user.id);
      
      if (!otherParticipant) {
        toast.error('Unable to find call recipient');
        return;
      }

      // Navigate to the new video call page with recipient ID
      router.push(`/client/video-call?recipientId=${otherParticipant.userId}&type=${type}`);
      
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast.error(`Failed to start ${type} call. Please try again.`);
    }
  };

  const handleVideoMeetingJoin = (conversationId: string) => {
    // Navigate to video meeting room
    router.push(`/client/meeting/${conversationId}`);
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