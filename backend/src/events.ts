import { createNanoEvents, Emitter } from "nanoevents";

type Events = {
  "rule:updateActionable": (_: { target: string; value: string }) => void;
  "command:send": (_: { target: string; value: string }) => void;
  "arduino:entry": (_: {
    sensorId: string;
    hardwarePath: string;
    value: string;
  }) => void;
  "net:entry": (_: { sensorId: string; value: string }) => void;
  "radio:entry": (_: {
    sensorId: string;
    hardwarePath: string;
    value: string;
  }) => void;
  "hardware:lastStatement": (_: {
    hardwarePath: string;
    statementId: string;
  }) => void;
  "hardware:restart": (_: { hardwarePath: string }) => void;
  "rules:process": () => void;
};

export type GreenhouseEvents = Emitter<Events>;

export const createEvents = () => createNanoEvents<Events>();
