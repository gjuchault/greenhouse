export interface Hardware {
  path: string;
  name: string;
  type: "arduino" | "rfxcom" | "net";
  restartIfNoValueFor?: number;
  lastStatement?: string;
}
