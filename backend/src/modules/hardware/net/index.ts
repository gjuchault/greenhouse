import { Logger } from "winston";
import { createServer } from "net";
import { config } from "../../../config";
import { GreenhouseEvents } from "../../../events";
import { Hardware } from "../hardware";
import { decodeGreenhouseStatement } from "../greenhouseProtocol";

export interface NetDependencies {
  events: GreenhouseEvents;
  logger: Logger;
}

export async function createNet({ logger, events }: NetDependencies) {
  logger.info("Starting net server...");

  const server = createServer((socket) => {
    logger.info("Socket connected");

    socket.on("data", (line) => {
      const numericValue = parseInt(line.toString(), 2);
      const { sensorId, value } = decodeGreenhouseStatement(numericValue);

      logger.debug(`net:entry (sensor: ${sensorId} value: ${value})`);
      events.emit("net:entry", {
        sensorId,
        value,
      });
    });
  });

  const address = config.net.address ?? "0.0.0.0";
  const port = config.net.port ?? "6657";

  return new Promise<void>((resolve) => {
    server.listen(port, address, () => {
      logger.info(`Listening on http://${address}:${port}`);
      resolve();
    });
  });
}
