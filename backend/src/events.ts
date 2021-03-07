import { createNanoEvents, Emitter } from "nanoevents";

type Events = {
  "command:send": (target: string, value: string) => void;
  "arduino:entry": (sensorId: string, value: string) => void;
  "radio:entry": (sensorId: string, value: string) => void;
  "hardware:restart": (hardwarePath: string) => void;
  "rules:process": () => void;
};

export type GreenhouseEvents = Emitter<Events>;

export const createEvents = () => createNanoEvents<Events>();
