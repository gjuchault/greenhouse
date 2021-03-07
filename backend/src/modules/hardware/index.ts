import { Router } from "express";
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
    const hardware = repository.listHardware();

    res.status(200).json(hardware).end();
  });

  logger.info("Service started");
}
