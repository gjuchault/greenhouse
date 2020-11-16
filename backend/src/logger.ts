import winston from "winston";
import { inspect } from "util";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.printf(
          ({ timestamp, level, message, service = "app", ...meta }) => {
            let result = `[${timestamp}] ${level} ${service}: ${message}`;

            if (Object.keys(meta).length > 0) {
              result += `\n${inspect(JSON.parse(JSON.stringify(meta)), {
                colors: true,
              })}`;
            }

            return result;
          }
        )
      ),
    }),
  ],
});

export function createLogger(service: string) {
  return logger.child({
    service,
  });
}
