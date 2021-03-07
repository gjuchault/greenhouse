export interface Hardware {
  path: string;
  name: string;
  type: "arduino" | "rfxcom";
}

export const hardwareNamePattern = /^[a-z0-9-_ ]+$/i;
