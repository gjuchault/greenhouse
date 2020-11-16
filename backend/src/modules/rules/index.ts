import { Router } from "express";
import { Logger } from "winston";
import * as z from "zod";
import { Database } from "../../database";
import { GreenhouseEvents } from "../../events";
import { isDateValid } from "../../helpers/refinements";
import { Actionable } from "../actionables";
import { EnsureAuthMiddleware } from "../auth";
import { Sensor } from "../sensors/sensor";
import { buildExecuteRules } from "./executeRules";
import { buildRulesRepository } from "./repository";
import { Command, CustomRule } from "./rule";

export interface RulesDependencies {
  router: Router;
  logger: Logger;
  events: GreenhouseEvents;
  database: Database;
  ensureAuth: EnsureAuthMiddleware;
  listSensors(): Promise<Map<string, Sensor>>;
  listActionables(): Promise<Map<string, Actionable>>;
  setLastActionablesValues(lastValues: Map<string, string>): Promise<void>;
}

export async function createRules({
  router,
  logger,
  events,
  database,
  ensureAuth,
  listSensors,
  listActionables,
  setLastActionablesValues,
}: RulesDependencies) {
  logger.info("Starting service...");

  const repository = buildRulesRepository({ database });

  const executeRules = buildExecuteRules({
    events,
    logger,
    listActionables,
    listCommands: repository.listCommands,
    listRule: repository.listRule,
    listSensors,
    setLastActionablesValues,
  });

  events.on("rules:process", () => executeRules());
  executeRules();
  setInterval(executeRules, 10000);

  router.get("/api/rules", ensureAuth, async (req, res) => {
    const rule = await repository.listRule();
    const commands = await repository.listCommands();

    res
      .status(200)
      .json({ rule, commands: Array.from(commands) })
      .end();
  });

  router.post("/api/rules", ensureAuth, async (req, res) => {
    const commandInputSchema = z.union([
      z.object({
        kind: z.literal("command"),
        target: z.string(),
        value: z.number(),
        expiresIn: z.string().refine(isDateValid, {
          message: "String should be a valid date string",
        }),
      }),
      z.object({
        kind: z.literal("customRule"),
        rule: z.string(),
      }),
    ]);

    const result = commandInputSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    if (result.data.kind === "command") {
      await repository.createCommand(result.data);

      events.emit(
        "command:send",
        result.data.target,
        result.data.value.toString()
      );

      logger.info(`Created a command`);
    } else {
      await repository.updateRule(result.data);
    }

    res.status(204).end();
  });

  logger.info("Service started");
}