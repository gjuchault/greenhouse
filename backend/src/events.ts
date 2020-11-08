import { createNanoEvents } from "nanoevents";

type Events = {
  "command:send": (target: string, value: string) => void;
  "rules:new": () => void;
  "arduino:line": (line: string) => void;
  "arduino:entry": (sensorId: string, value: string) => void;
  "radio:line": (line: string) => void;
  "radio:entry": (sensorId: string, value: string) => void;
};

export const events = createNanoEvents<Events>();
