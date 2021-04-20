import { ono } from "ono";
import sql from "sql-template-strings";
import * as z from "zod";
import { Database } from "../../database";
import { Hardware } from "./hardware";

export interface HardwareRepositoryDependencies {
  database: Database;
}

export function buildHardwareRepository({
  database,
}: HardwareRepositoryDependencies) {
  async function createHardware(hardware: Pick<Hardware, "path" | "type">) {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        insert into "hardware" ("path", "name", "type") 
        values
          (${hardware.path}, ${hardware.path}, ${hardware.type})
        on conflict ("path") do nothing
      `);
    });
  }

  async function setHardwareName(hardware: Pick<Hardware, "path" | "name">) {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        update "hardware"
        set
          "name" = ${hardware.name}
        where
          "path" = ${hardware.path}
      `);
    });
  }

  async function setHardwareLastStatement({
    path,
    lastStatement,
  }: {
    path: string;
    lastStatement: string;
  }) {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        update "hardware"
        set
          "last_statement" = ${lastStatement}
        where
          "path" = ${path}
      `);
    });
  }

  async function getOrCreateHardwareByPath(
    path: string,
    type: Hardware["type"]
  ): Promise<Hardware> {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<Record<string, unknown>>(sql`
        select * from "hardware"
        where "path" = ${path}
        limit 1
      `);

      if (data.rows.length) {
        return decodeHardware(data.rows[0]);
      }

      await client.query<Record<string, unknown>>(sql`
        insert into "hardware"
          ("path", "name", "type", "last_statement", "restart_if_no_value_for")
        values
          (
            ${path},
            ${path},
            ${type},
            null,
            null
          )
        limit 1
      `);

      return { path, type, name: path };
    });
  }

  async function listHardware() {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<Record<string, unknown>>(sql`
        select * from "hardware"
      `);

      return data.rows.map(decodeHardware);
    });
  }

  return {
    createHardware,
    setHardwareName,
    setHardwareLastStatement,
    getOrCreateHardwareByPath,
    listHardware,
  };
}

export function decodeHardware(hardwareFromDatabase: unknown): Hardware {
  const hardwareDatabaseSchema = z.object({
    path: z.string(),
    name: z.string(),
    type: z.union([z.literal("arduino"), z.literal("rfxcom")]),
    last_statement: z.string().nullable(),
    restart_if_no_value_for: z.number().nullable(),
  });

  const result = hardwareDatabaseSchema.safeParse(hardwareFromDatabase);

  if (!result.success) {
    throw ono(`Inconsistency database hardware`, result.error);
  }

  return {
    path: result.data.path,
    name: result.data.name,
    type: result.data.type,
    lastStatement: result.data.last_statement ?? undefined,
    restartIfNoValueFor: result.data.restart_if_no_value_for ?? undefined,
  };
}
