import { AsyncLocalStorage } from "node:async_hooks";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  orgId?: string;
}

// Request-scoped storage container
export const logContextStorage = new AsyncLocalStorage<LogContext>();

class Logger {
  private isProduction = process.env.NODE_ENV === "production";
  private currentLogLevel: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || "info";

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.currentLogLevel];
  }

  private getContext(): LogContext {
    return logContextStorage.getStore() || {};
  }

  private formatMeta(meta?: any): any {
    if (!meta) return undefined;
    if (meta instanceof Error) {
      return {
        message: meta.message,
        stack: meta.stack,
        name: meta.name,
      };
    }
    return meta;
  }

  private write(level: LogLevel, message: string, meta?: any) {
    if (!this.shouldLog(level)) return;

    const context = this.getContext();
    const timestamp = new Date().toISOString();
    const formattedMeta = this.formatMeta(meta);

    if (this.isProduction) {
      // Structured JSON output for cloud log aggregators
      const payload = {
        timestamp,
        level,
        message,
        ...context,
        meta: formattedMeta,
      };
      console.log(JSON.stringify(payload));
    } else {
      // Pretty printing for local development
      const colors = {
        debug: "\x1b[36m", // Cyan
        info: "\x1b[32m", // Green
        warn: "\x1b[33m", // Yellow
        error: "\x1b[31m", // Red
        fatal: "\x1b[35m", // Magenta
      };
      const reset = "\x1b[0m";
      const color = colors[level] || reset;
      const contextStr = context.requestId ? ` [reqId:${context.requestId}]` : "";

      console.log(`${timestamp} ${color}${level.toUpperCase()}${reset}${contextStr}: ${message}`);
      if (formattedMeta) {
        console.log(JSON.stringify(formattedMeta, null, 2));
      }
    }
  }

  debug(message: string, meta?: any) {
    this.write("debug", message, meta);
  }

  info(message: string, meta?: any) {
    this.write("info", message, meta);
  }

  warn(message: string, meta?: any) {
    this.write("warn", message, meta);
  }

  error(message: string, meta?: any) {
    this.write("error", message, meta);
  }

  fatal(message: string, meta?: any) {
    this.write("fatal", message, meta);
  }
}

export const logger = new Logger();
export default logger;
