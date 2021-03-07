import { Router } from "express";
import * as z from "zod";
import { createRfxcom, isUsbDeviceRfxcom } from "./rfxcom";
import { createArduino, isUsbDeviceArduino } from "./arduino";
import { createLogger } from "../../logger";
import { GreenhouseEvents } from "../../events";
import { listUsbPorts } from "./serialport";
import { buildHardwareRepository } from "./repository";
import { Database } from "../../database";
import { EnsureAuthMiddleware } from "../auth";

export interface HardwareDependencies {
  router: Router;
  events: GreenhouseEvents;
  database: Database;
  ensureAuth: EnsureAuthMiddleware;
}

export async function createHardware({
  router,
  events,
  database,
  ensureAuth,
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
    await createArduino(port.path, { logger: createLogger("arduino"), events });
    await repository.upsertHardware({
      path: port.path,
      type: "arduino",
    });
  }

  for (const port of rfxcoms) {
    await createRfxcom(port.path, { logger: createLogger("rfxcom"), events });
    await repository.upsertHardware({
      path: port.path,
      type: "rfxcom",
    });
  }

  router.get("/api/hardware", ensureAuth, async (req, res) => {
    const hardware = await repository.listHardware();

    res.status(200).json(hardware).end();
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

    events.emit("hardware:restart", result.data.path);

    res.status(204).end();
  });

  logger.info("Service started");
}
