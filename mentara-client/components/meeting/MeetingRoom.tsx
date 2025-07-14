"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  MessageSquare,
  Users,
  Settings,
  AlertCircle,
  Send,
  Clock,
  Play,
  Square,
  PhoneOff,
  Smartphone,
  MoreVertical,
} from "lucide-react";
import { useMeetingRoom } from "@/hooks/useMeetingRoom";
import { WebRTCService } from "@/lib/webrtc/webrtc-service";
import { MediaRecorderService } from "@/lib/webrtc/media-recorder-service";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { toast } from "sonner";

interface MeetingRoomProps {
  meetingId: string;
  onLeave?: () => void;
}

export function MeetingRoom({ meetingId, onLeave }: MeetingRoomProps) {
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const webrtcService = useRef<WebRTCService | null>(null);
  const mediaRecorder = useRef<MediaRecorderService | null>(null);
  
  // Media queries for responsive design
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isTouchDevice = useMediaQuery('(pointer: coarse)');

  const {
    isConnected,
    meetingInfo,
    participants,
    chatMessages,
    isHost,
    localMediaStatus,
    joinMeeting,
    leaveMeeting,
    toggleMedia,
    markReady,
    sendChatMessage,
    startMeeting,
    endMeeting,
    startRecording,
    participantCount,
    isActive,
    isWaiting,
    isEnded,
    allParticipantsReady,
  } = useMeetingRoom({
    meetingId,
    onMeetingEnd: () => {
      toast.info("Meeting has ended");
      onLeave?.();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // Initialize WebRTC and media
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        // Initialize WebRTC service
        webrtcService.current = new WebRTCService();
        mediaRecorder.current = new MediaRecorderService();

        // Get media constraints based on device type
        const constraints: MediaStreamConstraints = {
          video: isMobile ? {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 24, max: 30 },
            facingMode: 'user'
          } : {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        };

        // Initialize media
        const stream = await webrtcService.current.initializeMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Set up WebRTC event handlers
        webrtcService.current.onPeerConnected = (peerId: string, stream: MediaStream) => {
          const videoElement = remoteVideoRefs.current.get(peerId);
          if (videoElement) {
            videoElement.srcObject = stream;
          }
        };

        webrtcService.current.onPeerDisconnected = (peerId: string) => {
          const videoElement = remoteVideoRefs.current.get(peerId);
          if (videoElement) {
            videoElement.srcObject = null;
          }
          remoteVideoRefs.current.delete(peerId);
        };

        // Join meeting with initial media preferences
        joinMeeting({
          video: true,
          audio: true,
        });
        
        setIsJoined(true);
      } catch (error) {
        console.error("Failed to initialize WebRTC:", error);
        toast.error("Failed to access camera/microphone");
        
        // Join without media
        joinMeeting({
          video: false,
          audio: false,
        });
        
        setIsJoined(true);
      }
    };

    if (isConnected && !isJoined) {
      initializeWebRTC();
    }

    return () => {
      // Cleanup WebRTC and media
      if (webrtcService.current) {
        webrtcService.current.cleanup();
      }
      if (mediaRecorder.current) {
        mediaRecorder.current.stopRecording();
      }
    };
  }, [isConnected, isJoined, joinMeeting, isMobile]);

  const handleToggleVideo = useCallback(() => {
    if (webrtcService.current) {
      webrtcService.current.toggleVideo();
    }
    toggleMedia('video');
  }, [toggleMedia]);

  const handleToggleAudio = useCallback(() => {
    if (webrtcService.current) {
      webrtcService.current.toggleAudio();
    }
    toggleMedia('audio');
  }, [toggleMedia]);

  const handleToggleScreen = useCallback(async () => {
    try {
      if (webrtcService.current) {
        if (!localMediaStatus.screen) {
          await webrtcService.current.startScreenShare();
        } else {
          await webrtcService.current.stopScreenShare();
        }
      }
      toggleMedia('screen');
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
      toast.error("Failed to toggle screen sharing");
    }
  }, [localMediaStatus.screen, toggleMedia]);

  const handleStartRecording = useCallback(async () => {
    try {
      if (mediaRecorder.current && webrtcService.current) {
        const streams = webrtcService.current.getAllStreams();
        mediaRecorder.current.startRecording(streams);
        setIsRecording(true);
        toast.success("Recording started");
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording");
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    try {
      if (mediaRecorder.current) {
        const blob = await mediaRecorder.current.stopRecording();
        setIsRecording(false);
        
        // Create download link for recorded file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-${meetingId}-${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Recording saved");
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to stop recording");
    }
  }, [meetingId]);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput("");
    }
  };

  const handleLeaveMeeting = useCallback(() => {
    leaveMeeting();
    
    // Cleanup WebRTC and media
    if (webrtcService.current) {
      webrtcService.current.cleanup();
    }
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stopRecording();
    }
    
    onLeave?.();
  }, [leaveMeeting, onLeave, isRecording]);

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return `${diff} min`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Connecting to meeting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEnded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Meeting Ended</h2>
            <p className="text-muted-foreground mb-4">
              This meeting has been ended by the host.
            </p>
            <Button onClick={onLeave}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <h1 className="text-sm md:text-lg font-semibold truncate">
            {meetingInfo?.title || "Therapy Session"}
          </h1>
          <Badge variant={isActive ? "default" : "secondary"} className="shrink-0">
            {isActive ? "Active" : isWaiting ? "Waiting" : "Ended"}
          </Badge>
          {isActive && meetingInfo?.startTime && !isMobile && (
            <div className="flex items-center gap-1 text-sm text-gray-300">
              <Clock className="h-4 w-4" />
              {formatDuration(meetingInfo.startTime)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileControls(!showMobileControls)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4" />
            {participantCount}
          </div>
          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Controls Dropdown */}
      {isMobile && showMobileControls && (
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowChat(!showChat);
                setShowMobileControls(false);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </Button>
            {isActive && meetingInfo?.startTime && (
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <Clock className="h-4 w-4" />
                {formatDuration(meetingInfo.startTime)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Main Video Area */}
        <div className={`flex-1 relative ${showChat && !isMobile ? "md:mr-80" : ""} ${isMobile && showChat ? "flex-1" : ""}`}>
          <div className="absolute inset-0 bg-gray-900">
            {/* Video Grid for multiple participants */}
            <div className={`w-full h-full ${participants.length > 1 ? "grid" : "flex"} ${
              participants.length === 2 ? "grid-cols-1 md:grid-cols-2" :
              participants.length === 3 ? "grid-cols-2" :
              participants.length >= 4 ? "grid-cols-2 md:grid-cols-3" : ""
            } gap-1 md:gap-2 p-1 md:p-2`}>
              
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {!localMediaStatus.video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <Avatar className={`${isMobile ? "h-12 w-12" : "h-24 w-24"} mx-auto mb-2`}>
                        <AvatarFallback className={`${isMobile ? "text-lg" : "text-2xl"}`}>
                          {isHost ? "T" : "C"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-300 text-sm">Camera is off</p>
                    </div>
                  </div>
                )}

                {/* Local video label */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1 text-xs">
                  You
                </div>
              </div>

              {/* Remote Videos */}
              {participants.map((participant) => (
                <div key={participant.userId} className="relative bg-gray-800 rounded overflow-hidden">
                  <video
                    ref={(el) => {
                      if (el) remoteVideoRefs.current.set(participant.userId, el);
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {!participant.mediaStatus.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="text-center">
                        <Avatar className={`${isMobile ? "h-12 w-12" : "h-24 w-24"} mx-auto mb-2`}>
                          <AvatarFallback className={`${isMobile ? "text-lg" : "text-2xl"}`}>
                            {participant.role === 'therapist' ? 'T' : 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-gray-300 text-sm">Camera is off</p>
                      </div>
                    </div>
                  )}

                  {/* Participant label and status */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span>{participant.role}</span>
                      <div className="flex gap-1">
                        {!participant.mediaStatus.video && (
                          <VideoOff className="h-3 w-3 text-red-400" />
                        )}
                        {!participant.mediaStatus.audio && (
                          <MicOff className="h-3 w-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Waiting Room State */}
            {isWaiting && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Card>
                  <CardContent className="p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                      Waiting for meeting to start
                    </h2>
                    {!allParticipantsReady && (
                      <div className="mb-4">
                        <Button onClick={markReady}>Mark as Ready</Button>
                      </div>
                    )}
                    {isHost && allParticipantsReady && (
                      <Button onClick={startMeeting}>Start Meeting</Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar - Desktop and Mobile */}
        {showChat && (
          <div className={`${
            isMobile 
              ? "fixed inset-0 z-50 bg-gray-800 flex flex-col" 
              : "w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
          }`}>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Chat</h3>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(false)}
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatMessages.map((message, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium">
                        {message.senderRole === 'therapist' ? 'Therapist' : 'Client'}
                      </span>
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-gray-700 border-gray-600"
                />
                <Button size="sm" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 md:px-6 py-4">
        <div className={`flex items-center justify-center gap-2 md:gap-4 ${
          isMobile ? "flex-wrap" : ""
        }`}>
          {/* Media Controls */}
          <Button
            variant={localMediaStatus.audio ? "default" : "destructive"}
            size={isMobile ? "default" : "lg"}
            onClick={handleToggleAudio}
          >
            {localMediaStatus.audio ? (
              <Mic className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <MicOff className="h-4 w-4 md:h-5 md:w-5" />
            )}
            {isMobile && <span className="ml-1 text-xs">Mic</span>}
          </Button>
          
          <Button
            variant={localMediaStatus.video ? "default" : "destructive"}
            size={isMobile ? "default" : "lg"}
            onClick={handleToggleVideo}
          >
            {localMediaStatus.video ? (
              <Video className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <VideoOff className="h-4 w-4 md:h-5 md:w-5" />
            )}
            {isMobile && <span className="ml-1 text-xs">Video</span>}
          </Button>
          
          {/* Screen Share - Hidden on mobile if touch device */}
          {!isTouchDevice && (
            <Button
              variant={localMediaStatus.screen ? "default" : "outline"}
              size={isMobile ? "default" : "lg"}
              onClick={handleToggleScreen}
            >
              {localMediaStatus.screen ? (
                <Monitor className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <MonitorOff className="h-4 w-4 md:h-5 md:w-5" />
              )}
              {isMobile && <span className="ml-1 text-xs">Share</span>}
            </Button>
          )}

          {/* Mobile Chat Button */}
          {isMobile && (
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="ml-1 text-xs">Chat</span>
            </Button>
          )}

          {/* Host Controls */}
          {isHost && (
            <>
              <div className={`${isMobile ? "w-full" : "w-px h-8 bg-gray-600 mx-2"}`} />
              
              <div className={`flex items-center gap-2 ${isMobile ? "w-full justify-center" : ""}`}>
                {isWaiting && allParticipantsReady && (
                  <Button variant="default" onClick={startMeeting} size={isMobile ? "default" : "lg"}>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                )}
                
                {isActive && (
                  <Button 
                    variant={isRecording ? "destructive" : "outline"} 
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    size={isMobile ? "default" : "lg"}
                  >
                    <Square className="h-4 w-4 mr-1 md:mr-2" />
                    {isRecording ? "Stop" : "Record"}
                  </Button>
                )}
                
                <Button variant="destructive" onClick={endMeeting} size={isMobile ? "default" : "lg"}>
                  {isMobile ? "End" : "End for All"}
                </Button>
              </div>
            </>
          )}

          {!isMobile && <div className="w-px h-8 bg-gray-600 mx-2" />}
          
          {/* Leave Button */}
          <Button 
            variant="destructive" 
            onClick={handleLeaveMeeting}
            size={isMobile ? "default" : "lg"}
            className={isMobile ? "w-full" : ""}
          >
            <PhoneOff className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
