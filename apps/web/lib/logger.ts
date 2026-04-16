/**
 * Production-safe logger utility
 * Only logs in development mode, preventing console statements in production builds
 */

type LogLevel = "log" | "info" | "warn" | "error" | "debug";

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  log(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  error(...args: unknown[]): void {
    // Always log errors, even in production, but can be configured to send to error tracking
    console.error(...args);
  }

  debug(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Group logs together (development only)
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * End a group (development only)
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Conditional logging - only logs if condition is true
   */
  conditional(condition: boolean, level: LogLevel, ...args: unknown[]): void {
    if (condition) {
      this[level](...args);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;
