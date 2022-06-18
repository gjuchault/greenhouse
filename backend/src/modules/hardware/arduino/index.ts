import { Logger } from "winston";
import { DelimiterParser } from "@serialport/parser-delimiter";
import { GreenhouseEvents } from "../../../events";
import { openPort } from "../serialport";
import {
  decodeGreenhouseStatement,
  encodeGreenhouseCommand,
} from "../greenhouseProtocol";
import { Hardware } from "../hardware";

export * from "./device";

export interface ArduinoDependencies {
  events: GreenhouseEvents;
  logger: Logger;
}

export async function createArduino(
  path: string,
  hardware: Hardware,
  { logger, events }: ArduinoDependencies
) {
  logger.info(`Starting arduino on ${path}...`);

  const port = await openPort(path);
  const parser = port.pipe(new DelimiterParser({ delimiter: "\r\n" }));

  port.on("error", (err) => {
    logger.error(err);
  });

  parser.on("data", (data: Buffer) => {
    const line = data.toString().trim().padStart(24, "0");

    const { sensorId, value } = decodeGreenhouseStatement(parseInt(line, 2));

    logger.debug(
      `arduino:entry (sensor: ${sensorId} value: ${value} path:${path})`
    );
    events.emit("arduino:entry", {
      sensorId,
      hardwarePath: hardware.path,
      value,
    });
  });

  events.on("command:send", ({ target, value }) => {
    const data = encodeGreenhouseCommand(target, value);
    logger.debug(`arduino:command (target: ${target} value: ${value})`);

    port.write(`${data}\n`, (err) => {
      if (err) logger.error(err);
    });
  });

  events.on("hardware:restart", ({ hardwarePath }) => {
    if (hardwarePath === path) {
      logger.info(`restarting ${path}`);
      port.set({ dtr: false }, () => {
        port.flush(() => {
          setTimeout(() => {
            port.set({ dtr: true }, () => {
              port.flush(() => {
                logger.info(`restarted ${path}`);
              });
            });
          }, 1000);
        });
      });
    }
  });

  logger.info("Service started");
}
