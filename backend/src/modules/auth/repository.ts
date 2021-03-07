import sql from "sql-template-strings";
import { Database } from "../../database";
import { User } from "./user";

export interface AuthRepositoryDependencies {
  database: Database;
}

export function buildAuthRepository({ database }: AuthRepositoryDependencies) {
  async function getUserByName(name: string) {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<User>(sql`
        select *
        from "user"
        where "name" = ${name}
      `);

      if (data.rows.length !== 1) {
        return;
      }

      return data.rows[0];
    });
  }

  return {
    getUserByName,
  };
}
