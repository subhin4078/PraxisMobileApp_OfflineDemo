import { APP_CONFIG } from "@/src/constants/app";
import { format } from "date-fns";

// ANSI color codes for console output
const COLORS = {
  DEBUG: "\x1b[36m", // Cyan
  INFO: "\x1b[32m", // Green
  WARN: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  RESET: "\x1b[0m",
};

enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

class Logger {
  private getFormattedTime(): string {
    return format(new Date(), "yyyy-MM-dd HH:mm:ss");
  }

  private log(level: LogLevel, ...messages: string[]): void {
    // Gate debug/info logs to dev builds only — prevents leaking PII in production
    if (
      !APP_CONFIG.IS_DEV &&
      (level === LogLevel.DEBUG || level === LogLevel.INFO)
    ) {
      return;
    }

    const timestamp = this.getFormattedTime();
    const color = COLORS[level] || COLORS.RESET;
    const message = messages.join(" ");

    console.log(`${color}${timestamp} - ${level} - ${message}${COLORS.RESET}`);
  }

  debug(...messages: string[]): void {
    this.log(LogLevel.DEBUG, ...messages);
  }

  info(...messages: string[]): void {
    this.log(LogLevel.INFO, ...messages);
  }

  warn(...messages: string[]): void {
    this.log(LogLevel.WARN, ...messages);
  }

  error(...messages: string[]): void {
    this.log(LogLevel.ERROR, ...messages);
  }
}

export default new Logger();
