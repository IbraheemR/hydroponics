import winston, { format, transports, createLogger } from "winston";
import DataLogger from "./DataLogger";

export var eventsLog = createLogger({
  format: format.combine(
    format.label({ label: "[my-label]" }),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf((info) => `${info.timestamp} [${info.level}] ${info.message}`)
  ),
  transports: [
    new transports.Console({}),
    new transports.File({
      filename: process.env.EVENTS_LOG,
    }),
  ],
});

export var dataLog = new DataLogger<{ temp: number }>("data.log");
