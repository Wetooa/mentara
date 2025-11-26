"use client";

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useVideoCall } from '@/hooks/video-calls';
import { AlertCircle, Phone, VideoOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

// Lazy load heavy video call component
const VideoCallInterface = dynamic(() => import('@/components/video-calls').then(mod => ({ default: mod.VideoCallInterface })), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
      <Card className="w-96 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Phone className="h-5 w-5 animate-pulse" />
            <span>Loading video call...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-gray-700" />
          <Skeleton className="h-4 w-3/4 bg-gray-700" />
          <Skeleton className="h-10 w-full bg-gray-700" />
        </CardContent>
      </Card>
    </div>
  )
});

function ClientVideoCallPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const callId = searchParams.get('callId');
  const recipientId = searchParams.get('recipientId');
  
  const {
    callState, 
    mediaState, 
    initiateCall, 
    acceptCall, 
    declineCall, 
    endCall,
    toggleVideo,
    toggleAudio
  } = useVideoCall();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializationAttempted = useRef<string | false>(false);

  // Initialize call based on URL parameters
  useEffect(() => {
    const initializeCall = async () => {
      // Prevent double execution (React Strict Mode or multiple renders)
      const initKey = `${callId || 'no-call'}-${recipientId || 'no-recipient'}`;
      if (initializationAttempted.current === initKey) {
        logger.debug('🚫 [ClientVideoCall] Initialization already attempted for:', initKey);
        return;
      }
      initializationAttempted.current = initKey;

      logger.debug('🎬 [ClientVideoCall] Initializing call with:', {
        callId,
        recipientId,
        currentCallState: callState,
        userRole: user?.role,
        userId: user?.id
      });

      try {
        setIsLoading(true);
        setError(null);

        if (callId) {
          logger.debug('📞 [ClientVideoCall] Handling existing call ID:', callId);
          logger.debug('📞 [ClientVideoCall] Current call state:', {
            status: callState.status,
            currentCallId: callState.currentCallId,
            remotePeerId: callState.remotePeerId,
            isInitiator: callState.isInitiator
          });
          
          // Check if we're already in this call
          if (callState.currentCallId === callId) {
            logger.debug('✅ [ClientVideoCall] Already in call, stopping loading');
            setIsLoading(false);
            return;
          }
          
          // Accept the incoming call if not already handled
          logger.debug('📞 [ClientVideoCall] Accepting call:', callId);
          acceptCall(callId);
          
          // Wait a bit for WebSocket events to process
          setTimeout(() => {
            logger.debug('⏰ [ClientVideoCall] Post-accept call state:', {
              status: callState.status,
              currentCallId: callState.currentCallId,
              remotePeerId: callState.remotePeerId
            });
            setIsLoading(false);
          }, 2000);
          
        } else if (recipientId) {
          logger.debug('📞 [ClientVideoCall] Initiating new call to:', recipientId);
          // Initiating a new call
          const result = await initiateCall(recipientId);
          if (!result.success) {
            logger.error('❌ [ClientVideoCall] Failed to initiate call:', result.error);
            setError(result.error || 'Failed to initiate call');
          } else {
            logger.debug('✅ [ClientVideoCall] Call initiated successfully');
          }
          setIsLoading(false);
        } else {
          logger.error('❌ [ClientVideoCall] No call ID or recipient ID provided');
          setError('No call ID or recipient ID provided');
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('❌ [ClientVideoCall] Failed to initialize video call:', err);
        setError('Failed to initialize video call');
        setIsLoading(false);
      }
    };

    initializeCall();
  }, [callId, recipientId]); // Only depend on URL parameters

  // Monitor call state changes
  useEffect(() => {
    logger.debug('🔄 [ClientVideoCall] Call state changed:', {
      status: callState.status,
      currentCallId: callState.currentCallId,
      remotePeerId: callState.remotePeerId,
      isInitiator: callState.isInitiator,
      error: callState.error,
      urlCallId: callId,
      isLoading
    });

    // If we have a callId from URL but the call state shows we're in a different call or idle
    if (callId && callState.currentCallId && callState.currentCallId !== callId) {
      logger.warn('⚠️ [ClientVideoCall] Call ID mismatch - URL vs State:', {
        urlCallId: callId,
        stateCallId: callState.currentCallId
      });
    }

    // If we have matching call IDs and we're in an active state, stop loading
    if (callId && callState.currentCallId === callId && callState.status !== 'idle') {
      logger.debug('✅ [ClientVideoCall] Call states synchronized, stopping loading');
      setIsLoading(false);
    }

    // If we have an error in call state, show it
    if (callState.error && !error) {
      logger.error('❌ [ClientVideoCall] Call state error:', callState.error);
      setError(callState.error);
      setIsLoading(false);
    }
  }, [callState, callId, error, isLoading]);

  // Handle call end - redirect back to previous page
  const handleEndCall = () => {
    endCall();
    // Redirect to messages or dashboard
    router.push('/client/messages');
  };

  // Handle back navigation
  const handleBack = () => {
    if (callState.status === 'in_call') {
      // Show confirmation dialog
      const confirmed = confirm('Are you sure you want to end the call?');
      if (confirmed) {
        handleEndCall();
      }
    } else {
      handleEndCall();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <Card className="w-96 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Phone className="h-5 w-5 animate-pulse" />
              <span>Connecting...</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <Card className="w-96 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Call Failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-800 bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
            <div className="flex space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Waiting/Calling state
  if (callState.status === 'calling' || callState.status === 'receiving') {
    return (
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <Card className="w-96 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Phone className="h-5 w-5 animate-pulse text-blue-500" />
              <span>
                {callState.status === 'calling' ? 'Calling...' : 'Incoming Call'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {callState.remoteUserInfo && (
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {callState.remoteUserInfo.firstName} {callState.remoteUserInfo.lastName}
                </p>
                <p className="text-gray-400">
                  {callState.remoteUserInfo.role} • {callState.remoteUserInfo.email}
                </p>
              </div>
            )}
            
            {callState.status === 'receiving' && (
              <div className="flex space-x-3">
                <Button
                  onClick={() => declineCall(callState.currentCallId!)}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  Decline
                </Button>
                <Button
                  onClick={() => acceptCall(callState.currentCallId!)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Accept
                </Button>
              </div>
            )}
            
            {callState.status === 'calling' && (
              <Button
                onClick={handleEndCall}
                variant="outline"
                className="w-full border-red-600 text-red-400 hover:bg-red-900/20"
              >
                Cancel Call
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active call state
  if (callState.status === 'in_call' && callState.remoteUserInfo) {
    return (
      <Suspense fallback={
        <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
          <Card className="w-96 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Loading video call...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }>
        <VideoCallInterface
          callId={callState.currentCallId!}
          localStream={mediaState.localStream}
          remoteStream={mediaState.remoteStream}
          isInitiator={callState.isInitiator}
          remoteUser={callState.remoteUserInfo}
          onEndCall={handleEndCall}
        />
      </Suspense>
    );
  }

  // Default fallback - show debug info in development
  return (
    <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
      <Card className="w-96 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <VideoOff className="h-5 w-5" />
            <span>No Active Call</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            There is no active video call session.
          </p>
          
          {/* Debug information in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-700 rounded text-xs">
              <div className="text-green-400 font-semibold mb-2">Debug Info:</div>
              <div className="text-gray-300 space-y-1">
                <div>URL Call ID: {callId || 'none'}</div>
                <div>URL Recipient ID: {recipientId || 'none'}</div>
                <div>Call Status: {callState.status}</div>
                <div>State Call ID: {callState.currentCallId || 'none'}</div>
                <div>Remote Peer: {callState.remotePeerId || 'none'}</div>
                <div>Is Initiator: {callState.isInitiator ? 'yes' : 'no'}</div>
                <div>Loading: {isLoading ? 'yes' : 'no'}</div>
                <div>Error: {error || callState.error || 'none'}</div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientVideoCallPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <Card className="w-96 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Phone className="h-5 w-5 animate-pulse" />
              <span>Loading...</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </CardContent>
        </Card>
      </div>
    }>
      <ClientVideoCallPageContent />
    </Suspense>
  );
}