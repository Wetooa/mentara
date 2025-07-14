/**
 * Load Testing Framework for Backend Agent Support
 * 
 * Advanced load testing capabilities specifically designed to support
 * Backend Agent's critical endpoint verification and performance testing needs.
 * 
 * Features:
 * - Concurrent user simulation
 * - Response time analysis
 * - Throughput measurement
 * - Error rate tracking
 * - Performance bottleneck identification
 * - Database connection monitoring
 */

import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { EventEmitter } from 'events';

export interface LoadTestConfig {
  baseUrl: string;
  endpoints: EndpointConfig[];
  concurrentUsers: number;
  testDuration: number; // in seconds
  rampUpTime: number; // in seconds
  authentication?: {
    type: 'bearer' | 'api-key' | 'basic';
    token?: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
}

export interface EndpointConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  weight: number; // probability of selecting this endpoint (1-100)
  payload?: any;
  headers?: Record<string, string>;
  expectedStatusCodes?: number[];
}

export interface RequestResult {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface LoadTestResults {
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    testDuration: number;
  };
  endpointStats: Map<string, {
    requests: number;
    successes: number;
    failures: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
  }>;
  timeSeriesData: {
    timestamp: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
  }[];
  errors: {
    endpoint: string;
    error: string;
    count: number;
  }[];
  recommendations: string[];
}

export class LoadTestFramework extends EventEmitter {
  private config: LoadTestConfig;
  private results: RequestResult[];
  private isRunning: boolean;
  private startTime: number;
  private endTime: number;

  constructor(config: LoadTestConfig) {
    super();
    this.config = config;
    this.results = [];
    this.isRunning = false;
    this.startTime = 0;
    this.endTime = 0;
  }

  /**
   * Run the load test
   */
  async runLoadTest(): Promise<LoadTestResults> {
    console.log('🚀 Starting load test...');
    console.log(`Configuration:
    - Base URL: ${this.config.baseUrl}
    - Endpoints: ${this.config.endpoints.length}
    - Concurrent Users: ${this.config.concurrentUsers}
    - Test Duration: ${this.config.testDuration}s
    - Ramp Up Time: ${this.config.rampUpTime}s`);

    this.isRunning = true;
    this.startTime = Date.now();
    this.results = [];

    // Create user simulation promises
    const userPromises: Promise<void>[] = [];
    
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      const delay = (this.config.rampUpTime * 1000 * i) / this.config.concurrentUsers;
      userPromises.push(this.simulateUser(delay));
    }

    // Run for specified duration
    setTimeout(() => {
      this.isRunning = false;
      this.endTime = Date.now();
    }, this.config.testDuration * 1000);

    // Wait for all users to complete
    await Promise.allSettled(userPromises);

    console.log('✅ Load test completed');
    return this.analyzeResults();
  }

  /**
   * Simulate a single user's behavior
   */
  private async simulateUser(initialDelay: number): Promise<void> {
    // Wait for ramp-up delay
    if (initialDelay > 0) {
      await this.sleep(initialDelay);
    }

    while (this.isRunning) {
      try {
        const endpoint = this.selectRandomEndpoint();
        const result = await this.makeRequest(endpoint);
        this.results.push(result);

        this.emit('request-completed', result);

        // Random think time between requests (100-500ms)
        const thinkTime = Math.random() * 400 + 100;
        await this.sleep(thinkTime);
      } catch (error) {
        console.error('Error in user simulation:', error);
      }
    }
  }

  /**
   * Select random endpoint based on weights
   */
  private selectRandomEndpoint(): EndpointConfig {
    const totalWeight = this.config.endpoints.reduce((sum, ep) => sum + ep.weight, 0);
    let random = Math.random() * totalWeight;

    for (const endpoint of this.config.endpoints) {
      random -= endpoint.weight;
      if (random <= 0) {
        return endpoint;
      }
    }

    return this.config.endpoints[0]; // fallback
  }

  /**
   * Make HTTP request to endpoint
   */
  private async makeRequest(endpoint: EndpointConfig): Promise<RequestResult> {
    const startTime = Date.now();
    const url = new URL(endpoint.path, this.config.baseUrl);
    
    const requestOptions: any = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mentara-LoadTester/1.0',
        ...endpoint.headers,
      },
    };

    // Add authentication
    if (this.config.authentication) {
      switch (this.config.authentication.type) {
        case 'bearer':
          requestOptions.headers['Authorization'] = `Bearer ${this.config.authentication.token}`;
          break;
        case 'api-key':
          requestOptions.headers['X-API-Key'] = this.config.authentication.apiKey;
          break;
        case 'basic':
          const auth = Buffer.from(
            `${this.config.authentication.username}:${this.config.authentication.password}`
          ).toString('base64');
          requestOptions.headers['Authorization'] = `Basic ${auth}`;
          break;
      }
    }

    return new Promise((resolve) => {
      const protocol = url.protocol === 'https:' ? https : http;
      
      const req = protocol.request(url, requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          const success = endpoint.expectedStatusCodes 
            ? endpoint.expectedStatusCodes.includes(res.statusCode || 0)
            : (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400;

          resolve({
            endpoint: `${endpoint.method} ${endpoint.path}`,
            method: endpoint.method,
            statusCode: res.statusCode || 0,
            responseTime,
            success,
            timestamp: startTime,
          });
        });
      });

      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        resolve({
          endpoint: `${endpoint.method} ${endpoint.path}`,
          method: endpoint.method,
          statusCode: 0,
          responseTime,
          success: false,
          error: error.message,
          timestamp: startTime,
        });
      });

      req.setTimeout(30000, () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          endpoint: `${endpoint.method} ${endpoint.path}`,
          method: endpoint.method,
          statusCode: 0,
          responseTime,
          success: false,
          error: 'Request timeout',
          timestamp: startTime,
        });
      });

      // Send payload for POST/PUT/PATCH requests
      if (endpoint.payload && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        req.write(JSON.stringify(endpoint.payload));
      }

      req.end();
    });
  }

  /**
   * Analyze test results and generate report
   */
  private analyzeResults(): LoadTestResults {
    const totalRequests = this.results.length;
    const successfulRequests = this.results.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = this.results.map(r => r.responseTime);
    const averageResponseTime = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    
    const testDuration = (this.endTime - this.startTime) / 1000;
    const requestsPerSecond = totalRequests / testDuration;
    const errorRate = (failedRequests / totalRequests) * 100;

    // Endpoint-specific statistics
    const endpointStats = new Map();
    for (const result of this.results) {
      const key = result.endpoint;
      if (!endpointStats.has(key)) {
        endpointStats.set(key, {
          requests: 0,
          successes: 0,
          failures: 0,
          responseTimes: [],
        });
      }

      const stats = endpointStats.get(key);
      stats.requests++;
      if (result.success) {
        stats.successes++;
      } else {
        stats.failures++;
      }
      stats.responseTimes.push(result.responseTime);
    }

    // Calculate averages for each endpoint
    for (const [key, stats] of endpointStats.entries()) {
      const avgRT = stats.responseTimes.reduce((sum: number, rt: number) => sum + rt, 0) / stats.responseTimes.length;
      endpointStats.set(key, {
        requests: stats.requests,
        successes: stats.successes,
        failures: stats.failures,
        averageResponseTime: avgRT,
        minResponseTime: Math.min(...stats.responseTimes),
        maxResponseTime: Math.max(...stats.responseTimes),
      });
    }

    // Time series data (1-second intervals)
    const timeSeriesData = this.generateTimeSeriesData();

    // Error analysis
    const errorMap = new Map<string, { endpoint: string; count: number }>();
    for (const result of this.results) {
      if (!result.success && result.error) {
        const key = `${result.endpoint}: ${result.error}`;
        if (!errorMap.has(key)) {
          errorMap.set(key, { endpoint: result.endpoint, count: 0 });
        }
        errorMap.get(key)!.count++;
      }
    }

    const errors = Array.from(errorMap.entries()).map(([error, data]) => ({
      endpoint: data.endpoint,
      error: error.split(': ')[1],
      count: data.count,
    }));

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      averageResponseTime,
      maxResponseTime,
      errorRate,
      requestsPerSecond,
      endpointStats,
    });

    return {
      summary: {
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime,
        minResponseTime,
        maxResponseTime,
        requestsPerSecond,
        errorRate,
        testDuration,
      },
      endpointStats,
      timeSeriesData,
      errors,
      recommendations,
    };
  }

  /**
   * Generate time series data for charts
   */
  private generateTimeSeriesData(): any[] {
    const timeSeriesData: any[] = [];
    const intervalMs = 1000; // 1 second intervals
    
    const startTime = this.startTime;
    const endTime = this.endTime;
    
    for (let timestamp = startTime; timestamp < endTime; timestamp += intervalMs) {
      const intervalResults = this.results.filter(
        r => r.timestamp >= timestamp && r.timestamp < timestamp + intervalMs
      );
      
      const requests = intervalResults.length;
      const avgResponseTime = requests > 0 
        ? intervalResults.reduce((sum, r) => sum + r.responseTime, 0) / requests 
        : 0;
      const errors = intervalResults.filter(r => !r.success).length;
      const errorRate = requests > 0 ? (errors / requests) * 100 : 0;
      
      timeSeriesData.push({
        timestamp: timestamp - startTime,
        requestsPerSecond: requests,
        averageResponseTime: avgResponseTime,
        errorRate,
      });
    }
    
    return timeSeriesData;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    // Response time recommendations
    if (metrics.averageResponseTime > 1000) {
      recommendations.push('Average response time is high (>1s). Consider optimizing database queries and adding caching.');
    }
    
    if (metrics.maxResponseTime > 5000) {
      recommendations.push('Maximum response time is very high (>5s). Investigate slow endpoints and implement timeouts.');
    }

    // Error rate recommendations
    if (metrics.errorRate > 5) {
      recommendations.push('Error rate is high (>5%). Review error logs and improve error handling.');
    }
    
    if (metrics.errorRate > 1) {
      recommendations.push('Consider implementing circuit breakers for external service calls.');
    }

    // Throughput recommendations
    if (metrics.requestsPerSecond < 10) {
      recommendations.push('Low throughput detected. Consider horizontal scaling or performance optimization.');
    }

    // Endpoint-specific recommendations
    for (const [endpoint, stats] of metrics.endpointStats.entries()) {
      if (stats.averageResponseTime > 2000) {
        recommendations.push(`Endpoint ${endpoint} is slow (${stats.averageResponseTime.toFixed(0)}ms average). Priority optimization target.`);
      }
      
      if (stats.failures > stats.successes) {
        recommendations.push(`Endpoint ${endpoint} has high failure rate. Requires immediate attention.`);
      }
    }

    return recommendations;
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Predefined load test configurations for Backend Agent's critical endpoints
 */
export const CriticalEndpointLoadTests = {
  /**
   * Authentication endpoints load test
   */
  authEndpoints: {
    baseUrl: 'http://localhost:3001', // Adjust to actual backend URL
    endpoints: [
      {
        path: '/auth/is-first-signin',
        method: 'GET' as const,
        weight: 30,
        expectedStatusCodes: [200, 404],
      },
      {
        path: '/auth/admin',
        method: 'GET' as const,
        weight: 20,
        expectedStatusCodes: [200, 401, 403],
      },
      {
        path: '/auth/user',
        method: 'GET' as const,
        weight: 50,
        expectedStatusCodes: [200, 401],
      },
    ],
    concurrentUsers: 10,
    testDuration: 60,
    rampUpTime: 10,
  },

  /**
   * Booking endpoints load test
   */
  bookingEndpoints: {
    baseUrl: 'http://localhost:3001',
    endpoints: [
      {
        path: '/booking/slots/range',
        method: 'GET' as const,
        weight: 40,
        expectedStatusCodes: [200],
      },
      {
        path: '/booking/meetings',
        method: 'POST' as const,
        weight: 30,
        payload: {
          therapistId: 'test-therapist-id',
          startTime: new Date().toISOString(),
          duration: 60,
          type: 'video',
        },
        expectedStatusCodes: [201, 400],
      },
      {
        path: '/booking/meetings/test-id/complete',
        method: 'POST' as const,
        weight: 30,
        expectedStatusCodes: [200, 404],
      },
    ],
    concurrentUsers: 15,
    testDuration: 90,
    rampUpTime: 15,
  },

  /**
   * Community endpoints load test
   */
  communityEndpoints: {
    baseUrl: 'http://localhost:3001',
    endpoints: [
      {
        path: '/communities',
        method: 'GET' as const,
        weight: 50,
        expectedStatusCodes: [200],
      },
      {
        path: '/communities/assign-user',
        method: 'POST' as const,
        weight: 30,
        payload: {
          userId: 'test-user-id',
          communityId: 'test-community-id',
        },
        expectedStatusCodes: [200, 400],
      },
      {
        path: '/communities/test-id/posts',
        method: 'GET' as const,
        weight: 20,
        expectedStatusCodes: [200, 404],
      },
    ],
    concurrentUsers: 20,
    testDuration: 120,
    rampUpTime: 20,
  },
};

// Export utility functions
export const runCriticalEndpointLoadTest = async (
  testName: keyof typeof CriticalEndpointLoadTests
): Promise<LoadTestResults> => {
  const config = CriticalEndpointLoadTests[testName];
  const loadTest = new LoadTestFramework(config);
  
  return await loadTest.runLoadTest();
};

export const createCustomLoadTest = (config: LoadTestConfig): LoadTestFramework => {
  return new LoadTestFramework(config);
};