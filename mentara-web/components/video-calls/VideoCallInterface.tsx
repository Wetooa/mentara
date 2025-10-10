"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Maximize2,
  Minimize2,
  Monitor,
  RotateCcw,
  Settings,
  Users,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoCallInterfaceProps } from '@/types/api/video-calls';

export function VideoCallInterface({
  callId,
  localStream,
  remoteStream,
  isInitiator,
  remoteUser,
  onEndCall
}: VideoCallInterfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isLocalVideoFullscreen, setIsLocalVideoFullscreen] = useState(false);
  const [isRemoteVideoLoaded, setIsRemoteVideoLoaded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      setIsRemoteVideoLoaded(true);
    }
  }, [remoteStream]);

  // Call duration timer
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get user initials
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Toggle local video fullscreen
  const toggleLocalFullscreen = () => {
    setIsLocalVideoFullscreen(!isLocalVideoFullscreen);
  };

  // Connection quality indicator
  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-screen w-full bg-gray-900 relative overflow-hidden">
      {/* Remote Video (Main) */}
      <div className="absolute inset-0">
        {remoteStream && isRemoteVideoLoaded ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-gray-600">
                <AvatarImage 
                  src={`/api/avatar/${remoteUser.id}`} 
                  alt={`${remoteUser.firstName} ${remoteUser.lastName}`}
                />
                <AvatarFallback className="bg-gray-700 text-gray-300 text-2xl">
                  {getUserInitials(remoteUser.firstName, remoteUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-white mb-2">
                {remoteUser.firstName} {remoteUser.lastName}
              </h3>
              <Badge variant="secondary" className="mb-4">
                {remoteUser.role}
              </Badge>
              <p className="text-gray-400">
                {remoteStream ? 'Connecting video...' : 'Waiting for video...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div 
        className={cn(
          "absolute transition-all duration-300 cursor-pointer group",
          isLocalVideoFullscreen
            ? "inset-0 z-20"
            : "top-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg border-2 border-white/20 hover:border-white/40"
        )}
        onClick={toggleLocalFullscreen}
      >
        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror local video
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <VideoOff className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Fullscreen toggle hint */}
        <div className={cn(
          "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
          isLocalVideoFullscreen ? "text-white" : "text-white/80"
        )}>
          {isLocalVideoFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Call Information Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="bg-black/50 border-gray-600">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">
                  {formatDuration(callDuration)}
                </span>
              </div>
              
              <div className="w-px h-4 bg-gray-600"></div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">2 participants</span>
              </div>
              
              <div className="w-px h-4 bg-gray-600"></div>
              
              <div className="flex items-center space-x-1">
                <div className="flex space-x-0.5">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={cn(
                        "w-1 bg-current rounded-full transition-all duration-300",
                        bar <= 3 ? "h-2" : "h-3",
                        bar <= 2 ? "opacity-100" : "opacity-60",
                        getConnectionQualityColor()
                      )}
                    />
                  ))}
                </div>
                <span className="text-gray-300 text-xs capitalize ml-1">
                  {connectionQuality}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Controls (will be replaced by separate CallControls component) */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-6">
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 border-gray-600 bg-black/50 text-white hover:bg-gray-800"
            >
              <Mic className="h-6 w-6" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 border-gray-600 bg-black/50 text-white hover:bg-gray-800"
            >
              <Video className="h-6 w-6" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 border-gray-600 bg-black/50 text-white hover:bg-gray-800"
            >
              <Monitor className="h-6 w-6" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 border-gray-600 bg-black/50 text-white hover:bg-gray-800"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 border-gray-600 bg-black/50 text-white hover:bg-gray-800"
            >
              <Settings className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={onEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Participant Info Bar (when remote video is not available) */}
      {!isRemoteVideoLoaded && (
        <div className="absolute bottom-24 left-4 right-4 z-10">
          <Card className="bg-black/50 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-gray-600">
                  <AvatarImage 
                    src={`/api/avatar/${remoteUser.id}`} 
                    alt={`${remoteUser.firstName} ${remoteUser.lastName}`}
                  />
                  <AvatarFallback className="bg-gray-700 text-gray-300">
                    {getUserInitials(remoteUser.firstName, remoteUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {remoteUser.firstName} {remoteUser.lastName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {remoteUser.role} • {remoteUser.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">
                    {isInitiator ? 'Calling...' : 'Connected'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}