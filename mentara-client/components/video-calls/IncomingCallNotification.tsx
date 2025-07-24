"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  User, 
  X,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IncomingCallNotificationProps } from '@/types/api/video-calls';

export function IncomingCallNotification({
  incomingCall,
  onAccept,
  onDecline,
  onTimeout,
  timeoutDuration = 30
}: IncomingCallNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(timeoutDuration);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show animation when call comes in
  useEffect(() => {
    if (incomingCall) {
      setIsVisible(true);
      // Trigger animation after a brief delay
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [incomingCall]);

  // Countdown timer
  useEffect(() => {
    if (!incomingCall) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingCall, onTimeout]);

  // Reset timer when call changes
  useEffect(() => {
    setTimeLeft(timeoutDuration);
  }, [incomingCall, timeoutDuration]);

  const handleAccept = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onAccept();
    }, 200);
  };

  const handleDecline = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDecline();
    }, 200);
  };

  const getCallerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (!incomingCall || !isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-[9999] w-80 transition-all duration-300 ease-in-out",
        isAnimating 
          ? "transform translate-x-0 opacity-100 scale-100" 
          : "transform translate-x-full opacity-0 scale-95"
      )}
    >
      <Card className="shadow-2xl border-2 border-blue-200 bg-white dark:bg-gray-900 dark:border-blue-800 animate-pulse">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Incoming Video Call
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Caller Information */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-800">
              <AvatarImage 
                src={`/api/avatar/${incomingCall.callerId}`} 
                alt={incomingCall.callerName}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                {getCallerInitials(
                  incomingCall.callerInfo.firstName, 
                  incomingCall.callerInfo.lastName
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {incomingCall.callerName}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {incomingCall.callerInfo.role}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {incomingCall.callerInfo.email}
                </span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center space-x-2 py-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Auto-decline in {formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Accept
            </Button>
          </div>

          {/* Connection Quality Indicator */}
          <div className="flex items-center justify-center space-x-1 pt-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={cn(
                    "w-1 bg-green-500 rounded-full transition-all duration-300",
                    bar <= 3 ? "h-2" : "h-3",
                    bar <= 2 ? "opacity-100" : "opacity-60"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              Good connection
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Ripple effect for visual attention */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 rounded-lg bg-blue-400 animate-ping opacity-20"></div>
        <div className="absolute inset-0 rounded-lg bg-blue-400 animate-ping opacity-10 animation-delay-75"></div>
      </div>
    </div>
  );
}

// Optional: Global notification container component that can be used in layout
export function VideoCallNotificationContainer() {
  return (
    <div 
      id="video-call-notifications" 
      className="fixed top-0 right-0 z-[9999] pointer-events-none"
      style={{ pointerEvents: 'none' }}
    >
      {/* Notifications will be rendered here */}
    </div>
  );
}