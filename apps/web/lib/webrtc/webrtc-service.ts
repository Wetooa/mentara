import SimplePeer from 'simple-peer';
import { getWebRTCConfig, getWebRTCConfigSync, MEDIA_CONSTRAINTS, SCREEN_SHARE_CONSTRAINTS, CONNECTION_TIMEOUTS, MOBILE_CONSTRAINTS } from './webrtc-config';
import { MediaRecorderService } from './media-recorder-service';

export interface PeerConnection {
  peer: SimplePeer.Instance;
  userId: string;
  stream?: MediaStream;
  isInitiator: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
}

export interface WebRTCEvents {
  onPeerConnected: (userId: string, stream: MediaStream) => void;
  onPeerDisconnected: (userId: string) => void;
  onPeerStream: (userId: string, stream: MediaStream) => void;
  onSignalData: (userId: string, data: unknown) => void;
  onError: (userId: string, error: Error) => void;
  onConnectionStateChange: (userId: string, state: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: (blob: Blob) => void;
  onRecordingError: (error: Error) => void;
}

export class WebRTCService {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private events: Partial<WebRTCEvents> = {};
  private mediaRecorder: MediaRecorderService;
  private isMobile: boolean;
  private webrtcConfig: any = null;
  private meetingId: string | null = null;

  constructor(events: Partial<WebRTCEvents> = {}) {
    this.events = events;
    this.mediaRecorder = new MediaRecorderService({
      onStart: () => this.events.onRecordingStart?.(),
      onStop: (blob) => this.events.onRecordingStop?.(blob),
      onError: (error) => this.events.onRecordingError?.(error),
    });
    this.isMobile = this.detectMobile();
    // Initialize with sync config, will be updated async
    this.webrtcConfig = getWebRTCConfigSync();
    // Fetch latest config from backend
    this.initializeConfig();
  }

  /**
   * Initialize WebRTC configuration from backend
   */
  private async initializeConfig(): Promise<void> {
    try {
      this.webrtcConfig = await getWebRTCConfig();
    } catch (error) {
      console.warn('Failed to fetch WebRTC config, using defaults:', error);
    }
  }

  /**
   * Set meeting ID for meeting room mode
   */
  setMeetingId(meetingId: string): void {
    this.meetingId = meetingId;
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Initialize local media stream
   */
  async initializeMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      const defaultConstraints = this.isMobile ? MOBILE_CONSTRAINTS : MEDIA_CONSTRAINTS;
      const mediaConstraints = constraints || defaultConstraints;
      
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      // Set up audio level monitoring
      this.setupAudioLevelMonitoring(this.localStream);
      
      return this.localStream;
    } catch (error) {
      console.error('Failed to initialize media:', error);
      throw new Error(`Failed to access camera/microphone: ${error}`);
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia(SCREEN_SHARE_CONSTRAINTS);
      
      // Listen for screen share end
      this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare();
      });

      // Replace video track in all peer connections
      await this.replaceVideoTrack(this.screenStream.getVideoTracks()[0]);
      
      return this.screenStream;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw new Error(`Failed to start screen sharing: ${error}`);
    }
  }

  /**
   * Stop screen sharing and return to camera
   */
  async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Return to camera
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        await this.replaceVideoTrack(videoTrack);
      }
    }
  }

  /**
   * Replace video track in all peer connections
   */
  private async replaceVideoTrack(newTrack: MediaStreamTrack): Promise<void> {
    for (const [userId] of this.peers) {
      try {
        // SimplePeer doesn't have replaceTrack, so we'll need to recreate the connection
        // In a production environment, you might want to use native RTCPeerConnection
        console.log(`Would replace video track for peer ${userId}`);
      } catch (error) {
        console.error(`Failed to replace track for peer ${userId}:`, error);
      }
    }
    // Suppress unused parameter warning
    void newTrack;
  }

  /**
   * Create peer connection
   */
  async createPeerConnection(userId: string, isInitiator: boolean): Promise<void> {
    if (this.peers.has(userId)) {
      this.destroyPeerConnection(userId);
    }

    // Ensure config is loaded
    if (!this.webrtcConfig) {
      await this.initializeConfig();
    }

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      config: this.webrtcConfig,
      stream: this.localStream || undefined,
    });

    const peerConnection: PeerConnection = {
      peer,
      userId,
      isInitiator,
      connectionState: 'connecting',
    };

    // Set up peer event listeners
    this.setupPeerEvents(peerConnection);
    
    this.peers.set(userId, peerConnection);

    // Set connection timeout
    setTimeout(() => {
      if (peerConnection.connectionState === 'connecting') {
        this.handleConnectionTimeout(userId);
      }
    }, CONNECTION_TIMEOUTS.CONNECTION_TIMEOUT);
  }

  /**
   * Create peer connections for all participants in a meeting room
   */
  async createMeetingRoomConnections(participantIds: string[], isHost: boolean): Promise<void> {
    // Create connections to all other participants
    for (const participantId of participantIds) {
      if (!this.peers.has(participantId)) {
        // First participant to join is the initiator
        const isInitiator = isHost && this.peers.size === 0;
        await this.createPeerConnection(participantId, isInitiator);
      }
    }
  }

  /**
   * Handle incoming WebRTC signal
   */
  handleSignal(userId: string, signalData: unknown): void {
    const peerConnection = this.peers.get(userId);
    if (peerConnection) {
      try {
        peerConnection.peer.signal(signalData);
      } catch (error) {
        console.error(`Failed to handle signal from ${userId}:`, error);
        this.events.onError?.(userId, error as Error);
      }
    }
  }

  /**
   * Set up peer event listeners
   */
  private setupPeerEvents(peerConnection: PeerConnection): void {
    const { peer, userId } = peerConnection;

    peer.on('signal', (data) => {
      this.events.onSignalData?.(userId, data);
    });

    peer.on('stream', (stream) => {
      peerConnection.stream = stream;
      peerConnection.connectionState = 'connected';
      this.events.onPeerStream?.(userId, stream);
      this.events.onPeerConnected?.(userId, stream);
      this.events.onConnectionStateChange?.(userId, 'connected');
    });

    peer.on('connect', () => {
      peerConnection.connectionState = 'connected';
      console.log(`Peer ${userId} connected`);
      this.events.onConnectionStateChange?.(userId, 'connected');
    });

    peer.on('close', () => {
      peerConnection.connectionState = 'disconnected';
      this.events.onPeerDisconnected?.(userId);
      this.events.onConnectionStateChange?.(userId, 'disconnected');
      this.peers.delete(userId);
    });

    peer.on('error', (error) => {
      peerConnection.connectionState = 'failed';
      console.error(`Peer ${userId} error:`, error);
      this.events.onError?.(userId, error);
      this.events.onConnectionStateChange?.(userId, 'failed');
    });

    peer.on('data', (data) => {
      // Handle data channel messages if needed
      console.log(`Data from ${userId}:`, data.toString());
    });
  }

  /**
   * Handle connection timeout
   */
  private handleConnectionTimeout(userId: string): void {
    console.warn(`Connection timeout for peer ${userId}`);
    this.destroyPeerConnection(userId);
    this.events.onError?.(userId, new Error('Connection timeout'));
  }

  /**
   * Toggle video track
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  /**
   * Toggle audio track
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  /**
   * Get current media state
   */
  getMediaState(): { video: boolean; audio: boolean; screen: boolean } {
    const video = this.localStream?.getVideoTracks()[0]?.enabled || false;
    const audio = this.localStream?.getAudioTracks()[0]?.enabled || false;
    const screen = !!this.screenStream;

    return { video, audio, screen };
  }

  /**
   * Set up audio level monitoring
   */
  private setupAudioLevelMonitoring(stream: MediaStream): void {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    microphone.connect(analyser);
    analyser.fftSize = 256;

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      // Audio level monitoring - currently unused but available for future features
      void average;

      // You can emit audio level events here if needed
      // this.events.onAudioLevel?.(normalizedLevel);

      requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  }

  /**
   * Start recording
   */
  startRecording(): void {
    const streams: MediaStream[] = [];
    
    if (this.localStream) {
      streams.push(this.localStream);
    }

    // Add remote streams
    for (const [, connection] of this.peers) {
      if (connection.stream) {
        streams.push(connection.stream);
      }
    }

    this.mediaRecorder.startRecording(streams);
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    this.mediaRecorder.stopRecording();
  }

  /**
   * Check if recording is active
   */
  isRecording(): boolean {
    return this.mediaRecorder.isRecording();
  }

  /**
   * Destroy specific peer connection
   */
  destroyPeerConnection(userId: string): void {
    const peerConnection = this.peers.get(userId);
    if (peerConnection) {
      peerConnection.peer.destroy();
      this.peers.delete(userId);
      this.events.onPeerDisconnected?.(userId);
    }
  }

  /**
   * Reconnect to a peer (useful for dropped connections)
   */
  async reconnectPeer(userId: string, isInitiator: boolean): Promise<void> {
    this.destroyPeerConnection(userId);
    await this.createPeerConnection(userId, isInitiator);
  }

  /**
   * Cleanup all connections and resources
   */
  destroy(): void {
    // Stop recording if active
    if (this.isRecording()) {
      this.stopRecording();
    }

    // Destroy all peer connections
    for (const [userId] of this.peers) {
      this.destroyPeerConnection(userId);
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Stop screen stream
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    this.peers.clear();
    this.meetingId = null;
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(userId: string): Promise<unknown> {
    const peerConnection = this.peers.get(userId);
    if (peerConnection) {
      // SimplePeer doesn't expose getStats easily, but you could access the internal RTCPeerConnection
      // For production, consider using native RTCPeerConnection for better stats access
      return null;
    }
    return null;
  }

  /**
   * Get all connected peers
   */
  getConnectedPeers(): string[] {
    return Array.from(this.peers.keys()).filter(userId => {
      const peer = this.peers.get(userId);
      return peer?.connectionState === 'connected';
    });
  }

  /**
   * Send data to specific peer
   */
  sendData(userId: string, data: string): void {
    const peerConnection = this.peers.get(userId);
    if (peerConnection && peerConnection.connectionState === 'connected') {
      try {
        peerConnection.peer.send(data);
      } catch (error) {
        console.error(`Failed to send data to ${userId}:`, error);
      }
    }
  }

  /**
   * Send data to all connected peers
   */
  broadcastData(data: string): void {
    for (const userId of this.getConnectedPeers()) {
      this.sendData(userId, data);
    }
  }
}