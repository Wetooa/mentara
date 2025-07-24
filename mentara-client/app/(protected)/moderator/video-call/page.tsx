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
import { AlertCircle, Phone, VideoOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ModeratorVideoCallPage() {
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
        console.log('🚫 [ModeratorVideoCall] Initialization already attempted for:', initKey);
        return;
      }
      initializationAttempted.current = initKey;

      try {
        setIsLoading(true);
        setError(null);

        if (callId) {
          // Joining an existing call (called party)
          if (callState.currentCallId === callId) {
            // Call already in progress
            setIsLoading(false);
          } else {
            // Accept the incoming call
            acceptCall(callId);
          }
        } else if (recipientId) {
          // Initiating a new call
          const result = await initiateCall(recipientId);
          if (!result.success) {
            setError(result.error || 'Failed to initiate call');
          }
        } else {
          setError('No call ID or recipient ID provided');
        }
      } catch (err) {
        setError('Failed to initialize video call');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCall();
  }, [callId, recipientId]); // Only depend on URL parameters

  // Handle call end - redirect back to moderator dashboard
  const handleEndCall = () => {
    endCall();
    // Redirect to moderator dashboard
    router.push('/moderator');
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
              <Phone className="h-5 w-5 animate-pulse text-blue-500" />
              <span>Connecting...</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-2 border-purple-600 text-purple-400">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Moderator Call
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
                Back to Dashboard
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
            <div className="text-center">
              <Badge variant="outline" className="mb-3 border-purple-600 text-purple-400">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Moderation Call
              </Badge>
            </div>
            
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
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-400">
                  <p>Contacting user for moderation purposes</p>
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
        {/* Moderator-specific overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="bg-black/60 border-purple-600">
            <CardContent className="p-2">
              <div className="flex items-center space-x-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                <span className="text-white">Moderation Call</span>
                <Badge variant="outline" className="border-purple-600 text-purple-400">
                  Content Review
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

  // Default fallback
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
          <Button
            onClick={handleBack}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}