import { RECORDING_OPTIONS } from './webrtc-config';

export interface RecorderEvents {
  onStart: () => void;
  onStop: (blob: Blob) => void;
  onError: (error: Error) => void;
  onDataAvailable?: (blob: Blob) => void;
}

export class MediaRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecordingActive = false;
  private events: RecorderEvents;
  private recordingStream: MediaStream | null = null;

  constructor(events: RecorderEvents) {
    this.events = events;
  }

  /**
   * Start recording multiple streams
   */
  startRecording(streams: MediaStream[]): void {
    if (this.isRecordingActive) {
      console.warn('Recording is already active');
      return;
    }

    try {
      // Create a mixed stream from all input streams
      this.recordingStream = this.mixStreams(streams);
      
      // Check if the browser supports the preferred MIME type
      const mimeType = this.getSupportedMimeType();
      
      this.mediaRecorder = new MediaRecorder(this.recordingStream, {
        mimeType,
        videoBitsPerSecond: RECORDING_OPTIONS.videoBitsPerSecond,
        audioBitsPerSecond: RECORDING_OPTIONS.audioBitsPerSecond,
      });

      this.setupRecorderEvents();
      
      this.recordedChunks = [];
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecordingActive = true;
      
      this.events.onStart();
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.events.onError(error as Error);
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (!this.isRecordingActive || !this.mediaRecorder) {
      return;
    }

    try {
      this.mediaRecorder.stop();
      this.isRecordingActive = false;
      
      // Clean up the recording stream
      if (this.recordingStream) {
        this.recordingStream.getTracks().forEach(track => track.stop());
        this.recordingStream = null;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.events.onError(error as Error);
    }
  }

  /**
   * Check if recording is active
   */
  isRecording(): boolean {
    return this.isRecordingActive;
  }

  /**
   * Get supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    // Fallback to default
    return '';
  }

  /**
   * Mix multiple streams into one
   */
  private mixStreams(streams: MediaStream[]): MediaStream {
    if (streams.length === 0) {
      throw new Error('No streams provided for recording');
    }

    if (streams.length === 1) {
      return streams[0];
    }

    // Create a canvas to mix video streams
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1280;
    canvas.height = 720;

    // Create video elements for each stream
    const videos: HTMLVideoElement[] = [];
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioDestination = audioContext.createMediaStreamDestination();

    streams.forEach((stream, index) => {
      // Handle video
      if (stream.getVideoTracks().length > 0) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;
        videos.push(video);
      }

      // Handle audio - mix all audio tracks
      if (stream.getAudioTracks().length > 0) {
        const audioSource = audioContext.createMediaStreamSource(stream);
        audioSource.connect(audioDestination);
      }
    });

    // Draw videos on canvas
    const drawFrame = () => {
      if (!this.isRecordingActive) return;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const videosToRender = videos.filter(v => v.readyState >= 2);
      
      if (videosToRender.length === 1) {
        // Single video - full screen
        const video = videosToRender[0];
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else if (videosToRender.length === 2) {
        // Two videos - side by side
        const halfWidth = canvas.width / 2;
        videosToRender.forEach((video, i) => {
          ctx.drawImage(video, i * halfWidth, 0, halfWidth, canvas.height);
        });
      } else if (videosToRender.length > 2) {
        // Multiple videos - grid layout
        const cols = Math.ceil(Math.sqrt(videosToRender.length));
        const rows = Math.ceil(videosToRender.length / cols);
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;

        videosToRender.forEach((video, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          ctx.drawImage(video, col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        });
      }

      requestAnimationFrame(drawFrame);
    };

    // Start the drawing loop
    drawFrame();

    // Create the output stream
    const canvasStream = canvas.captureStream(30); // 30 FPS
    const outputStream = new MediaStream();

    // Add video track
    const videoTrack = canvasStream.getVideoTracks()[0];
    if (videoTrack) {
      outputStream.addTrack(videoTrack);
    }

    // Add mixed audio track
    const audioTrack = audioDestination.stream.getAudioTracks()[0];
    if (audioTrack) {
      outputStream.addTrack(audioTrack);
    }

    return outputStream;
  }

  /**
   * Set up MediaRecorder event listeners
   */
  private setupRecorderEvents(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
        this.events.onDataAvailable?.(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, {
        type: this.mediaRecorder?.mimeType || 'video/webm',
      });
      
      this.events.onStop(blob);
      this.recordedChunks = [];
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
      this.events.onError(new Error('Recording failed'));
    };
  }

  /**
   * Download the recorded video
   */
  static downloadRecording(blob: Blob, filename: string = 'meeting-recording.webm'): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Upload recording to server
   */
  static async uploadRecording(blob: Blob, meetingId: string, uploadUrl: string): Promise<void> {
    const formData = new FormData();
    formData.append('recording', blob, `meeting-${meetingId}-${Date.now()}.webm`);
    formData.append('meetingId', meetingId);

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      console.log('Recording uploaded successfully');
    } catch (error) {
      console.error('Failed to upload recording:', error);
      throw error;
    }
  }

  /**
   * Get recording duration in seconds
   */
  getRecordingDuration(): number {
    // This is a simple estimate - for more accurate duration, 
    // you'd need to track the start time and calculate elapsed time
    return this.recordedChunks.length; // Rough estimate based on chunks (1 per second)
  }

  /**
   * Get recording size in bytes
   */
  getRecordingSize(): number {
    return this.recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
  }
}