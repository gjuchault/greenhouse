import { Router } from "express";
import { Logger } from "winston";
// import { createServer } from "net";
// import { config } from "../../../config";
import { GreenhouseEvents } from "../../../events";
// import { decodeGreenhouseStatement } from "../greenhouseProtocol";

export interface TtnDependencies {
  router: Router;
  events: GreenhouseEvents;
  logger: Logger;
}

export async function createTtn({ router, logger, events }: TtnDependencies) {
  logger.info("Starting ttn listener...");

  router.post("/api/ttn", (req, res) => {
    logger.info(req.body);
    res.status(204).end();
  });

  logger.info(`Listening on /api/ttn`);
}
