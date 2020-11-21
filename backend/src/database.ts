import pg from "pg";
import { ono } from "ono";
import { Logger } from "winston";
import { config } from "./config";

interface DatabaseDependencies {
  logger: Logger;
}

export interface Database {
  getDatabaseClient(): Promise<pg.PoolClient>;
  runInDatabaseClient<TResult>(
    callback: (client: pg.PoolClient) => Promise<TResult>
  ): Promise<TResult>;
  safelyRunInFreshDatabaseConnection(
    callback: (client: pg.Client) => Promise<void>
  ): Promise<void>;
}

const databaseConfig = {
  host: config.database.host,
  port: config.database.port,
  user: config.database.username,
  password: config.database.password,
  database: config.database.name,
};

export async function createDatabase({
  logger,
}: DatabaseDependencies): Promise<Database> {
  logger.info("Connecting...");

  const pool = new pg.Pool({
    ...databaseConfig,
    max: 25,
    min: 2,
  });

  try {
    const client = await getDatabaseClient();
    await client.query<{ healthcheck: number }>("select 1 as healthcheck");
    client.release();
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  logger.info(`Connected.`);

  async function getDatabaseClient() {
    if (!pool) {
      throw ono("DB was not initialized");
    }

    const client = await pool.connect();

    return client;
  }

  async function runInDatabaseClient<TResult>(
    callback: (client: pg.PoolClient) => Promise<TResult>
  ) {
    const client = await getDatabaseClient();

    try {
      await client.query("begin");
      const result = await callback(client);
      await client.query("commit");

      return result;
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
  }

  async function safelyRunInFreshDatabaseConnection(
    callback: (client: pg.Client) => Promise<void>
  ) {
    const client = new pg.Client(databaseConfig);

    try {
      await client.connect();
      await callback(client);
    } catch (err) {
      logger.debug("Could not connect to database");
    }
  }

  return {
    getDatabaseClient,
    runInDatabaseClient,
    safelyRunInFreshDatabaseConnection,
  };
}
