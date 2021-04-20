import * as z from "zod";
import sql from "sql-template-strings";
import { v4 as uuid } from "uuid";
import { ono } from "ono";
import { Database } from "../../database";
import { keyByWith } from "../../helpers/iterables";
import { Sensor, SensorInput, Statement, StatementInput } from "./sensor";

export interface SensorsRepositoryDependencies {
  database: Database;
}

export function buildSensorsRepository({
  database,
}: SensorsRepositoryDependencies) {
  async function listSensors() {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<{
        id: string;
        sensor: string;
        name: string;
        min: number;
        max: number;
        value?: string;
        date?: number;
        source?: string;
      }>(sql`
        select
          "emitter_sensors"."id",
          "emitter_sensors"."sensor",
          "emitter_sensors"."name",
          "emitter_sensors"."min",
          "emitter_sensors"."max",
          "statement"."value",
          "statement"."date",
          "statement"."source"
        from "emitter_sensors"
        left join "statement"
          on "statement"."id" = "emitter_sensors"."last_statement"
      `);

      return keyByWith(
        data.rows,
        (rawSensor) => rawSensor.sensor,
        decodeSensor
      );
    });
  }

  async function getStatementsByIds(
    statementIds: string[]
  ): Promise<Map<string, Statement>> {
    return await database.runInDatabaseClient(async (client) => {
      const data = await client.query<{
        id: string;
        sensor: string;
        value: string;
        date: number;
        source: string;
      }>(sql`
        select
          "statement"."id",
          "statement"."sensor",
          "statement"."value",
          "statement"."date",
          "statement"."source"
        from "statement"
        where "id" = any(${statementIds})
      `);

      return keyByWith(
        data.rows,
        (rawStatement) => rawStatement.sensor,
        decodeStatement
      );
    });
  }

  async function createSensor(sensorInput: SensorInput): Promise<Sensor> {
    return await database.runInDatabaseClient(async (client) => {
      const id = uuid();

      await client.query(sql`
        insert into "emitter_sensors"("id", "sensor", "name", "min", "max")
        values (
          ${id},
          ${sensorInput.sensor},
          ${sensorInput.name},
          ${sensorInput.range.min},
          ${sensorInput.range.max}
        )
      `);

      return {
        id,
        ...sensorInput,
      };
    });
  }

  async function removeSensor(sensorId: string): Promise<void> {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        delete from "emitter_sensors"
        where "id" = ${sensorId}
      `);
    });
  }

  async function updateSensor(sensor: Sensor): Promise<void> {
    return await database.runInDatabaseClient(async (client) => {
      await client.query(sql`
        update "emitter_sensors"
        set
          "sensor" = ${sensor.sensor},
          "name" = ${sensor.name},
          "min" = ${sensor.range.min},
          "max" = ${sensor.range.max}
        where "id" = ${sensor.id}
      `);
    });
  }

  async function addSensorStatement(
    statementInput: StatementInput
  ): Promise<string> {
    const id = uuid();

    await database.safelyRunInFreshDatabaseConnection(async (client) => {
      await client.query(sql`
        insert into "statement"("id", "sensor", "value", "date", "source")
        values (
          ${id},
          ${statementInput.sensorId},
          ${statementInput.value},
          ${statementInput.date},
          ${statementInput.source}
        )
      `);

      await client.query(sql`
        update "emitter_sensors"
          set "last_statement" = ${id}
        where
          "sensor" = ${statementInput.sensorId}
      `);
    });

    return id;
  }

  return {
    listSensors,
    getStatementsByIds,
    createSensor,
    updateSensor,
    removeSensor,
    addSensorStatement,
  };
}

export function decodeSensor(sensorFromDatabase: unknown): Sensor {
  const sensorDatabaseSchema = z.object({
    id: z.string(),
    sensor: z.string(),
    name: z.string(),
    min: z.number(),
    max: z.number(),
    value: z.string().nullable(),
    date: z.date().nullable(),
    source: z.string().nullable(),
  });

  const result = sensorDatabaseSchema.safeParse(sensorFromDatabase);

  if (!result.success) {
    throw ono(`Inconsistency database sensor`, result.error);
  }

  return {
    id: result.data.id,
    sensor: result.data.sensor,
    name: result.data.name,
    range: {
      min: Number(result.data.min),
      max: Number(result.data.max),
    },
    lastStatement:
      result.data.value && result.data.date && result.data.source
        ? {
            value: result.data.value,
            sentAt: new Date(result.data.date).toISOString(),
            source: result.data.source,
          }
        : undefined,
  };
}

export function decodeStatement(statementFromDatabase: unknown): Statement {
  const statementDatabaseSchema = z.object({
    id: z.string(),
    sensor: z.string(),
    value: z.string(),
    date: z.date(),
    source: z.string(),
  });

  const result = statementDatabaseSchema.safeParse(statementFromDatabase);

  if (!result.success) {
    throw ono(`Inconsistency database statement`, result.error);
  }

  return {
    id: result.data.id,
    sensorId: result.data.sensor,
    value: result.data.value,
    date: new Date(result.data.date).toISOString(),
    source: result.data.source,
  };
}
