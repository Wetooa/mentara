"use client";

import React from 'react';
import { MessengerInterface } from '@/components/messaging/MessengerInterface';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function ClientMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const handleCallInitiate = (conversationId: string, type: 'audio' | 'video') => {
    toast.info(`${type} call functionality coming soon`);
    // TODO: Implement call initiation
  };

  const handleVideoMeetingJoin = (conversationId: string) => {
    // Navigate to video meeting room
    router.push(`/client/meeting/${conversationId}`);
  };

  return (
    <div className="h-full w-full p-6">
      <div className="h-full">
        <MessengerInterface
          onCallInitiate={handleCallInitiate}
          onVideoMeetingJoin={handleVideoMeetingJoin}
          className="h-full"
          targetUserId={targetUserId || undefined}
        />
      </div>
    </div>
  );
}