import { Logger } from "winston";
import Delimiter from "@serialport/parser-delimiter";
import { GreenhouseEvents } from "../../../events";
import { openPort } from "../serialport";
import {
  decodeGreenhouseStatement,
  encodeGreenhouseCommand,
} from "../greenhouseProtocol";

export * from "./device";

export interface ArduinoDependencies {
  events: GreenhouseEvents;
  logger: Logger;
}

export async function createArduino(
  path: string,
  { logger, events }: ArduinoDependencies
) {
  logger.info(`Starting arduino on ${path}...`);

  const port = await openPort(path);
  const parser = port.pipe(new Delimiter({ delimiter: "\r\n" }));

  port.on("error", (err) => {
    logger.error(err);
  });

  parser.on("data", (data: Buffer) => {
    const line = data.toString().trim().padStart(24, "0");

    const { sensorId, value } = decodeGreenhouseStatement(parseInt(line, 2));

    logger.debug("arduino:entry", `(sensor: ${sensorId} value: ${value})`);
    events.emit("arduino:entry", sensorId, value);
  });

  events.on("command:send", (target, input) => {
    const data = encodeGreenhouseCommand(target, input);
    logger.debug("arduino:command", `(target: ${target} value: ${input})`);

    port.write(`${data}\n`, (err) => {
      if (err) logger.error(err);
    });
  });

  logger.info("Service started");
}
