import { SerialPort } from "serialport";

type PortInfoArray = Awaited<ReturnType<typeof SerialPort.list>>;
export type PortInfo = PortInfoArray[number];

export async function listUsbPorts() {
  const ports = await SerialPort.list();
  const usbPortPathRegexp = /usb|acm|^com/i;
  const usbPorts = ports.filter((port) => usbPortPathRegexp.test(port.path));

  return usbPorts;
}

export async function openPort(path: string) {
  return new Promise<SerialPort>((resolve, reject) => {
    const port = new SerialPort(
      {
        path,
        baudRate: 115200,
      },
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(port);
      }
    );
  });
}
