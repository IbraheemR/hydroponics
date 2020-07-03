import { config } from "dotenv";
config();

import { SerialControlManager } from "./serialControl";

import { eventsLog, dataLog } from "./loggers";

var serialController = new SerialControlManager(
  process.env.SERIAL_PORT,
  Number(process.env.BAUD_RATE)
);

serialController.on("ready", async () => {
  eventsLog.info("Serial Control active!");
  dataLog.log({ temp: await serialController.getTemp() });
});

serialController.on("error", (message) => {
  eventsLog.error(message);
});

serialController.on("mcmessage", (data) => {
  console.log(`%> ${data}`);
});

serialController.on("mcerror", (data) => {
  eventsLog.error(`%> ${data}`);
});

console.log("begin");
