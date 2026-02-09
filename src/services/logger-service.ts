/**
 * Logger Service for Mobile (Koli One)
 * بديل لـ console.log/error/warn
 * في production يكتم الـ debug/info
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const IS_DEV = __DEV__; // Expo/React Native يوفر __DEV__ تلقائياً

class Logger {
  private log(level: LogLevel, message: string, error?: Error | unknown, context?: LogContext) {
    if (!IS_DEV && (level === 'debug' || level === 'info')) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${level.toUpperCase()}] [${timestamp}]`;

    switch (level) {
      case 'debug':
      case 'info':
        if (IS_DEV) console.log(prefix, message, context || '');
        break;
      case 'warn':
        if (IS_DEV) console.warn(prefix, message, context || '');
        break;
      case 'error':
        console.error(prefix, message, error || '', context || '');
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, undefined, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    this.log('error', message, error, context);
  }
}

export const logger = new Logger();
export default logger;
