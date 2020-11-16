import { Router } from "express";
import { Logger } from "winston";
import * as z from "zod";
import { Database } from "../../database";
import { GreenhouseEvents } from "../../events";
import { isUuidValid } from "../../helpers/refinements";
import { EnsureAuthMiddleware } from "../auth";
import { buildSensorsRepository } from "./repository";

export interface SensorsDependencies {
  router: Router;
  logger: Logger;
  database: Database;
  events: GreenhouseEvents;
  ensureAuth: EnsureAuthMiddleware;
}

export async function createSensors({
  router,
  logger,
  database,
  events,
  ensureAuth,
}: SensorsDependencies) {
  logger.info("Starting service...");

  const repository = buildSensorsRepository({ database });

  events.on("arduino:entry", async (sensorId: string, value: string) => {
    await repository.addSensorStatement({
      date: new Date().toISOString(),
      source: "arduino",
      sensorId,
      value,
    });

    events.emit("rules:process");
  });

  events.on("radio:entry", async (sensorId: string, value: string) => {
    await repository.addSensorStatement({
      date: new Date().toISOString(),
      source: "radio",
      sensorId,
      value,
    });

    events.emit("rules:process");
  });

  router.get("/api/sensors", ensureAuth, async (req, res) => {
    const sensors = await repository.listSensors();

    res.status(200).json(Array.from(sensors)).end();
  });

  router.post("/api/sensors", ensureAuth, async (req, res) => {
    const sensorInputSchema = z.object({
      sensor: z.string(),
      name: z.string(),
      min: z.number(),
      max: z.number(),
    });

    const result = sensorInputSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    const sensor = await repository.createSensor({
      sensor: result.data.sensor,
      name: result.data.name,
      range: {
        min: result.data.min,
        max: result.data.max,
      },
    });

    logger.info(`Created sensor ${sensor.id}`);

    res.status(204).end();
  });

  router.delete("/api/sensors/:id", ensureAuth, async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().refine(isUuidValid, {
        message: "String should be an uuid",
      }),
    });

    const result = paramsSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    await repository.removeSensor(result.data.id);
    res.status(204).end();
  });

  logger.info("Service started");

  return {
    listSensors: repository.listSensors,
  };
}
