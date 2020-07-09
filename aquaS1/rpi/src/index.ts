import { config } from "dotenv";
config();

import { createInterface } from "readline";

import ControlManager from "./control/ControlManager";
import { eventsLog, dataLog } from "./logging/loggers";

async function measureLoggedVariables() {
  dataLog.log({
    T: await arduinoController.getTemp(),
  });
}

try {

  const input = createInterface({
    input: process.stdin
  })


  var arduinoController = new ControlManager(
    process.env.SERIAL_PORT,
    Number(process.env.BAUD_RATE)
  );

  input.on("line", text => {
    arduinoController.serialManager.write(text);
    eventsLog.info(`U> ${text}`)
  })


  arduinoController.on("ready", async () => {
    eventsLog.info("Serial control active!");
    measureLoggedVariables();
  });

  arduinoController.on("error", (message) => {
    eventsLog.error(message);
  });

  arduinoController.on("mcmessage", (data) => {
    if (!data.match(/\*E[0-9]/))
      // Do not write to debug if is error flag
      eventsLog.debug(`%> ${data}`);
  });

  arduinoController.on("mcerror", (data) => {
    eventsLog.error(`%> ${data}`);
  });

  process.on("SIGINT", () => {
    arduinoController.close();
    input.close();
    eventsLog.info("Stopping gracefully! (SIGINT)");
    process.exit();
  });

} catch (error) {
  eventsLog.error(error.message);
}