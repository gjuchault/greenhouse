import { Router } from "express";
import ms from "ms";
import { Logger } from "winston";
import * as z from "zod";
import { Database } from "../../database";
import { GreenhouseEvents } from "../../events";
import { isDateValid, isMsValid } from "../../helpers/refinements";
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
  listActionable(target: string): Promise<Actionable | undefined>;
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
  listActionable,
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
  setInterval(executeRules, 1000);

  router.get("/api/rule", ensureAuth, async (req, res) => {
    const rule = await repository.listRule();

    res.status(200).json({ rule }).end();
  });

  router.post("/api/rule", ensureAuth, async (req, res) => {
    const commandInputSchema = z.object({
      rule: z.string(),
    });

    const result = commandInputSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    await repository.updateRule(result.data);

    res.status(204).end();
  });

  router.get("/api/commands", ensureAuth, async (req, res) => {
    const commands = await repository.listCommands();

    res.status(200).json(Array.from(commands)).end();
  });

  router.post("/api/commands", ensureAuth, async (req, res) => {
    const commandInputSchema = z.object({
      target: z.string(),
      value: z.number(),
      expiresIn: z.string().refine(isMsValid, {
        message: "String should be a valid ms string",
      }),
    });

    const result = commandInputSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    const actionable = await listActionable(result.data.target);

    if (!actionable) {
      return;
    }

    const now = Date.now();
    const expiresIn = ms(result.data.expiresIn);

    await repository.createCommand({
      ...result.data,
      expiresAt: new Date(now + expiresIn).toISOString(),
    });

    events.emit("command:send", {
      target: result.data.target,
      value: result.data.value.toString(),
    });

    setTimeout(() => {
      events.emit("command:send", {
        target: result.data.target,
        value: actionable.valueType.default.toString(),
      });
    }, expiresIn);

    logger.info(`Created a command`);

    res.status(204).end();
  });

  logger.info("Service started");
}
