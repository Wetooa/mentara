"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  MediaDeviceState,
  UseMediaDevicesReturn
} from '@/types/api/video-calls';

const DEFAULT_MEDIA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

export function useMediaDevices(): UseMediaDevicesReturn {
  const [mediaState, setMediaState] = useState<MediaDeviceState>({
    videoEnabled: false,
    audioEnabled: false,
    localStream: null,
    remoteStream: null,
    availableDevices: {
      videoInputs: [],
      audioInputs: [],
      audioOutputs: [],
    },
    selectedDevices: {
      videoInput: null,
      audioInput: null,
      audioOutput: null,
    },
  });

  const streamRef = useRef<MediaStream | null>(null);

  // Check if media devices are supported
  const isMediaDevicesSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  // Request media permissions and get user media
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!isMediaDevicesSupported()) {
      console.error('Media devices not supported');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(DEFAULT_MEDIA_CONSTRAINTS);
      
      streamRef.current = stream;
      setMediaState(prev => ({
        ...prev,
        localStream: stream,
        videoEnabled: true,
        audioEnabled: true,
      }));

      return true;
    } catch (error) {
      console.error('Failed to get user media:', error);
      
      // Try with reduced constraints if full constraints fail
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        streamRef.current = fallbackStream;
        setMediaState(prev => ({
          ...prev,
          localStream: fallbackStream,
          videoEnabled: true,
          audioEnabled: true,
        }));

        return true;
      } catch (fallbackError) {
        console.error('Failed to get user media with fallback constraints:', fallbackError);
        return false;
      }
    }
  }, [isMediaDevicesSupported]);

  // Refresh available devices
  const refreshDevices = useCallback(async () => {
    if (!isMediaDevicesSupported()) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      setMediaState(prev => ({
        ...prev,
        availableDevices: {
          videoInputs: devices.filter(device => device.kind === 'videoinput'),
          audioInputs: devices.filter(device => device.kind === 'audioinput'),
          audioOutputs: devices.filter(device => device.kind === 'audiooutput'),
        },
      }));

      // Set default devices if none selected
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      setMediaState(prev => ({
        ...prev,
        selectedDevices: {
          videoInput: prev.selectedDevices.videoInput || videoInputs[0]?.deviceId || null,
          audioInput: prev.selectedDevices.audioInput || audioInputs[0]?.deviceId || null,
          audioOutput: prev.selectedDevices.audioOutput || null,
        },
      }));

    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  }, [isMediaDevicesSupported]);

  // Toggle video track
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const isEnabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = isEnabled;
        
        setMediaState(prev => ({
          ...prev,
          videoEnabled: isEnabled,
        }));
      }
    }
  }, []);

  // Toggle audio track
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const isEnabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = isEnabled;
        
        setMediaState(prev => ({
          ...prev,
          audioEnabled: isEnabled,
        }));
      }
    }
  }, []);

  // Switch camera (typically between front and back on mobile)
  const switchCamera = useCallback(async () => {
    if (!streamRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack) return;

      // Try to determine current facing mode
      const settings = videoTrack.getSettings();
      const currentFacingMode = settings.facingMode;
      
      // Toggle between 'user' (front) and 'environment' (back)
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      
      // Stop current video track
      videoTrack.stop();
      
      // Get new stream with switched camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false // Don't replace audio track
      });

      // Replace video track in existing stream
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack && streamRef.current) {
        // Remove old video track and add new one
        streamRef.current.removeTrack(videoTrack);
        streamRef.current.addTrack(newVideoTrack);
        
        setMediaState(prev => ({
          ...prev,
          localStream: streamRef.current,
        }));
      }

    } catch (error) {
      console.error('Failed to switch camera:', error);
      // If switching fails, just log the error and continue with current camera
    }
  }, []);

  // Set specific video device
  const setVideoDevice = useCallback(async (deviceId: string) => {
    if (!streamRef.current) return;

    try {
      const audioTracks = streamRef.current.getAudioTracks();
      const wasVideoEnabled = mediaState.videoEnabled;
      
      // Stop current video track
      const currentVideoTrack = streamRef.current.getVideoTracks()[0];
      if (currentVideoTrack) {
        currentVideoTrack.stop();
        streamRef.current.removeTrack(currentVideoTrack);
      }

      // Get new video stream with selected device
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      if (newVideoTrack) {
        // Set enabled state to match previous state
        newVideoTrack.enabled = wasVideoEnabled;
        streamRef.current.addTrack(newVideoTrack);
        
        setMediaState(prev => ({
          ...prev,
          localStream: streamRef.current,
          selectedDevices: {
            ...prev.selectedDevices,
            videoInput: deviceId,
          },
        }));
      }

    } catch (error) {
      console.error('Failed to set video device:', error);
    }
  }, [mediaState.videoEnabled]);

  // Set specific audio device
  const setAudioDevice = useCallback(async (deviceId: string) => {
    if (!streamRef.current) return;

    try {
      const videoTracks = streamRef.current.getVideoTracks();
      const wasAudioEnabled = mediaState.audioEnabled;
      
      // Stop current audio track
      const currentAudioTrack = streamRef.current.getAudioTracks()[0];
      if (currentAudioTrack) {
        currentAudioTrack.stop();
        streamRef.current.removeTrack(currentAudioTrack);
      }

      // Get new audio stream with selected device
      const newAudioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { 
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const newAudioTrack = newAudioStream.getAudioTracks()[0];
      if (newAudioTrack) {
        // Set enabled state to match previous state
        newAudioTrack.enabled = wasAudioEnabled;
        streamRef.current.addTrack(newAudioTrack);
        
        setMediaState(prev => ({
          ...prev,
          localStream: streamRef.current,
          selectedDevices: {
            ...prev.selectedDevices,
            audioInput: deviceId,
          },
        }));
      }

    } catch (error) {
      console.error('Failed to set audio device:', error);
    }
  }, [mediaState.audioEnabled]);

  // Get display media (screen sharing)
  const getDisplayMedia = useCallback(async (): Promise<MediaStream | null> => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      console.error('Screen sharing not supported');
      return null;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor', // 'monitor', 'window', 'application'
        },
        audio: false, // Usually don't capture system audio
      });

      return displayStream;
    } catch (error) {
      console.error('Failed to get display media:', error);
      return null;
    }
  }, []);

  // Initialize device enumeration
  useEffect(() => {
    refreshDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      refreshDevices();
    };

    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    }

    return () => {
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
    };
  }, [refreshDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, []);

  // Update mediaState when stream changes
  useEffect(() => {
    if (streamRef.current !== mediaState.localStream) {
      setMediaState(prev => ({
        ...prev,
        localStream: streamRef.current,
      }));
    }
  }, [mediaState.localStream]);

  return {
    mediaState,
    requestPermissions,
    toggleVideo,
    toggleAudio,
    switchCamera,
    setVideoDevice,
    setAudioDevice,
    refreshDevices,
    getDisplayMedia,
  };
}