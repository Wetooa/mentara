import { AxiosInstance } from "axios";

// Video Call Service Types
export interface VideoCallLog {
  id: string;
  callId: string;
  callerId: string;
  recipientId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  status: 'completed' | 'missed' | 'declined' | 'failed';
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  createdAt: string;
  updatedAt: string;
}

export interface VideoCallQualityReport {
  callId: string;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  connectionType?: string;
  bandwidth?: number;
  latency?: number;
  packetLoss?: number;
  issues?: string[];
}

export interface VideoCallStats {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  averageDuration: number;
  averageQuality: number;
  callsThisWeek: number;
  callsThisMonth: number;
}

export interface StartCallLogDto {
  recipientId: string;
  callType?: 'video' | 'audio';
  context?: 'therapy' | 'admin' | 'support' | 'general';
}

export interface EndCallLogDto {
  callId: string;
  duration: number; // in seconds
  endReason: 'completed' | 'declined' | 'timeout' | 'error';
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface GetCallHistoryParams {
  limit?: number;
  offset?: number;
  userId?: string; // to filter calls with specific user
  startDate?: string;
  endDate?: string;
  status?: 'completed' | 'missed' | 'declined' | 'failed';
}

/**
 * Video Call service for logging and analytics
 * Since video calls are peer-to-peer, this service mainly handles:
 * - Call logging for history/analytics
 * - Quality reporting
 * - Call statistics
 */
export function createVideoCallService(axios: AxiosInstance) {
  return {
    // Call Logging
    async logCallStart(data: StartCallLogDto) {
      const { data: response } = await axios.post<{ callId: string; success: boolean }>(
        "/video-calls/log/start",
        data
      );
      return response;
    },

    async logCallEnd(data: EndCallLogDto) {
      const { data: response } = await axios.post<{ success: boolean }>(
        "/video-calls/log/end",
        data
      );
      return response;
    },

    // Quality Reporting
    async reportCallQuality(data: VideoCallQualityReport) {
      const { data: response } = await axios.post<{ success: boolean }>(
        "/video-calls/quality/report",
        data
      );
      return response;
    },

    // Call History
    async getCallHistory(params?: GetCallHistoryParams) {
      const { data } = await axios.get<VideoCallLog[]>(
        "/video-calls/history",
        { params }
      );
      return data;
    },

    async getCallById(callId: string) {
      const { data } = await axios.get<VideoCallLog>(
        `/video-calls/history/${callId}`
      );
      return data;
    },

    // Statistics
    async getCallStats(userId?: string) {
      const { data } = await axios.get<VideoCallStats>(
        "/video-calls/stats",
        { params: userId ? { userId } : undefined }
      );
      return data;
    },

    // User-specific methods
    async getMyCallHistory(params?: GetCallHistoryParams) {
      const { data } = await axios.get<VideoCallLog[]>(
        "/video-calls/my-history",
        { params }
      );
      return data;
    },

    async getMyCallStats() {
      const { data } = await axios.get<VideoCallStats>(
        "/video-calls/my-stats"
      );
      return data;
    },

    // Admin/Moderator methods
    async getAllCallLogs(params?: GetCallHistoryParams) {
      const { data } = await axios.get<VideoCallLog[]>(
        "/video-calls/admin/logs",
        { params }
      );
      return data;
    },

    async getSystemCallStats() {
      const { data } = await axios.get<VideoCallStats & {
        totalUsers: number;
        activeCallsNow: number;
        peakConcurrentCalls: number;
      }>(
        "/video-calls/admin/stats"
      );
      return data;
    },

    // Helper method for call duration formatting
    formatDuration(seconds: number): string {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
    },

    // Helper method for quality score
    getQualityScore(quality: 'poor' | 'fair' | 'good' | 'excellent'): number {
      const scores = { poor: 1, fair: 2, good: 3, excellent: 4 };
      return scores[quality];
    },

    // Helper method for quality color (for UI)
    getQualityColor(quality: 'poor' | 'fair' | 'good' | 'excellent'): string {
      const colors = {
        poor: 'text-red-500',
        fair: 'text-yellow-500',
        good: 'text-blue-500',
        excellent: 'text-green-500'
      };
      return colors[quality];
    }
  };
}