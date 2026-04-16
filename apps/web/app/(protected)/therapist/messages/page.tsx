"use client";

import React, { Suspense } from 'react';
import { MessengerInterface } from '@/components/messaging/MessengerInterface';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { Skeleton } from '@/components/ui/skeleton';

function TherapistMessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const api = useApi();
  const { user } = useAuth();

  const handleCallInitiate = async (conversationId: string, type: 'audio' | 'video') => {
    try {
      logger.debug('🚀 [TherapistMessages] Starting call initiation:', { conversationId, type, userId: user?.id });
      toast.info(`Initiating ${type} call...`);
      
      if (!user) {
        logger.error('❌ [TherapistMessages] No authenticated user');
        toast.error('Authentication required to start a call');
        return;
      }

      logger.debug('📞 [TherapistMessages] Fetching conversation details...');
      // Get conversation details to find the other participant
      const conversation = await api.messaging.getConversation(conversationId);
      logger.debug('✅ [TherapistMessages] Conversation fetched:', {
        id: conversation.id,
        participants: conversation.participants.map(p => ({ id: p.userId, name: `${p.user.firstName} ${p.user.lastName}` }))
      });
      
      const otherParticipant = conversation.participants.find(p => p.userId !== user.id);
      
      if (!otherParticipant) {
        logger.error('❌ [TherapistMessages] No other participant found');
        toast.error('Unable to find call recipient');
        return;
      }

      logger.debug('🎯 [TherapistMessages] Found recipient:', {
        userId: otherParticipant.userId,
        name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
      });

      // Navigate to the new video call page with recipient ID
      const callUrl = `/therapist/video-call?recipientId=${otherParticipant.userId}&type=${type}`;
      logger.debug('🔗 [TherapistMessages] Navigating to:', callUrl);
      router.push(callUrl);
      
    } catch (error) {
      logger.error('❌ [TherapistMessages] Failed to initiate call:', error);
      logger.error('❌ [TherapistMessages] Error details:', {
        conversationId,
        type,
        userId: user?.id,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error
      });
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

export default function TherapistMessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full p-6 flex flex-col">
        <div className="flex-1 min-h-0 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    }>
      <TherapistMessagesPageContent />
    </Suspense>
  );
}