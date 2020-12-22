import { Router } from "express";
import { Logger } from "winston";
import * as z from "zod";
import { Database } from "../../database";
import { buildActionablesRepository } from "./repository";
import { EnsureAuthMiddleware } from "../auth";
import { isUuidValid } from "../../helpers/refinements";

export * from "./actionable";

export interface ActionablesDependencies {
  router: Router;
  logger: Logger;
  database: Database;
  ensureAuth: EnsureAuthMiddleware;
}

export async function createActionables({
  router,
  logger,
  database,
  ensureAuth,
}: ActionablesDependencies) {
  logger.info("Starting service...");

  const repository = buildActionablesRepository({ database });

  router.get("/api/actionables", ensureAuth, async (req, res) => {
    const actionables = await repository.listActionables();

    res.status(200).json(Array.from(actionables)).end();
  });

  router.post("/api/actionables", ensureAuth, async (req, res) => {
    const actionableInputSchema = z.object({
      target: z.string(),
      name: z.string(),
      valueType: z.object({
        range: z.union([z.literal("0-1"), z.literal("1-1024")]),
        default: z.number(),
      }),
    });

    const result = actionableInputSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    const actionable = await repository.createActionable(result.data);
    logger.info(`Created actionable ${actionable.id}`);

    res.status(204).end();
  });

  router.put("/api/actionables/:id", ensureAuth, async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().refine(isUuidValid, {
        message: "String should be an uuid",
      }),
    });

    const paramsResult = paramsSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json(paramsResult.error).end();
    }

    const actionableInputSchema = z.object({
      id: z.string(),
      target: z.string(),
      name: z.string(),
      valueType: z.object({
        range: z.union([z.literal("0-1"), z.literal("1-1024")]),
        default: z.number(),
      }),
    });

    const result = actionableInputSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    await repository.updateActionable(result.data);
    res.status(204).end();
  });

  router.delete("/api/actionables/:id", ensureAuth, async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().refine(isUuidValid, {
        message: "String should be an uuid",
      }),
    });

    const result = paramsSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    await repository.removeActionable(result.data.id);
    res.status(204).end();
  });

  logger.info("Service started");

  return {
    listActionables: repository.listActionables,
    setLastActionablesValues: repository.setLastActionablesValues,
  };
}
