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
  target: string;
  value: number;
  expiresIn: string;
}

export interface RuleInput {
  rule: string;
}

export const defaultRule = `
  const rules = new Map();

  rules;
`;
