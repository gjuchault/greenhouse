export interface Hardware {
  path: string;
  name: string;
  type: "arduino" | "rfxcom";
  restartIfNoValueFor?: number;
  lastStatement?: string;
}
