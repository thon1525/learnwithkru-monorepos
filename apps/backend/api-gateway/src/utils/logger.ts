import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, align } = winston.format;

// Custom printf function to match the desired format
const customFormat = printf(({ timestamp, level, message }) => {
  // Formatting the timestamp, level, and message for the console log
  return `[${timestamp}] ${level}: ${message}`;
});

// Create a Winston Logger
export const logger = winston.createLogger({
  defaultMeta: { service: "api-gateway-service" },
  // Add a timestamp to each log message & format in JSON
  format: combine(colorize({ all: true }), timestamp(), align(), customFormat),
  transports: [],
});

// Initialize the logger with different transports based on environment
export const logInit = ({
  env,
  logLevel,
}: {
  env: string | undefined;
  logLevel: string | undefined;
}) => {
  // Output Logs to the Console (Unless it's Testing)
  logger.add(
    new winston.transports.Console({
      level: logLevel,
      silent: env === "testing",
    })
  );

  if (env !== "development") {
    logger.add(
      new winston.transports.File({
        level: logLevel,
        filename: path.join(__dirname, "../../logs/auth-service.log"),
      })
    );
  }
};

export const logDestroy = () => {
  logger.clear();
  logger.close();
};
