import winston, { format, transports, createLogger } from "winston";
import DataLogger from "./DataLogger";

const CONSOLE_FORMAT = format.combine(
  format.label({ label: "[my-label]" }),
  format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  format.colorize(),
  format.printf((info) => `${info.timestamp} [${info.level}] ${info.message}`)
);

const FILE_FORMAT = format.combine(
  format.label({ label: "[my-label]" }),
  format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  format.printf((info) => `${info.timestamp} [${info.level}] ${info.message}`)
);

export var eventsLog = createLogger({

  transports: [
    new transports.Console({
      level: "debug",
      format: CONSOLE_FORMAT
    }),
    new transports.File({
      filename: process.env.EVENTS_LOG,
      format: FILE_FORMAT
    }),
  ],
});

export var dataLog = new DataLogger<{ T: number }>(process.env.DATA_LOG);
