export interface Command {
  kind: "command";
  id: string;
  target: string;
  value: number;
  expiresAt: Date;
}

export interface CustomRule {
  kind: "customRule";
  content: string;
}

export type Rule = Command | CustomRule;

export interface CommandInput {
  target: string;
  value: number;
  expiresAt: string;
}

export interface RuleInput {
  rule: string;
}

export const defaultRule = `
  const rules = new Map();

  rules;
`;
