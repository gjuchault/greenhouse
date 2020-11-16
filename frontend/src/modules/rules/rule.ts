export interface Command {
  kind: "command";
  id: string;
  target: string;
  value: number;
  expiresIn: Date;
}

export interface CustomRule {
  kind: "customRule";
  content: string;
}

export type Rule = Command | CustomRule;

export interface CommandInput {
  kind: "command";
  target: string;
  value: string;
  expiresIn: string;
}

export interface CustomRuleInput {
  kind: "customRule";
  rule: string;
}

export type RuleInput = CommandInput | CustomRuleInput;

export function makeGreenhouseTypescriptEnvironment(
  actionables: { name: string }[],
  sensors: { name: string }[]
): string {
  return `
    declare const date: Date;

    declare const Actionables: {
      ${actionables.map(({ name }) => `"${name}": string`).join("\n")}
    }

    declare const Sensors: {
      ${sensors.map(({ name }) => `"${name}": string`).join("\n")}
    }

    interface Sensor {
      id: string;
      sensor: string;
      name: string;
      range: {
        min: number;
        max: number;
      };
      lastStatement?: {
        value: string;
        sentAt: string;
        source: string;
      };
    }

    interface Actionable {
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

    declare const sensors: Map<string, Sensor>;
    declare const actionables: Map<string, Actionable>;
  `;
}
