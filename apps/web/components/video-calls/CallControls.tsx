"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Monitor,
  MonitorOff,
  RotateCcw,
  Settings,
  Maximize,
  Users,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CallControlsProps } from '@/types/api/video-calls';

export function CallControls({
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  onSwitchCamera,
  showSwitchCamera = false
}: CallControlsProps) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Screen sharing logic would be implemented here
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
    // Chat toggle logic would be implemented here
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex justify-center items-center space-x-4 p-6">
        {/* Audio Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggleAudio}
              variant="outline"
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 border-2 transition-all duration-200",
                audioEnabled
                  ? "border-gray-600 bg-black/50 text-white hover:bg-gray-800"
                  : "border-red-500 bg-red-600 text-white hover:bg-red-700"
              )}
            >
              {audioEnabled ? (
                <Mic className="h-6 w-6" />
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{audioEnabled ? 'Mute microphone' : 'Unmute microphone'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Video Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggleVideo}
              variant="outline"
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 border-2 transition-all duration-200",
                videoEnabled
                  ? "border-gray-600 bg-black/50 text-white hover:bg-gray-800"
                  : "border-red-500 bg-red-600 text-white hover:bg-red-700"
              )}
            >
              {videoEnabled ? (
                <Video className="h-6 w-6" />
              ) : (
                <VideoOff className="h-6 w-6" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{videoEnabled ? 'Turn off camera' : 'Turn on camera'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Screen Share Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleScreenShare}
              variant="outline"
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 border-2 transition-all duration-200",
                isScreenSharing
                  ? "border-blue-500 bg-blue-600 text-white hover:bg-blue-700"
                  : "border-gray-600 bg-black/50 text-white hover:bg-gray-800"
              )}
            >
              {isScreenSharing ? (
                <MonitorOff className="h-6 w-6" />
              ) : (
                <Monitor className="h-6 w-6" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isScreenSharing ? 'Stop sharing screen' : 'Share screen'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Switch Camera (Mobile) */}
        {showSwitchCamera && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onSwitchCamera}
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14 border-2 border-gray-600 bg-black/50 text-white hover:bg-gray-800 transition-all duration-200"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Switch camera</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Chat Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleChat}
              variant="outline"
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 border-2 transition-all duration-200",
                showChat
                  ? "border-blue-500 bg-blue-600 text-white hover:bg-blue-700"
                  : "border-gray-600 bg-black/50 text-white hover:bg-gray-800"
              )}
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{showChat ? 'Hide chat' : 'Show chat'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Fullscreen Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleFullscreen}
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 border-2 border-gray-600 bg-black/50 text-white hover:bg-gray-800 transition-all duration-200"
            >
              <Maximize className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 border-2 border-gray-600 bg-black/50 text-white hover:bg-gray-800 transition-all duration-200"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Call settings</p>
          </TooltipContent>
        </Tooltip>

        {/* End Call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 border-2 border-red-600 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>End call</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

// Simplified version for mobile or minimal UI
export function MobileCallControls({
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
  onEndCall
}: Pick<CallControlsProps, 'videoEnabled' | 'audioEnabled' | 'onToggleVideo' | 'onToggleAudio' | 'onEndCall'>) {
  return (
    <div className="flex justify-center items-center space-x-6 p-4">
      {/* Audio Control */}
      <Button
        onClick={onToggleAudio}
        variant="outline"
        size="lg"
        className={cn(
          "rounded-full w-12 h-12 border-2",
          audioEnabled
            ? "border-gray-600 bg-black/50 text-white"
            : "border-red-500 bg-red-600 text-white"
        )}
      >
        {audioEnabled ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>

      {/* Video Control */}
      <Button
        onClick={onToggleVideo}
        variant="outline"
        size="lg"
        className={cn(
          "rounded-full w-12 h-12 border-2",
          videoEnabled
            ? "border-gray-600 bg-black/50 text-white"
            : "border-red-500 bg-red-600 text-white"
        )}
      >
        {videoEnabled ? (
          <Video className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5" />
        )}
      </Button>

      {/* End Call */}
      <Button
        onClick={onEndCall}
        variant="destructive"
        size="lg"
        className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}