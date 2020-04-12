import { createNanoEvents, Emitter } from "nanoevents";
import SerialPort from "serialport";
import Delimiter from "@serialport/parser-delimiter";

interface ArduinoEvents {
  line: (data: string) => void;
}

export type Arduino = Emitter<ArduinoEvents>;

const rport = /usb|acm|^com/i;

export function buildListenArduino() {
  async function find() {
    const result = await SerialPort.list();

    const ports = result.filter((val) => {
      // Match only ports that Arduino cares about
      // ttyUSB#, cu.usbmodem#, COM#
      if (!rport.test(val.path)) {
        return false;
      }

      return true;
    });

    if (!ports.length) {
      return;
    }

    return ports[0].path;
  }

  async function open(path: string) {
    return new Promise<SerialPort>((resolve, reject) => {
      const port = new SerialPort(
        path,
        {
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

  async function listen() {
    const path = await find();
    if (!path) {
      throw new Error("No SerialPort found");
    }

    const port = await open(path);

    const emitter = createNanoEvents<ArduinoEvents>();
    const parser = port.pipe(new Delimiter({ delimiter: "\n" }));
    parser.on("data", (buf: Buffer) => emitter.emit("line", buf.toString()));

    return emitter;
  }

  return listen;
}
