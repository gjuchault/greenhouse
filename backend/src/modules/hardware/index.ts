import { Router } from "express";
import * as z from "zod";
import { createRfxcom, isUsbDeviceRfxcom } from "./rfxcom";
import { createArduino, isUsbDeviceArduino } from "./arduino";
import { createNet } from "./net";
import { createLogger } from "../../logger";
import { GreenhouseEvents } from "../../events";
import { listUsbPorts } from "./serialport";
import { buildHardwareRepository } from "./repository";
import { Database } from "../../database";
import { EnsureAuthMiddleware } from "../auth";
import { Statement } from "../sensors/sensor";
import { removeHoles } from "../../helpers/removeHoles";

export interface HardwareDependencies {
  router: Router;
  events: GreenhouseEvents;
  database: Database;
  ensureAuth: EnsureAuthMiddleware;
  getStatementsByIds: (
    statementIds: string[]
  ) => Promise<Map<string, Statement>>;
}

export async function createHardware({
  router,
  events,
  database,
  ensureAuth,
  getStatementsByIds,
}: HardwareDependencies) {
  const logger = createLogger("hardware");
  const repository = buildHardwareRepository({ database });

  logger.info("Starting service...");

  const ports = await listUsbPorts();
  const usbPortPathRegexp = /usb|acm|^com/i;

  const usbPorts = ports.filter((port) => usbPortPathRegexp.test(port.path));

  const arduinos = usbPorts.filter((port) => isUsbDeviceArduino(port));
  const rfxcoms = usbPorts.filter((port) => isUsbDeviceRfxcom(port));

  for (const port of arduinos) {
    const hardware = await repository.getOrCreateHardwareByPath(
      port.path,
      "arduino"
    );

    await createArduino(port.path, hardware, {
      logger: createLogger("arduino"),
      events,
    });
    await repository.createHardware({
      path: port.path,
      type: "arduino",
    });
  }

  for (const port of rfxcoms) {
    const hardware = await repository.getOrCreateHardwareByPath(
      port.path,
      "rfxcom"
    );

    await createRfxcom(port.path, hardware, {
      logger: createLogger("rfxcom"),
      events,
    });
    await repository.createHardware({
      path: port.path,
      type: "rfxcom",
    });
  }

  await createNet({ logger: createLogger("net"), events });

  async function getEnrichedHardwares() {
    const hardwares = await repository.listHardware();

    const statementsBySensor = await getStatementsByIds(
      removeHoles(hardwares.map((hardware) => hardware.lastStatement))
    );

    const statementsByStatementId = new Map(
      Array.from(statementsBySensor.values()).map((statement) => [
        statement.id,
        statement,
      ])
    );

    return hardwares.map((hardware) => {
      return {
        ...hardware,
        lastStatement: hardware.lastStatement
          ? statementsByStatementId.get(hardware.lastStatement)
          : undefined,
      };
    });
  }

  async function restartHardwareWithoutRecentData() {
    const hardwares = await getEnrichedHardwares();
    const now = Date.now();

    for (const hardware of hardwares) {
      if (!hardware.lastStatement || !hardware.restartIfNoValueFor) {
        continue;
      }

      if (
        new Date(hardware.lastStatement.date).getTime() +
          hardware.restartIfNoValueFor <
        now
      ) {
        logger.info(
          `Restarting hardware ${hardware.name} (${hardware.path}): last statement is too old (${hardware.lastStatement.date})`
        );
        events.emit("hardware:restart", { hardwarePath: hardware.path });
      }
    }
  }

  restartHardwareWithoutRecentData();

  events.on("hardware:lastStatement", ({ hardwarePath, statementId }) => {
    return repository.setHardwareLastStatement({
      path: hardwarePath,
      lastStatement: statementId,
    });
  });

  router.get("/api/hardware", ensureAuth, async (req, res) => {
    const hardwares = await getEnrichedHardwares();

    res.status(200).json(hardwares).end();
  });

  // Not fully rest because path contains character /
  router.post("/api/hardware/update", ensureAuth, async (req, res) => {
    const hardwareInputSchema = z.object({
      name: z.string(),
      path: z.string(),
    });

    const result = hardwareInputSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    const hardware = await repository.setHardwareName({
      ...result.data,
    });

    res.status(200).json(hardware).end();
  });

  router.post("/api/hardware/restart", ensureAuth, async (req, res) => {
    const hardwareInputSchema = z.object({
      path: z.string(),
    });

    const result = hardwareInputSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(result.error).end();
    }

    events.emit("hardware:restart", { hardwarePath: result.data.path });

    res.status(204).end();
  });

  logger.info("Service started");
}
