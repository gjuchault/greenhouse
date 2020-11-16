import { PortInfo } from "serialport";

const rfxcomManufacturer = ["rfxcom"];

export function isUsbDeviceRfxcom(device: PortInfo) {
  return rfxcomManufacturer.includes(device.manufacturer?.toLowerCase() || "");
}
