"use client";

import React, { Suspense, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';
import { useMessagingStore } from '@/store/messaging';

// Lazy load heavy messaging component
const MessengerInterface = dynamic(() => import('@/components/messaging/MessengerInterface').then(mod => ({ default: mod.MessengerInterface })), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full p-6 flex flex-col">
      <div className="flex-1 min-h-0 space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
});

export default function ClientMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useApi();
  const { user } = useAuth();
  const { targetUserId: storeTargetUserId, setTargetUserId } = useMessagingStore();
  
  // Track if we've processed the contact param to avoid re-processing
  const hasProcessedContact = useRef(false);
  
  // Handle URL params (for backward compatibility)
  const urlTargetUserId = searchParams.get('userId') || searchParams.get('contact');
  const targetUserId = storeTargetUserId || urlTargetUserId || undefined;
  
  // Clear targetUserId from store after using it
  useEffect(() => {
    if (storeTargetUserId) {
      setTargetUserId(null);
    }
  }, [storeTargetUserId, setTargetUserId]);

  // Remove contact query param after processing
  useEffect(() => {
    const contactParam = searchParams.get('contact') || searchParams.get('userId');
    
    if (contactParam && !hasProcessedContact.current) {
      hasProcessedContact.current = true;
      
      // Wait for conversation to be set up (handled by MessengerInterface)
      // Then remove query param after a delay to ensure conversation is created
      const timer = setTimeout(() => {
        // Remove query params from URL
        const newUrl = window.location.pathname;
        router.replace(newUrl, { scroll: false });
        logger.debug('Removed contact query param from URL after processing');
      }, 2500); // Give time for conversation setup (2.5 seconds)
      
      return () => clearTimeout(timer);
    } else if (!contactParam) {
      // Reset the flag when there's no contact param
      hasProcessedContact.current = false;
    }
  }, [searchParams, router]);

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
      logger.error('Failed to initiate call:', error);
      toast.error(`Failed to start ${type} call. Please try again.`);
    }
  };

  const handleVideoMeetingJoin = (conversationId: string) => {
    // Navigate to video meeting room
    router.push(`/client/meeting/${conversationId}`);
  };

  return (
    <main className="h-full w-full p-6 flex flex-col" aria-label="Messages">
      <div className="flex-1 min-h-0">
        <Suspense fallback={
          <div className="space-y-4" aria-live="polite" aria-busy="true">
            <Skeleton className="h-16 w-full" aria-label="Loading messages header" />
            <Skeleton className="h-64 w-full" aria-label="Loading messages content" />
          </div>
        }>
          <MessengerInterface
            onCallInitiate={handleCallInitiate}
            onVideoMeetingJoin={handleVideoMeetingJoin}
            className="h-full w-full"
            targetUserId={targetUserId || undefined}
          />
        </Suspense>
      </div>
    </main>
  );
}