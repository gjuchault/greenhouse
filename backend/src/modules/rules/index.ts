import { Router } from "express";
import { Logger } from "winston";
import * as z from "zod";
import { Database } from "../../database";
import { isDateValid } from "../../helpers/refinements";
import { EnsureAuthMiddleware } from "../auth";
import { buildRulesRepository } from "./repository";

export interface RulesDependencies {
  router: Router;
  logger: Logger;
  database: Database;
  ensureAuth: EnsureAuthMiddleware;
}

export async function createRules({
  router,
  logger,
  database,
  ensureAuth,
}: RulesDependencies) {
  logger.info("Starting service...");

  const repository = buildRulesRepository({ database });

  router.get("/api/rules", ensureAuth, async (req, res) => {
    const rule = await repository.listRule();
    const commands = await repository.listCommands();

    res
      .status(200)
      .json([rule, ...commands])
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
      logger.info(`Created a command`);
    } else {
      await repository.updateRule(result.data);
    }

    res.status(204).end();
  });

  logger.info("Service started");
}
