let logger: Logger = console;

export interface Logger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
  log(...args: any[]): void;
}

export function setLogger(loggerInstance: Logger) {
  logger = loggerInstance;
}

export default logger;
