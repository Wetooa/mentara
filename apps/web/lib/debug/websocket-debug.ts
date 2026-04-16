/**
 * WebSocket Debug Utilities
 * Provides Socket.io debugging capabilities with easy enable/disable functionality
 */

interface DebugConfig {
  enabled: boolean;
  level: 'basic' | 'verbose' | 'all';
  persistToStorage: boolean;
}

const DEBUG_STORAGE_KEY = 'mentara_websocket_debug';
const SOCKET_DEBUG_KEY = 'debug';

class WebSocketDebugger {
  private config: DebugConfig = {
    enabled: false,
    level: 'basic',
    persistToStorage: true,
  };

  constructor() {
    this.loadDebugConfig();
  }

  /**
   * Enable Socket.io debug logging
   */
  enable(level: 'basic' | 'verbose' | 'all' = 'basic'): void {
    this.config.enabled = true;
    this.config.level = level;

    // Set localStorage debug for Socket.io
    const debugPattern = this.getDebugPattern(level);
    localStorage.setItem(SOCKET_DEBUG_KEY, debugPattern);

    if (this.config.persistToStorage) {
      localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(this.config));
    }

    console.log(`🐛 [DEBUG] WebSocket debugging enabled (${level})`);
    console.log(`📝 [DEBUG] Socket.io debug pattern: ${debugPattern}`);
    console.log('🔄 [DEBUG] Please refresh the page to apply Socket.io debug logging');
  }

  /**
   * Disable Socket.io debug logging
   */
  disable(): void {
    this.config.enabled = false;
    localStorage.removeItem(SOCKET_DEBUG_KEY);

    if (this.config.persistToStorage) {
      localStorage.removeItem(DEBUG_STORAGE_KEY);
    }

    console.log('🐛 [DEBUG] WebSocket debugging disabled');
    console.log('🔄 [DEBUG] Please refresh the page to remove Socket.io debug logging');
  }

  /**
   * Check if debugging is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get current debug level
   */
  getLevel(): string {
    return this.config.level;
  }

  /**
   * Log connection state changes with detailed information
   */
  logConnectionState(state: any, context?: string): void {
    if (!this.config.enabled) return;

    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}]` : '[CONNECTION]';

    console.group(`🔗 ${prefix} Connection State Change - ${timestamp}`);
    console.log('📊 State:', state);
    
    if (state.isConnected) {
      console.log('✅ Status: Connected');
    } else if (state.isConnecting) {
      console.log('🔄 Status: Connecting...');
    } else if (state.error) {
      console.log('❌ Status: Error');
      console.error('💥 Error:', state.error);
    } else {
      console.log('⚪ Status: Disconnected');
    }

    if (state.lastConnected) {
      const timeSinceLastConnection = Date.now() - new Date(state.lastConnected).getTime();
      console.log(`⏱️ Last Connected: ${state.lastConnected} (${Math.round(timeSinceLastConnection / 1000)}s ago)`);
    }

    if (state.retryCount > 0) {
      console.log(`🔄 Retry Count: ${state.retryCount}`);
    }

    if (state.transportError) {
      console.warn('🚨 Transport Error: Active');
    }

    console.groupEnd();
  }

  /**
   * Log WebSocket events with detailed information
   */
  logEvent(eventName: string, data?: any, direction: 'incoming' | 'outgoing' = 'incoming'): void {
    if (!this.config.enabled) return;

    const timestamp = new Date().toISOString();
    const icon = direction === 'incoming' ? '📨' : '📤';
    const prefix = direction === 'incoming' ? 'RECEIVED' : 'SENT';

    console.group(`${icon} [EVENT ${prefix}] ${eventName} - ${timestamp}`);
    
    if (data) {
      if (this.config.level === 'verbose' || this.config.level === 'all') {
        console.log('📦 Data:', data);
      } else {
        // Basic level - show simplified data
        if (data.message) {
          console.log('💬 Message:', data.message.content?.substring(0, 100) + '...');
        } else {
          console.log('📦 Data keys:', Object.keys(data));
        }
      }
    }
    
    console.groupEnd();
  }

  /**
   * Log authentication events
   */
  logAuth(event: 'attempt' | 'success' | 'failure', details?: any): void {
    if (!this.config.enabled) return;

    const timestamp = new Date().toISOString();
    
    switch (event) {
      case 'attempt':
        console.log(`🔐 [AUTH] Authentication attempt - ${timestamp}`);
        if (details?.hasToken) {
          console.log('🎫 Token: Present');
        } else {
          console.warn('🎫 Token: Missing');
        }
        break;
      case 'success':
        console.log(`✅ [AUTH] Authentication successful - ${timestamp}`);
        if (details?.userId) {
          console.log(`👤 User ID: ${details.userId}`);
        }
        break;
      case 'failure':
        console.error(`❌ [AUTH] Authentication failed - ${timestamp}`);
        if (details?.error) {
          console.error('💥 Error:', details.error);
        }
        break;
    }
  }

  /**
   * Create a connection health report
   */
  generateHealthReport(): object {
    const debugState = localStorage.getItem(SOCKET_DEBUG_KEY);
    const hasSocketDebug = !!debugState;
    
    return {
      timestamp: new Date().toISOString(),
      debug: {
        enabled: this.config.enabled,
        level: this.config.level,
        socketDebugEnabled: hasSocketDebug,
        debugPattern: debugState,
      },
      browser: {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        cookiesEnabled: navigator.cookieEnabled,
      },
      environment: {
        wsUrl: process.env.NEXT_PUBLIC_WS_URL,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        nodeEnv: process.env.NODE_ENV,
      },
      localStorage: {
        hasAuthToken: !!localStorage.getItem('mentara_access_token'),
        hasRefreshToken: !!localStorage.getItem('mentara_refresh_token'),
      },
    };
  }

  /**
   * Load debug configuration from localStorage
   */
  private loadDebugConfig(): void {
    try {
      const stored = localStorage.getItem(DEBUG_STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }

      // Check if Socket.io debug is already enabled
      const socketDebug = localStorage.getItem(SOCKET_DEBUG_KEY);
      if (socketDebug && !this.config.enabled) {
        this.config.enabled = true;
        console.log('🐛 [DEBUG] Found existing Socket.io debug configuration');
      }
    } catch (error) {
      console.warn('⚠️ [DEBUG] Failed to load debug configuration:', error);
    }
  }

  /**
   * Get Socket.io debug pattern based on level
   */
  private getDebugPattern(level: 'basic' | 'verbose' | 'all'): string {
    switch (level) {
      case 'basic':
        return 'socket.io-client:socket';
      case 'verbose':
        return 'socket.io-client:*';
      case 'all':
        return '*';
      default:
        return 'socket.io-client:socket';
    }
  }
}

// Create singleton instance
export const wsDebugger = new WebSocketDebugger();

// Global debug functions for easy access in console
if (typeof window !== 'undefined') {
  (window as any).enableWSDebug = (level?: 'basic' | 'verbose' | 'all') => wsDebugger.enable(level);
  (window as any).disableWSDebug = () => wsDebugger.disable();
  (window as any).wsHealthReport = () => {
    const report = wsDebugger.generateHealthReport();
    console.table(report);
    return report;
  };

  // Log instructions for users
  if (wsDebugger.isEnabled()) {
    console.log('🐛 [DEBUG] WebSocket debugging is enabled');
  } else {
    console.log('🐛 [DEBUG] WebSocket debugging available:');
    console.log('  enableWSDebug("basic")   - Enable basic WebSocket debugging');
    console.log('  enableWSDebug("verbose") - Enable verbose WebSocket debugging');
    console.log('  disableWSDebug()         - Disable WebSocket debugging');
    console.log('  wsHealthReport()         - Generate connection health report');
  }
}

export default wsDebugger;