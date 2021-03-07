import * as z from "zod";
import sql from "sql-template-strings";
import { v4 as uuid } from "uuid";
import { ono } from "ono";
import { Database } from "../../database";
import { keyByWith } from "../../helpers/iterables";
import { Actionable, ActionableInput } from "./actionable";

export interface ActionablesRepositoryDependencies {
  database: Database;
}

export function buildActionablesRepository({
  database,
}: ActionablesRepositoryDependencies) {
  async function listActionables() {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<{
        id: string;
        target: string;
        name: string;
        value: "0-1" | "1-1024";
        default_value: string;
        last_value: string;
        last_value_sent_at: string;
      }>(sql`
        select * from "actionables"
      `);

      return keyByWith(
        data.rows,
        (rawActionable) => rawActionable.target,
        decodeActionable
      );
    });
  }

  async function createActionable(
    actionableInput: ActionableInput
  ): Promise<Actionable> {
    return await database.runInDatabaseClient(async (client) => {
      const id = uuid();

      await client.query(sql`
        insert into "actionables"("id", "target", "name", "value", "default_value")
        values (
          ${id},
          ${actionableInput.target},
          ${actionableInput.name},
          ${actionableInput.valueType.range},
          ${actionableInput.valueType.default}
        )
      `);

      return {
        id,
        ...actionableInput,
      };
    });
  }

  async function removeActionable(actionableId: string): Promise<void> {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        delete from "actionables"
        where "id" = ${actionableId}
      `);
    });
  }

  async function updateActionable(actionable: Actionable): Promise<void> {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        update "actionables"
        set 
          "target" = ${actionable.target},
          "name" = ${actionable.name},
          "value" = ${actionable.valueType.range},
          "default_value" = ${actionable.valueType.default}
         where "id" = ${actionable.id}
      `);
    });
  }

  async function setLastActionablesValues(
    lastValues: Map<string, string>
  ): Promise<void> {
    const now = new Date().toISOString();

    return await database.runInDatabaseClient(async (client) => {
      for (const [target, value] of lastValues) {
        await client.query(sql`
          update "actionables" set
            "last_value" = ${value},
            "last_value_sent_at" = ${now}
          where "target" = ${target}
        `);
      }
    });
  }

  return {
    listActionables,
    createActionable,
    removeActionable,
    updateActionable,
    setLastActionablesValues,
  };
}

export function decodeActionable(actionableFromDatabase: unknown): Actionable {
  const actionableDatabaseSchema = z.object({
    id: z.string(),
    target: z.string(),
    name: z.string(),
    value: z.union([z.literal("0-1"), z.literal("1-1024")]),
    default_value: z.number(),
    last_value: z.number().nullable(),
    last_value_sent_at: z.date().nullable(),
  });

  const result = actionableDatabaseSchema.safeParse(actionableFromDatabase);

  if (!result.success) {
    throw ono(`Inconsistency database actionable`, result.error);
  }

  const lastAction =
    result.data.last_value && result.data.last_value_sent_at
      ? {
          value: result.data.last_value,
          sentAt: new Date(result.data.last_value_sent_at).toISOString(),
        }
      : undefined;

  return {
    id: result.data.id,
    target: result.data.target,
    name: result.data.name,
    valueType: {
      range: result.data.value,
      default: result.data.default_value,
    },
    lastAction,
  };
}
