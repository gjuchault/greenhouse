import { inputDateStringToDate } from "../../helpers/date";

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

export const actionableNamePattern = /^[a-z0-9-_]+$/i;
export const actionableTargetPattern = /^[0-9]+$/;

export interface ActionableInput {
  target: string;
  name: string;
  valueType: {
    range: "0-1" | "1-1024";
    default: number;
  };
}

export interface CommandInput {
  target: string;
  value: number;
  expiresAt: string;
}

export const commandInputValuePattern = /^[0-9]+$/;

export function isExpiresAtValid(input: string): boolean {
  const date = inputDateStringToDate(input);

  if (!date) {
    return false;
  }

  if (isNaN(date.getTime())) {
    return false;
  }

  if (date <= new Date()) {
    return false;
  }

  return true;
}

export function isValidActionableRange(input: any): input is "0-1" | "1-1024" {
  return ["0-1", "1-1024"].includes(input);
}
