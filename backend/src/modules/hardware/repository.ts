import sql from "sql-template-strings";
import { Database } from "../../database";
import { Hardware } from "./hardware";

export interface HardwareRepositoryDependencies {
  database: Database;
}

export function buildHardwareRepository({
  database,
}: HardwareRepositoryDependencies) {
  async function upsertHardware(hardware: Pick<Hardware, "path" | "type">) {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        insert into "hardware" ("path", "name", "type") 
        values
          (${hardware.path}, ${hardware.path}, ${hardware.type})
        on conflict ("path") do nothing
      `);
    });
  }

  async function setHardwareName(hardware: Hardware) {
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

  async function listHardware() {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<Hardware>(sql`
        select * from "hardware"
      `);

      return data.rows;
    });
  }

  return {
    upsertHardware,
    setHardwareName,
    listHardware,
  };
}
