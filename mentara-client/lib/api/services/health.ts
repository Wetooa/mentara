import { AxiosInstance } from 'axios';

// Health check response types
export interface BasicHealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}

export interface DatabaseHealthResponse {
  status: 'connected' | 'disconnected';
  responseTime?: number;
  connections?: {
    active: number;
    idle: number;
    total: number;
  };
  queryStats?: {
    totalQueries: number;
    averageQueryTime: number;
    slowQueries: number;
  };
  lastBackup?: string;
  error?: string;
  timestamp?: string;
}

export interface ServiceHealthResponse {
  status: 'ok' | 'error';
  responseTime?: number;
  error?: string;
  region?: string;
  webhooksProcessed?: number;
  emailsSent?: number;
  failureRate?: number;
  assessmentsProcessed?: number;
}

export interface ServicesHealthResponse {
  supabase: ServiceHealthResponse;
  stripe: ServiceHealthResponse;
  emailService: ServiceHealthResponse;
  aiService: ServiceHealthResponse;
}

export interface SystemMetricsResponse {
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  disk: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  };
  nodejs: {
    version: string;
    uptime: number;
    pid: number;
  };
}

export interface DetailedHealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime?: number;
  version?: string;
  database: DatabaseHealthResponse;
  services: ServicesHealthResponse;
  system: SystemMetricsResponse;
  errors?: string[];
}

export interface AdminHealthResponse {
  overview: {
    status: string;
    uptime: number;
    lastRestart: string;
    errorRate: number;
  };
  alerts: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
  performance: {
    averageResponseTime: number;
    requestsPerMinute: number;
    activeConnections: number;
    errorCount: number;
  };
  resources: {
    memory: Record<string, unknown>;
    cpu: Record<string, unknown>;
    database: Record<string, unknown>;
    storage: Record<string, unknown>;
  };
}

export interface HealthService {
  getBasicHealth(): Promise<BasicHealthResponse>;
  getDetailedHealth(): Promise<DetailedHealthResponse>;
  getDatabaseHealth(): Promise<DatabaseHealthResponse>;
  getServicesHealth(): Promise<ServicesHealthResponse>;
  getSystemMetrics(): Promise<SystemMetricsResponse>;
  getAdminHealthDashboard(): Promise<AdminHealthResponse>;
}

export const createHealthService = (client: AxiosInstance): HealthService => ({
  getBasicHealth: async (): Promise<BasicHealthResponse> => {
    const response = await client.get('/health');
    return response.data;
  },

  getDetailedHealth: async (): Promise<DetailedHealthResponse> => {
    const response = await client.get('/health/detailed');
    return response.data;
  },

  getDatabaseHealth: async (): Promise<DatabaseHealthResponse> => {
    const response = await client.get('/health/database');
    return response.data;
  },

  getServicesHealth: async (): Promise<ServicesHealthResponse> => {
    const response = await client.get('/health/services');
    return response.data;
  },

  getSystemMetrics: async (): Promise<SystemMetricsResponse> => {
    const response = await client.get('/health/system');
    return response.data;
  },

  getAdminHealthDashboard: async (): Promise<AdminHealthResponse> => {
    const response = await client.get('/health/admin');
    return response.data;
  },
});