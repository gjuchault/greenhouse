import { Logger } from "winston";
import rfxcom from "rfxcom";
import { GreenhouseEvents } from "../../../events";
import { decodeGreenhouseStatement } from "../greenhouseProtocol";
import { Hardware } from "../hardware";

export * from "./device";

export interface RfxcomDependencies {
  events: GreenhouseEvents;
  logger: Logger;
}

export async function createRfxcom(
  path: string,
  hardware: Hardware,
  { logger, events }: RfxcomDependencies
) {
  logger.info(`Starting rfxcom on ${path}...`);

  const rfxtrx = await open(path);
  const lightning4Type = 0x13;

  rfxtrx.on("receive", (buf: number[]) => {
    if (buf[0] + 1 !== buf.length) {
      logger.error(
        `Invalid packet received (invalid length): ${buf.join(";")}`
      );
      return;
    }

    if (buf[1] !== lightning4Type) {
      logger.error(
        `Invalid packet received (not lightning4): ${buf.join(";")}`
      );
      return;
    }

    const line = buf
      .slice(4, -3)
      .map((n) => n.toString(2).padStart(8, "0"))
      .join("");

    const numericValue = parseInt(line, 2);

    const { sensorId, value } = decodeGreenhouseStatement(numericValue);

    logger.debug(`radio:entry (sensor: ${sensorId} value: ${value})`);
    events.emit("radio:entry", {
      sensorId,
      hardwarePath: hardware.path,
      value,
    });
  });

  logger.info("Service started");
}

async function open(path: string) {
  return new Promise<any>((resolve, reject) => {
    const rfxtrx = new rfxcom.RfxCom(path, { debug: false });
    rfxtrx.initialise(() => {
      resolve(rfxtrx);
    });

    rfxtrx.on("connectfailed", (err: string) => {
      reject(new Error(err));
    });

    rfxtrx.on("disconnect", (err: string) => {
      reject(new Error(err));
    });
  });
}
