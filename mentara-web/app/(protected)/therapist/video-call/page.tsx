"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { VideoCallInterface } from '@/components/video-calls';
import { useVideoCall } from '@/hooks/video-calls';
import { AlertCircle, Phone, VideoOff, ArrowLeft, Users, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TherapistVideoCallPage() {
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
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const initializationAttempted = useRef<string | false>(false);

  // Initialize call based on URL parameters
  useEffect(() => {
    const initializeCall = async () => {
      // Prevent double execution (React Strict Mode or multiple renders)
      const initKey = `${callId || 'no-call'}-${recipientId || 'no-recipient'}`;
      if (initializationAttempted.current === initKey) {
        console.log('🚫 [TherapistVideoCall] Initialization already attempted for:', initKey);
        return;
      }
      initializationAttempted.current = initKey;

      try {
        console.log('🚀 [TherapistVideoCall] Initializing call:', { 
          callId, 
          recipientId, 
          userId: user?.id,
          currentCallState: callState,
          initKey 
        });
        setIsLoading(true);
        setError(null);

        if (callId) {
          console.log('📞 [TherapistVideoCall] Handling existing call ID:', callId);
          console.log('📞 [TherapistVideoCall] Current call state:', {
            status: callState.status,
            currentCallId: callState.currentCallId,
            remotePeerId: callState.remotePeerId,
            isInitiator: callState.isInitiator
          });
          
          // Check if we're already in this call
          if (callState.currentCallId === callId) {
            console.log('✅ [TherapistVideoCall] Already in call, stopping loading');
            setIsLoading(false);
            return;
          }
          
          // Accept the incoming call if not already handled
          console.log('📞 [TherapistVideoCall] Accepting call:', callId);
          acceptCall(callId);
          
          // Wait a bit for WebSocket events to process
          setTimeout(() => {
            console.log('⏰ [TherapistVideoCall] Post-accept call state:', {
              status: callState.status,
              currentCallId: callState.currentCallId,
              remotePeerId: callState.remotePeerId
            });
            setIsLoading(false);
          }, 2000);
          
        } else if (recipientId) {
          console.log('📞 [TherapistVideoCall] Initiating new call to:', recipientId);
          // Initiating a new call
          const result = await initiateCall(recipientId);
          console.log('🎯 [TherapistVideoCall] Call initiation result:', result);
          if (!result.success) {
            console.error('❌ [TherapistVideoCall] Call initiation failed:', result.error);
            setError(result.error || 'Failed to initiate call');
          } else {
            console.log('✅ [TherapistVideoCall] Call initiated successfully');
          }
          setIsLoading(false);
        } else {
          console.error('❌ [TherapistVideoCall] Missing parameters');
          setError('No call ID or recipient ID provided');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ [TherapistVideoCall] Error in initializeCall:', err);
        setError('Failed to initialize video call');
        setIsLoading(false);
      }
    };

    initializeCall();
  }, [callId, recipientId]); // Only depend on URL parameters

  // Monitor call state changes
  useEffect(() => {
    console.log('🔄 [TherapistVideoCall] Call state changed:', {
      status: callState.status,
      currentCallId: callState.currentCallId,
      remotePeerId: callState.remotePeerId,
      isInitiator: callState.isInitiator,
      error: callState.error,
      urlCallId: callId,
      isLoading
    });

    // If we have matching call IDs and we're in an active state, stop loading
    if (callId && callState.currentCallId === callId && callState.status !== 'idle') {
      console.log('✅ [TherapistVideoCall] Call states synchronized, stopping loading');
      setIsLoading(false);
    }

    // If we have an error in call state, show it
    if (callState.error && !error) {
      console.error('❌ [TherapistVideoCall] Call state error:', callState.error);
      setError(callState.error);
      setIsLoading(false);
    }
  }, [callState, callId, error, isLoading]);

  // Track session start time
  useEffect(() => {
    if (callState.status === 'in_call' && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
  }, [callState.status, sessionStartTime]);

  // Handle call end - redirect back to therapist dashboard
  const handleEndCall = () => {
    endCall();
    // Redirect to patient dashboard or messages
    router.push('/therapist/patients');
  };

  // Handle back navigation
  const handleBack = () => {
    if (callState.status === 'in_call') {
      // Show confirmation dialog
      const confirmed = confirm('Are you sure you want to end this therapy session?');
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
              <Phone className="h-5 w-5 animate-pulse text-blue-500" />
              <span>Starting Session...</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Therapy Session
              </Badge>
            </div>
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
              <span>Session Failed</span>
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
                Back to Patients
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
                {callState.status === 'calling' ? 'Calling Client...' : 'Incoming Call'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-3 border-blue-600 text-blue-400">
                Therapy Session
              </Badge>
            </div>
            
            {callState.remoteUserInfo && (
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {callState.remoteUserInfo.firstName} {callState.remoteUserInfo.lastName}
                </p>
                <p className="text-gray-400">
                  Client • {callState.remoteUserInfo.email}
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
                  Start Session
                </Button>
              </div>
            )}
            
            {callState.status === 'calling' && (
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-400">
                  <p>Your client will receive a notification</p>
                </div>
                <Button
                  onClick={handleEndCall}
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  Cancel Call
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active call state
  if (callState.status === 'in_call' && callState.remoteUserInfo) {
    return (
      <div className="relative">
        {/* Therapist-specific overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="bg-black/60 border-blue-600">
            <CardContent className="p-2">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-white">Therapy Session</span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-white">
                    {sessionStartTime && (
                      `${Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)}:${
                        Math.floor(((Date.now() - sessionStartTime.getTime()) % 60000) / 1000)
                          .toString().padStart(2, '0')
                      }`
                    )}
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                <Badge variant="outline" className="border-blue-600 text-blue-400">
                  Professional Session
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <VideoCallInterface
          callId={callState.currentCallId!}
          localStream={mediaState.localStream}
          remoteStream={mediaState.remoteStream}
          isInitiator={callState.isInitiator}
          remoteUser={callState.remoteUserInfo}
          onEndCall={handleEndCall}
        />
      </div>
    );
  }

  // Default fallback - show debug info in development
  return (
    <div className="h-screen w-full bg-gray-900 flex items-center justify-center">
      <Card className="w-96 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <VideoOff className="h-5 w-5" />
            <span>No Active Session</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            There is no active therapy session.
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
              Back to Patients
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