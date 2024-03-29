import { createDatabase } from "./database";
import { createHttpServer } from "./httpServer";
import { createLogger } from "./logger";
import { createEvents } from "./events";
import { createActionables } from "./modules/actionables";
import { createHardware } from "./modules/hardware";
import { createAuth } from "./modules/auth";
import { createRules } from "./modules/rules";
import { createSensors } from "./modules/sensors";
import { createLogs } from "./modules/logs";
const { version } = require("../../package.json");

const logger = createLogger("app");
const events = createEvents();

async function main() {
  logger.info(`Greenhouse v${version} starting...`);

  const httpServer = await createHttpServer({
    logger: createLogger("http"),
  });

  const database = await createDatabase({
    logger: createLogger("database"),
  });

  const auth = await createAuth({
    router: httpServer.router,
    database,
    logger: createLogger("rules"),
  });

  const actionables = await createActionables({
    router: httpServer.router,
    database,
    logger: createLogger("actionables"),
    ensureAuth: auth.ensureAuth,
  });

  const sensors = await createSensors({
    router: httpServer.router,
    database,
    events,
    logger: createLogger("sensors"),
    ensureAuth: auth.ensureAuth,
  });

  const rules = await createRules({
    router: httpServer.router,
    database,
    events,
    logger: createLogger("rules"),
    ensureAuth: auth.ensureAuth,
    listSensors: sensors.listSensors,
    listActionable: actionables.listActionable,
    listActionables: actionables.listActionables,
    setLastActionablesValues: actionables.setLastActionablesValues,
  });

  const hardware = await createHardware({
    router: httpServer.router,
    events,
    database,
    ensureAuth: auth.ensureAuth,
    getStatementsByIds: sensors.getStatementsByIds,
  });

  const logs = await createLogs({
    router: httpServer.router,
    events,
    logger: createLogger("rules"),
    ensureAuth: auth.ensureAuth,
  });

  async function shutdown() {
    logger.info(`Greenhouse v${version} gracefully shutting down...`);

    await httpServer.end();

    logger.info(`Greenhouse v${version} gracefully shut down`);
  }

  process.on("SIGINT", async () => {
    await shutdown();
    process.exit(0);
  });

  logger.info(`Greenhouse v${version} ready.`);
}

process.on("uncaughtException", (err) => {
  logger.error(err);
});

process.on("unhandledRejection", (err) => {
  logger.error(err);
});

main();
