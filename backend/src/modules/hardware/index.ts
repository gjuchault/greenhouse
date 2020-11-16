import { createRfxcom, isUsbDeviceRfxcom } from "./rfxcom";
import { createArduino, isUsbDeviceArduino } from "./arduino";
import { createLogger } from "../../logger";
import { GreenhouseEvents } from "../../events";
import { listUsbPorts } from "./serialport";

export interface HardwareDependencies {
  events: GreenhouseEvents;
}

export async function createHardware({ events }: HardwareDependencies) {
  const logger = createLogger("hardware");

  logger.info("Starting service...");

  const ports = await listUsbPorts();
  const usbPortPathRegexp = /usb|acm|^com/i;

  const usbPorts = ports.filter((port) => usbPortPathRegexp.test(port.path));

  const arduinos = usbPorts.filter((port) => isUsbDeviceArduino(port));
  const rfxcoms = usbPorts.filter((port) => isUsbDeviceRfxcom(port));

  logger.info(`Listed ${arduinos.length} arduinos`);

  for (const port of arduinos) {
    await createArduino(port.path, { logger: createLogger("arduino"), events });
  }

  for (const port of rfxcoms) {
    await createRfxcom(port.path, { logger: createLogger("rfxcom"), events });
  }

  logger.info("Service started");
}
