// WebRTC Configuration for Production
export const WEBRTC_CONFIG = {
  iceServers: [
    // Google STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    
    // Coturn TURN server (will be configured based on environment)
    ...(process.env.NEXT_PUBLIC_TURN_SERVER_URL ? [{
      urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || 'mentara',
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || 'mentara123'
    }] : [])
  ],
  iceCandidatePoolSize: 10,
};

export const MEDIA_CONSTRAINTS = {
  video: {
    width: { min: 320, ideal: 1280, max: 1920 },
    height: { min: 240, ideal: 720, max: 1080 },
    frameRate: { min: 10, ideal: 30, max: 60 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: { min: 8000, ideal: 44100, max: 48000 }
  }
};

export const SCREEN_SHARE_CONSTRAINTS = {
  video: {
    displaySurface: 'monitor',
    logicalSurface: true,
    cursor: 'always'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
};

export const RECORDING_OPTIONS = {
  mimeType: 'video/webm;codecs=vp9,opus',
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000,   // 128 kbps
};

// Mobile-specific constraints
export const MOBILE_CONSTRAINTS = {
  video: {
    width: { min: 240, ideal: 640, max: 1280 },
    height: { min: 180, ideal: 480, max: 720 },
    frameRate: { min: 10, ideal: 24, max: 30 },
    facingMode: 'user'
  },
  audio: MEDIA_CONSTRAINTS.audio
};

export const CONNECTION_TIMEOUTS = {
  CONNECTION_TIMEOUT: 30000,      // 30 seconds
  RECONNECTION_TIMEOUT: 10000,    // 10 seconds
  ICE_GATHERING_TIMEOUT: 5000,    // 5 seconds
  MAX_RECONNECTION_ATTEMPTS: 3,
};

export const AUDIO_LEVELS = {
  MUTE_THRESHOLD: 0.01,
  SPEAKING_THRESHOLD: 0.1,
  UPDATE_INTERVAL: 100, // ms
};