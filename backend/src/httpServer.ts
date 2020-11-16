import { createServer, Server } from "http";
import express, { Request, Response, NextFunction, Router } from "express";
import { Logger } from "winston";
import { createHttpTerminator } from "http-terminator";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { config } from "./config";

export interface HttpServerDependencies {
  logger: Logger;
}

interface HttpServer {
  router: Router;
  server: Server;
  end(): Promise<void>;
}

export async function createHttpServer({ logger }: HttpServerDependencies) {
  logger.info(`Creating server...`);
  const app = express();

  app.set("case sensitive routing", false);
  app.set("strict routing", false);
  app.set("trust proxy", true);
  app.set("x-powered-by", false);

  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json({ limit: "5mb" }));

  const router = express.Router();

  app.use(router);

  app.use(function (err: Error, _: Request, res: Response, __: NextFunction) {
    logger.error(err);

    if (res.headersSent) {
      return;
    }

    return res.status(500).send("Server Error").end();
  });

  const server = createServer(app);
  const terminator = createHttpTerminator({ server });

  const address = config.http.address ?? "0.0.0.0";
  const port = config.http.port ?? 3000;

  return new Promise<HttpServer>((resolve) => {
    server.listen(port, address, () => {
      logger.info(`Listening on http://${address}:${port}`);
      resolve({
        server,
        router,
        async end() {
          await terminator.terminate();
        },
      });
    });
  });
}
