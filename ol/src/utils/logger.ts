const levelsPriority: Record<string, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel = process.env.LOG_LEVEL || "info";
const shouldLog = (level: string) =>
  levelsPriority[level] >= levelsPriority[currentLevel];

const SENSITIVE_FIELDS = new Set([
  "password",
  "current_password",
  "new_password",
  "confirm_password",
  "password_confirmation",
  "token",
  "access_token",
  "authorization",
  "secret",
  "api_key",
]);

export const sanitizeForLogging = (meta: any): any => {
  if (meta === null || meta === undefined) return meta;
  if (Array.isArray(meta)) return meta.map((item) => sanitizeForLogging(item));
  if (typeof meta === "object") {
    return Object.entries(meta).reduce((acc: any, [key, value]) => {
      if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
        acc[key] = "***REDACTED***";
      } else {
        acc[key] = sanitizeForLogging(value);
      }
      return acc;
    }, {});
  }
  return meta;
};

const serializeMeta = (meta: any) => {
  if (meta === undefined || meta === null) return undefined;
  try {
    return JSON.parse(
      JSON.stringify(sanitizeForLogging(meta), (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );
  } catch (error: any) {
    return { serialization_error: error.message };
  }
};

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const levelColors: Record<string, string> = {
  debug: colors.blue,
  info: colors.green,
  warn: colors.yellow,
  error: colors.red,
};

const writeLog = (level: string, message: string, meta?: any) => {
  if (!shouldLog(level)) return;

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta: serializeMeta(meta),
  };

  const color = levelColors[level] || colors.reset;
  const coloredLevel = `${color}[${payload.level.toUpperCase()}]${colors.reset}`;
  const logArgs: any[] = [coloredLevel, payload.timestamp, payload.message];
  if (payload.meta !== undefined) logArgs.push(payload.meta);

  switch (level) {
    case "debug":
      console.debug(...logArgs);
      break;
    case "info":
      console.info(...logArgs);
      break;
    case "warn":
      console.warn(...logArgs);
      break;
    case "error":
      console.error(...logArgs);
      break;
    default:
      console.log(...logArgs);
      break;
  }
};

export const logger = {
  debug(message: string, meta?: any) {
    writeLog("debug", message, meta);
  },
  info(message: string, meta?: any) {
    writeLog("info", message, meta);
  },
  warn(message: string, meta?: any) {
    writeLog("warn", message, meta);
  },
  error(message: string, meta?: any) {
    const metaWithStack =
      meta instanceof Error
        ? { message: meta.message, stack: meta.stack }
        : meta;
    writeLog("error", message, metaWithStack);
  },
};
