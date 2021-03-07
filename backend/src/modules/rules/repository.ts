import * as z from "zod";
import sql from "sql-template-strings";
import { v4 as uuid } from "uuid";
import { ono } from "ono";
import { Database } from "../../database";
import {
  Command,
  CommandInput,
  CustomRule,
  defaultRule,
  RuleInput,
} from "./rule";
import { keyByWith } from "../../helpers/iterables";

export interface RulesRepositoryDependencies {
  database: Database;
}

export function buildRulesRepository({
  database,
}: RulesRepositoryDependencies) {
  async function listRule(): Promise<CustomRule> {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<{
        rule: string;
      }>(sql`
        select * from rules
        limit 1
      `);

      return decodeRule(data.rows[0]);
    });
  }

  async function updateRule(ruleInput: RuleInput): Promise<void> {
    return await database.runInDatabaseClient(async (client) => {
      const existingRule = await client.query<{ count: number }>(sql`
        select count(1) as count from rules
      `);

      if (Number(existingRule.rows[0].count) > 0) {
        await client.query(sql`
          update rules
          set rule = ${ruleInput.rule}
        `);

        return;
      }

      await client.query(sql`
        insert into rules(id, rule, priority)
        values (${uuid()}, ${ruleInput.rule}, 1)
      `);
    });
  }

  async function listCommands() {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<{
        id: string;
        target: string;
        value: string;
        expires_at: number;
      }>(sql`
        select id, target, value, expires_at from "commands"
        where expires_at > NOW()
      `);

      return keyByWith(data.rows, (item) => item.id, decodeCommand);
    });
  }

  async function createCommand(commandInput: CommandInput) {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        delete from commands where target=${commandInput.target}
      `);

      await client.query(sql`
        insert into commands(id, target, value, expires_at)
          values (${uuid()}, ${commandInput.target}, ${commandInput.value}, ${
        commandInput.expiresAt
      })
      `);

      await client.query(sql`
        update actionables set
          last_value = ${commandInput.value},
          last_value_sent_at = ${new Date().toISOString()}
        where target = ${commandInput.target}
      `);
    });
  }

  return { listRule, updateRule, listCommands, createCommand };
}

export function decodeCommand(commandFromDatabase: unknown): Command {
  const commandDatabaseSchema = z.object({
    id: z.string(),
    target: z.string(),
    value: z.number(),
    expires_at: z.date(),
  });

  const result = commandDatabaseSchema.safeParse(commandFromDatabase);

  if (!result.success) {
    throw ono(`Inconsistency database command`, result.error);
  }

  return {
    kind: "command",
    id: result.data.id,
    target: result.data.target,
    value: result.data.value,
    expiresAt: result.data.expires_at,
  };
}

export function decodeRule(ruleFromDatabase?: unknown): CustomRule {
  if (!ruleFromDatabase) {
    return {
      kind: "customRule",
      content: defaultRule,
    };
  }

  const ruleDatabaseSchema = z
    .object({
      rule: z.string(),
    })
    .nonstrict();

  const result = ruleDatabaseSchema.safeParse(ruleFromDatabase);

  if (!result.success) {
    throw ono(`Inconsistency database rule`, result.error);
  }

  return {
    kind: "customRule",
    content: result.data.rule,
  };
}
