import { NextFunction, Request, Response, Router } from "express";
import { Logger } from "winston";
import * as z from "zod";
import { Database } from "../../database";
import { buildAuthRepository } from "./repository";
import { comparePassword, createToken, isBearerValid } from "./user";

export interface AuthDependencies {
  router: Router;
  logger: Logger;
  database: Database;
}

export type EnsureAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export async function createAuth({
  router,
  logger,
  database,
}: AuthDependencies) {
  logger.info("Starting service...");

  const repository = buildAuthRepository({ database });

  router.post("/api/login", async (req, res) => {
    const bodySchema = z.object({
      user: z.string(),
      password: z.string(),
    });

    const result = bodySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).end();
    }

    const user = await repository.getUserByName(result.data.user);

    if (!user) {
      return res.status(400).end();
    }

    const isLoginSuccessful = await comparePassword({
      hash: user.password,
      password: result.data.password,
    });

    if (!isLoginSuccessful) {
      return res.status(400).end();
    }

    logger.info(`User ${user.name} logged in`);

    res
      .status(200)
      .json({
        outcome: "loggedIn",
        name: user.name,
        token: createToken(user.id),
      })
      .end();
  });

  async function ensureAuth(req: Request, res: Response, next: NextFunction) {
    const bearer = req.headers["authorization"];

    if (!isBearerValid(bearer)) {
      return res.status(401).end();
    }

    return next();
  }

  logger.info("Service started");

  return { ensureAuth };
}
