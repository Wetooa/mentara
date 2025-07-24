/**
 * Enhanced logging utility for debugging WebSocket and messaging functionality
 * Provides structured logging with different levels and WebSocket-specific helpers
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  userId?: string;
  conversationId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private logLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep logs within limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with proper formatting
    if (this.shouldLog(entry.level)) {
      const timestamp = entry.timestamp.toISOString().split('T')[1].slice(0, -1);
      const levelStr = LogLevel[entry.level];
      const prefix = `[${timestamp}] ${levelStr} [${entry.category}]`;
      
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.log(`🔍 ${prefix}`, entry.message, entry.data || '');
          break;
        case LogLevel.INFO:
          console.info(`ℹ️ ${prefix}`, entry.message, entry.data || '');
          break;
        case LogLevel.WARN:
          console.warn(`⚠️ ${prefix}`, entry.message, entry.data || '');
          break;
        case LogLevel.ERROR:
          console.error(`❌ ${prefix}`, entry.message, entry.data || '');
          break;
      }
    }
  }

  public debug(category: string, message: string, data?: any, context?: { userId?: string; conversationId?: string }): void {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      category,
      message,
      data,
      ...context,
    });
  }

  public info(category: string, message: string, data?: any, context?: { userId?: string; conversationId?: string }): void {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.INFO,
      category,
      message,
      data,
      ...context,
    });
  }

  public warn(category: string, message: string, data?: any, context?: { userId?: string; conversationId?: string }): void {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.WARN,
      category,
      message,
      data,
      ...context,
    });
  }

  public error(category: string, message: string, data?: any, context?: { userId?: string; conversationId?: string }): void {
    this.addLog({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      category,
      message,
      data,
      ...context,
    });
  }

  // WebSocket-specific logging methods
  public websocket = {
    connecting: (namespace?: string) => {
      this.info('WebSocket', `Connecting to ${namespace || 'default'} namespace`);
    },
    
    connected: (socketId: string, namespace?: string) => {
      this.info('WebSocket', `Connected to ${namespace || 'default'} namespace`, { socketId });
    },
    
    disconnected: (reason: string, namespace?: string) => {
      this.warn('WebSocket', `Disconnected from ${namespace || 'default'} namespace`, { reason });
    },
    
    error: (error: any, namespace?: string) => {
      this.error('WebSocket', `Connection error in ${namespace || 'default'} namespace`, error);
    },
    
    eventSent: (event: string, data?: any, namespace?: string) => {
      this.debug('WebSocket', `Sent event: ${event}`, { data, namespace });
    },
    
    eventReceived: (event: string, data?: any, namespace?: string) => {
      this.debug('WebSocket', `Received event: ${event}`, { data, namespace });
    },
    
    reconnecting: (attempt: number, maxAttempts: number) => {
      this.info('WebSocket', `Reconnecting... (${attempt}/${maxAttempts})`);
    },
  };

  // Messaging-specific logging methods
  public messaging = {
    conversationJoined: (conversationId: string, userId?: string) => {
      this.info('Messaging', 'Joined conversation', { conversationId, userId });
    },
    
    conversationLeft: (conversationId: string, userId?: string) => {
      this.info('Messaging', 'Left conversation', { conversationId, userId });
    },
    
    messageSent: (messageId: string, conversationId: string, content: string) => {
      this.info('Messaging', 'Message sent', { 
        messageId, 
        conversationId, 
        contentLength: content.length 
      });
    },
    
    messageReceived: (messageId: string, conversationId: string, authorId: string) => {
      this.info('Messaging', 'Message received', { 
        messageId, 
        conversationId, 
        authorId 
      });
    },
    
    typingStart: (userId: string, conversationId: string) => {
      this.debug('Messaging', 'User started typing', { userId, conversationId });
    },
    
    typingStop: (userId: string, conversationId: string) => {
      this.debug('Messaging', 'User stopped typing', { userId, conversationId });
    },
    
    messageRead: (messageId: string, userId: string) => {
      this.debug('Messaging', 'Message marked as read', { messageId, userId });
    },
    
    reactionAdded: (messageId: string, emoji: string, userId: string) => {
      this.debug('Messaging', 'Reaction added', { messageId, emoji, userId });
    },
  };

  // React Query cache logging
  public cache = {
    hit: (queryKey: string[]) => {
      this.debug('Cache', 'Cache hit', { queryKey });
    },
    
    miss: (queryKey: string[]) => {
      this.debug('Cache', 'Cache miss', { queryKey });
    },
    
    invalidated: (queryKey: string[]) => {
      this.info('Cache', 'Cache invalidated', { queryKey });
    },
    
    updated: (queryKey: string[], dataSize?: number) => {
      this.debug('Cache', 'Cache updated', { queryKey, dataSize });
    },
  };

  // Authentication logging
  public auth = {
    tokenRefreshed: (expiresIn?: number) => {
      this.info('Auth', 'Token refreshed', { expiresIn });
    },
    
    tokenExpired: () => {
      this.warn('Auth', 'Token expired');
    },
    
    loginSuccess: (userId: string, role: string) => {
      this.info('Auth', 'Login successful', { userId, role });
    },
    
    logoutSuccess: () => {
      this.info('Auth', 'Logout successful');
    },
  };

  // Connection status and network logging
  public network = {
    online: () => {
      this.info('Network', 'Connection restored');
    },
    
    offline: () => {
      this.warn('Network', 'Connection lost');
    },
    
    requestStart: (url: string, method: string) => {
      this.debug('Network', `${method} ${url}`);
    },
    
    requestSuccess: (url: string, method: string, status: number, duration?: number) => {
      this.debug('Network', `${method} ${url} - ${status}`, { duration });
    },
    
    requestError: (url: string, method: string, error: any, duration?: number) => {
      this.error('Network', `${method} ${url} - Error`, { error, duration });
    },
  };

  // Utility methods
  public getLogs(filter?: {
    category?: string;
    level?: LogLevel;
    userId?: string;
    conversationId?: string;
    since?: Date;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filter.category);
      }
      if (filter.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level >= filter.level!);
      }
      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
      }
      if (filter.conversationId) {
        filteredLogs = filteredLogs.filter(log => log.conversationId === filter.conversationId);
      }
      if (filter.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.since!);
      }
    }

    return filteredLogs;
  }

  public clearLogs(): void {
    this.logs = [];
    console.log('🗑️ [Logger] Logs cleared');
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info('Logger', `Log level set to ${LogLevel[level]}`);
  }

  // Debug helpers for development
  public debug_dumpWebSocketState(): void {
    if (this.isProduction) return;

    const wsLogs = this.getLogs({ category: 'WebSocket' });
    console.group('🔍 WebSocket Debug State');
    console.log('Recent WebSocket logs:', wsLogs.slice(-10));
    console.groupEnd();
  }

  public debug_dumpMessagingState(): void {
    if (this.isProduction) return;

    const messagingLogs = this.getLogs({ category: 'Messaging' });
    console.group('🔍 Messaging Debug State');
    console.log('Recent messaging logs:', messagingLogs.slice(-10));
    console.groupEnd();
  }

  public debug_dumpConnectionState(): void {
    if (this.isProduction) return;

    const networkLogs = this.getLogs({ category: 'Network' });
    const wsLogs = this.getLogs({ category: 'WebSocket' });
    
    console.group('🔍 Connection Debug State');
    console.log('Network logs:', networkLogs.slice(-5));
    console.log('WebSocket logs:', wsLogs.slice(-5));
    console.log('Online:', navigator.onLine);
    console.groupEnd();
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for use in React components
export const useLogger = () => logger;

// Global debug helpers (available in browser console)
if (typeof window !== 'undefined' && !process.env.NODE_ENV === 'production') {
  (window as any).debugLogger = {
    ws: () => logger.debug_dumpWebSocketState(),
    messaging: () => logger.debug_dumpMessagingState(),
    connection: () => logger.debug_dumpConnectionState(),
    logs: (filter?: any) => logger.getLogs(filter),
    clear: () => logger.clearLogs(),
    export: () => logger.exportLogs(),
    setLevel: (level: LogLevel) => logger.setLogLevel(level),
  };

  console.log('🔍 Debug helpers available:');
  console.log('  debugLogger.ws() - WebSocket state');
  console.log('  debugLogger.messaging() - Messaging state');  
  console.log('  debugLogger.connection() - Connection state');
  console.log('  debugLogger.logs(filter?) - Get logs');
  console.log('  debugLogger.clear() - Clear logs');
  console.log('  debugLogger.export() - Export logs as JSON');
  console.log('  debugLogger.setLevel(level) - Set log level');
}

export default logger;