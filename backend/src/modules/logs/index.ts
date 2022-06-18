import { Router } from "express";
import { Logger } from "winston";
import * as z from "zod";
import { GreenhouseEvents } from "../../events";
import { isDateValid } from "../../helpers/refinements";
import { EnsureAuthMiddleware } from "../auth";
import { store, append } from "./store";

export interface RulesDependencies {
  router: Router;
  logger: Logger;
  events: GreenhouseEvents;
  ensureAuth: EnsureAuthMiddleware;
}

export async function createLogs({
  router,
  logger,
  events,
  ensureAuth,
}: RulesDependencies) {
  logger.info("Starting service...");

  events.on("rule:updateActionable", ({ target, value }) =>
    append({ service: "rules", message: `${target} > ${value}` })
  );
  events.on("command:send", ({ target, value }) =>
    append({ service: "command", message: `${target} > ${value}` })
  );
  events.on("arduino:entry", ({ sensorId, value }) =>
    append({ service: "arduino", message: `${sensorId}: ${value}` })
  );
  events.on("radio:entry", ({ sensorId, value }) =>
    append({ service: "radio", message: `${sensorId}: ${value}` })
  );
  events.on("net:entry", ({ sensorId, value }) =>
    append({ service: "net", message: `${sensorId}: ${value}` })
  );

  router.get("/api/logs", ensureAuth, async (req, res) => {
    res.status(200).json(store).end();
  });

  logger.info("Service started");
}
