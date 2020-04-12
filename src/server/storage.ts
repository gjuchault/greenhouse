import { v4 as uuid } from "uuid";
import { Client } from "pg";

interface StatementEntry {
  sensorId: string;
  value: string;
}

export type SensorsConfig = {
  id: string;
  name: string;
  index: number;
}[];

const sendEvery = 1000 * 60;

export function buildStorage() {
  const db = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  });

  let lastEntry = 0;

  async function connect() {
    await db.connect();
  }

  async function getSensors() {
    const { rows } = await db.query(
      `
        select
            id,
            name,
            index
        from sensor
      `
    );

    return rows
      .map((row) => ({
        id: row.id as string,
        name: row.name as string,
        index: Number(row.index) as number,
      }))
      .sort((left, right) => left.index - right.index);
  }

  async function postStatement(entries: StatementEntry[]) {
    const statementId = uuid();
    const now = Date.now();

    if (now - lastEntry <= sendEvery) {
      return;
    }

    lastEntry = now;

    try {
      await db.query("begin");
      await db.query(`insert into statement (id) values ($1)`, [statementId]);

      await Promise.all(
        entries.map(async (entry) => {
          await db.query(
            `
              insert into statement_sensor (statement_id, sensor_id, value)
              values ($1, $2, $3)
            `,
            [statementId, entry.sensorId, entry.value]
          );
        })
      );

      await db.query("commit");
    } catch (err) {
      await db.query("rollback");
      throw err;
    }
  }

  return {
    connect,
    getSensors,
    postStatement,
  };
}
