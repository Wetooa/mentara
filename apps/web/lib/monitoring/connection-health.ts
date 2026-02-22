/**
 * Connection Health Monitoring System
 * Provides comprehensive WebSocket and network health monitoring
 */

interface HealthMetrics {
  timestamp: number;
  isConnected: boolean;
  isOnline: boolean;
  connectionTime?: number;
  lastError?: string;
  retryCount: number;
  transportType?: string;
  latency?: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
}

interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'critical';
  websocket: 'connected' | 'connecting' | 'disconnected' | 'error';
  network: 'online' | 'offline' | 'slow';
  metrics: HealthMetrics;
  recommendations: string[];
}

class ConnectionHealthMonitor {
  private metrics: HealthMetrics[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private onHealthChangeCallbacks: ((result: HealthCheckResult) => void)[] = [];
  private readonly maxMetricsHistory = 50;
  private lastHealthResult: HealthCheckResult | null = null;

  constructor() {
    // Only start monitoring in browser environment
    if (typeof window !== 'undefined') {
      this.startMonitoring();
    }
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    // Perform initial health check
    this.performHealthCheck();
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = Date.now();
    
    // Get network status
    const networkInfo = this.getNetworkInfo();
    
    // Get WebSocket status
    const wsInfo = this.getWebSocketInfo();
    
    // Calculate connection quality
    const connectionQuality = this.calculateConnectionQuality(networkInfo, wsInfo);
    
    // Create current metrics
    const currentMetrics: HealthMetrics = {
      timestamp,
      isConnected: wsInfo.isConnected,
      isOnline: networkInfo.online,
      connectionTime: wsInfo.connectionTime,
      lastError: wsInfo.lastError,
      retryCount: wsInfo.retryCount,
      transportType: wsInfo.transport,
      latency: await this.measureLatency(),
      connectionQuality,
    };

    // Add to metrics history
    this.metrics.push(currentMetrics);
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Generate health check result
    const result = this.generateHealthResult(currentMetrics);
    
    // Notify callbacks if health status changed
    if (!this.lastHealthResult || 
        this.lastHealthResult.overall !== result.overall ||
        this.lastHealthResult.websocket !== result.websocket) {
      this.onHealthChangeCallbacks.forEach(callback => {
        try {
          callback(result);
        } catch (error) {
          console.error('[HEALTH] Error in health change callback:', error);
        }
      });
    }

    this.lastHealthResult = result;
    return result;
  }

  /**
   * Subscribe to health status changes
   */
  onHealthChange(callback: (result: HealthCheckResult) => void): () => void {
    this.onHealthChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.onHealthChangeCallbacks.indexOf(callback);
      if (index !== -1) {
        this.onHealthChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current health status
   */
  getCurrentHealth(): HealthCheckResult | null {
    return this.lastHealthResult;
  }

  /**
   * Get health metrics history
   */
  getMetricsHistory(): HealthMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get health summary for the last N minutes
   */
  getHealthSummary(minutes: number = 10): {
    averageLatency: number;
    connectionStability: number; // percentage of time connected
    errorRate: number; // errors per minute
    qualityDistribution: Record<string, number>;
  } {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    
    if (recentMetrics.length === 0) {
      return {
        averageLatency: 0,
        connectionStability: 0,
        errorRate: 0,
        qualityDistribution: {},
      };
    }

    const connectedTime = recentMetrics.filter(m => m.isConnected).length;
    const totalTime = recentMetrics.length;
    const errors = recentMetrics.filter(m => m.lastError).length;
    
    const latencies = recentMetrics.filter(m => m.latency).map(m => m.latency!);
    const averageLatency = latencies.length > 0 
      ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
      : 0;

    const qualityDistribution = recentMetrics.reduce((acc, m) => {
      acc[m.connectionQuality] = (acc[m.connectionQuality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      averageLatency: Math.round(averageLatency),
      connectionStability: Math.round((connectedTime / totalTime) * 100),
      errorRate: Math.round((errors / minutes) * 10) / 10,
      qualityDistribution,
    };
  }

  /**
   * Get network information
   */
  private getNetworkInfo(): {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  } {
    // Check if running in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        online: true, // Assume online in SSR
      };
    }

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    };
  }

  /**
   * Get WebSocket information
   */
  private getWebSocketInfo(): {
    isConnected: boolean;
    connectionTime?: number;
    lastError?: string;
    retryCount: number;
    transport?: string;
  } {
    // Check if running in browser environment
    if (typeof window === 'undefined') {
      return {
        isConnected: false,
        retryCount: 0,
      };
    }

    try {
      // Try to get WebSocket state from our websocket library
      const wsState = (window as any).__wsState__;
      if (wsState) {
        return {
          isConnected: wsState.isConnected || false,
          connectionTime: wsState.lastConnected ? Date.now() - new Date(wsState.lastConnected).getTime() : undefined,
          lastError: wsState.error || undefined,
          retryCount: wsState.retryCount || 0,
          transport: wsState.transport || 'unknown',
        };
      }
    } catch (error) {
      console.warn('[HEALTH] Failed to get WebSocket state:', error);
    }

    // Fallback to basic checks
    return {
      isConnected: false,
      retryCount: 0,
    };
  }

  /**
   * Calculate overall connection quality
   */
  private calculateConnectionQuality(
    networkInfo: any, 
    wsInfo: any
  ): 'excellent' | 'good' | 'poor' | 'critical' {
    if (!networkInfo.online || !wsInfo.isConnected) {
      return 'critical';
    }

    // Check retry count
    if (wsInfo.retryCount > 3) {
      return 'poor';
    }

    // Check network quality
    if (networkInfo.effectiveType === '4g' && networkInfo.rtt < 100) {
      return 'excellent';
    } else if (networkInfo.effectiveType === '3g' || networkInfo.rtt < 300) {
      return 'good';
    } else {
      return 'poor';
    }
  }

  /**
   * Measure connection latency
   */
  private async measureLatency(): Promise<number | undefined> {
    // Skip latency measurement in SSR
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return undefined;
    }

    try {
      const start = performance.now();
      
      // Try to fetch a small resource to measure latency - use the public health endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';
      const response = await fetch(`${apiUrl}/health`, {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      // Accept any successful response as a latency measurement
      if (response.status < 500) {
        return Math.round(performance.now() - start);
      }
    } catch (error) {
      // Network error - try a simple fetch to the API base
      try {
        const start2 = performance.now();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';
        await fetch(apiUrl, { 
          method: 'HEAD', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        return Math.round(performance.now() - start2);
      } catch (error2) {
        // Latency measurement failed, that's ok
      }
    }
    
    return undefined;
  }

  /**
   * Generate health check result
   */
  private generateHealthResult(metrics: HealthMetrics): HealthCheckResult {
    let overall: 'healthy' | 'degraded' | 'critical';
    let websocket: 'connected' | 'connecting' | 'disconnected' | 'error';
    let network: 'online' | 'offline' | 'slow';
    const recommendations: string[] = [];

    // Determine WebSocket status
    if (metrics.isConnected) {
      websocket = 'connected';
    } else if (metrics.retryCount > 0) {
      websocket = 'connecting';
    } else if (metrics.lastError) {
      websocket = 'error';
      recommendations.push('Check your authentication and network connection');
    } else {
      websocket = 'disconnected';
      recommendations.push('Try refreshing the page or clicking the reconnect button');
    }

    // Determine network status
    if (!metrics.isOnline) {
      network = 'offline';
      recommendations.push('Check your internet connection');
    } else if (metrics.latency && metrics.latency > 1000) {
      network = 'slow';
      recommendations.push('Your connection appears slow, which may affect real-time features');
    } else {
      network = 'online';
    }

    // Determine overall health
    if (metrics.connectionQuality === 'critical' || !metrics.isOnline) {
      overall = 'critical';
    } else if (metrics.connectionQuality === 'poor' || metrics.retryCount > 2) {
      overall = 'degraded';
      recommendations.push('Connection quality is degraded but functional');
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      websocket,
      network,
      metrics,
      recommendations,
    };
  }
}

// Create singleton instance
export const connectionHealthMonitor = new ConnectionHealthMonitor();

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).healthMonitor = connectionHealthMonitor;
  (window as any).getHealthReport = () => {
    const health = connectionHealthMonitor.getCurrentHealth();
    const summary = connectionHealthMonitor.getHealthSummary();
    console.group('🏥 Connection Health Report');
    console.log('Current Status:', health);
    console.log('10-Minute Summary:', summary);
    console.groupEnd();
    return { health, summary };
  };
}

export default connectionHealthMonitor;