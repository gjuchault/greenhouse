import { PortInfo } from "serialport";

const arduinoManufacturer = ["1a86", "arduino"];

export function isUsbDeviceArduino(device: PortInfo) {
  return arduinoManufacturer.includes(device.manufacturer?.toLowerCase() || "");
}
