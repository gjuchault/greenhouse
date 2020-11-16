export interface Actionable {
  id: string;
  target: string;
  name: string;
  valueType: {
    range: "0-1" | "1-1024";
    default: string;
  };
  lastAction?: {
    value: string;
    sentAt: string;
  };
}

export interface ActionableInput {
  target: string;
  name: string;
  valueType: {
    range: "0-1" | "1-1024";
    default: string;
  };
}

export function isValidActionableRange(input: any): input is "0-1" | "1-1024" {
  return ["0-1", "1-1024"].includes(input);
}
