type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: number;
  requestId?: string;
}

class Logger {
  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
  }

  info(message: string, data?: any) {
    const log = this.formatLog('info', message, data);
    console.log(JSON.stringify(log));
  }

  warn(message: string, data?: any) {
    const log = this.formatLog('warn', message, data);
    console.warn(JSON.stringify(log));
  }

  error(message: string, error?: Error | any, data?: any) {
    const log = this.formatLog('error', message, {
      ...data,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
    });
    console.error(JSON.stringify(log));
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      const log = this.formatLog('debug', message, data);
      console.debug(JSON.stringify(log));
    }
  }
}

export const logger = new Logger();

