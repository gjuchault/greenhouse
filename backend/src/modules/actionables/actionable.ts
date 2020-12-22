export interface Actionable {
  id: string;
  target: string;
  name: string;
  valueType: {
    range: "0-1" | "1-1024";
    default: number;
  };
  lastAction?: {
    value: number;
    sentAt: string;
  };
}

export const actionableNameRegex = /^[a-z0-9-_]+$/i;
export const actionableTargetRegex = /^[0-9]+$/i;

export interface ActionableInput {
  target: string;
  name: string;
  valueType: {
    range: "0-1" | "1-1024";
    default: number;
  };
}
