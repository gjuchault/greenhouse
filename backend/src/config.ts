import path from "path";
import { config as dotenv } from "dotenv";
import * as z from "zod";

dotenv({ path: path.resolve(__dirname, "../.env.local") });
dotenv({ path: path.resolve(__dirname, "../.env") });

const configSchema = z.object({
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  HTTP_PORT: z.string(),
  HTTP_BIND: z.string(),
  JWT_SECRET: z.string(),
});

const env = configSchema.nonstrict().parse(process.env as any);

export const config = {
  secret: env.JWT_SECRET,
  http: {
    address: env.HTTP_BIND,
    port: Number(env.HTTP_PORT),
  },
  database: {
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT),
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    name: env.DATABASE_NAME,
  },
};
