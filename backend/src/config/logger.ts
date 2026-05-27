import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addColors, createLogger, format, transports } from "winston";

const { combine, timestamp, errors, colorize, printf, json, splat } = format;

const env = process.env.NODE_ENV ?? "development";
const isProduction = env === "production";
const defaultMetaKeys = ["service", "environment"] as const;

addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "blue",
  silly: "grey",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDirectory = path.resolve(__dirname, "../../logs");

mkdirSync(logDirectory, { recursive: true });

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  errors({ stack: true }),
  splat(),
  printf((info) => {
    const metadata = { ...info } as Record<string, unknown>;
    delete metadata.level;
    delete metadata.message;
    delete metadata.timestamp;
    delete metadata.stack;
    for (const key of defaultMetaKeys) {
      delete metadata[key];
    }

    const metadataString = Object.keys(metadata).length
      ? `\n${JSON.stringify(metadata, null, 2)}`
      : "";

    const stackString = info.stack ? `\n${info.stack}` : "";

    return `${info.timestamp} [${info.level}] ${info.message}${stackString}${metadataString}`;
  }),
);

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  json(),
);

export const logger = createLogger({
  level: isProduction ? "info" : "debug",
  defaultMeta: {
    service: "event-ticketing-backend",
    environment: env,
  },
  transports: [
    new transports.Console({
      level: isProduction ? "info" : "debug",
      format: consoleFormat,
      handleExceptions: true,
    }),
    new transports.File({
      filename: path.join(logDirectory, "app.log"),
      level: "info",
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  ],
  exitOnError: false,
});

export const requestLogStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { value: error };
}
